import json
import csv
import io
import datetime
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from ..database import get_db, DOCUMENTS_DIR
from ..models import LandRecord, Document, ValidationIssue, AuditLog
from ..validator import LandRecordValidator
from ..seed_data import generate_document_image

router = APIRouter(prefix="/api/records", tags=["records"])

@router.get("")
def list_records(
    search: Optional[str] = None,
    district: Optional[str] = None,
    status: Optional[str] = None,
    document_type: Optional[str] = None,
    land_classification: Optional[str] = None,
    is_flagged: Optional[bool] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
):
    query = db.query(LandRecord)

    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            or_(
                LandRecord.owner_name.ilike(s),
                LandRecord.record_identifier.ilike(s),
                LandRecord.khasra_number.ilike(s),
                LandRecord.khata_number.ilike(s),
                LandRecord.village.ilike(s),
                LandRecord.tehsil.ilike(s),
                LandRecord.district.ilike(s),
            )
        )

    if district:
        query = query.filter(LandRecord.district.ilike(f"%{district}%"))
    if status:
        query = query.filter(LandRecord.status == status)
    if document_type:
        query = query.filter(LandRecord.document_type == document_type)
    if land_classification:
        query = query.filter(LandRecord.land_classification == land_classification)
    if is_flagged is not None:
        query = query.filter(LandRecord.is_flagged == is_flagged)

    total_count = query.count()

    # Sorting
    sort_col = getattr(LandRecord, sort_by, LandRecord.created_at)
    if sort_order.lower() == "asc":
        query = query.order_by(asc(sort_col))
    else:
        query = query.order_by(desc(sort_col))

    records = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": [r.to_dict() for r in records],
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": (total_count + page_size - 1) // page_size if page_size else 1,
    }


@router.post("/check-duplicate")
def check_duplicate_draft(payload: dict, db: Session = Depends(get_db)):
    """Pre-validates draft land entry against sanity rules and existing DB records."""
    # Compute standardized area
    val = float(payload.get("area_value") or 0.0)
    unit = (payload.get("area_unit") or "Acres").lower()
    mult = 1.0
    if "hect" in unit or unit == "ha":
        mult = 2.47105
    elif "bigha" in unit:
        mult = 0.625
    elif "yard" in unit:
        mult = 0.000206612
    elif "guntha" in unit:
        mult = 0.025

    draft_record = {
        "owner_name": payload.get("owner_name", ""),
        "parentage": payload.get("parentage", ""),
        "khasra_number": payload.get("khasra_number", ""),
        "khata_number": payload.get("khata_number", ""),
        "village": payload.get("village", ""),
        "tehsil": payload.get("tehsil", ""),
        "district": payload.get("district", ""),
        "area_value": val,
        "area_acres": round(val * mult, 3),
        "overall_confidence": 98.0,
    }

    status, issues, is_flagged, flag_reason = LandRecordValidator.validate_record(draft_record, db)
    return {
        "status": status,
        "is_flagged": is_flagged,
        "flag_reason": flag_reason,
        "issues": issues,
        "area_acres": round(val * mult, 3),
    }


@router.post("")
def create_land_record(payload: dict, db: Session = Depends(get_db)):
    """
    Registers a new land record submitted by citizen or revenue operator.
    Runs sanity checks, duplicate checks, creates document entity with generated archival deed image, and seals record.
    """
    owner_name = (payload.get("owner_name") or "").strip()
    khasra_number = (payload.get("khasra_number") or "").strip()
    village = (payload.get("village") or "").strip()
    district = (payload.get("district") or "Jaipur").strip()
    tehsil = (payload.get("tehsil") or "Central Division").strip()
    area_value = float(payload.get("area_value") or 0.0)
    area_unit = payload.get("area_unit") or "Acres"

    if not owner_name:
        raise HTTPException(status_code=400, detail="Owner Name is required.")
    if not khasra_number:
        raise HTTPException(status_code=400, detail="Khasra / Survey Number is required.")

    # Calculate standardized area
    mult = 1.0
    unit_lower = area_unit.lower()
    if "hect" in unit_lower or unit_lower == "ha":
        mult = 2.47105
    elif "bigha" in unit_lower:
        mult = 0.625
    elif "yard" in unit_lower:
        mult = 0.000206612
    elif "guntha" in unit_lower:
        mult = 0.025
    area_acres = round(area_value * mult, 3)

    # 1. Generate unique identifier
    rec_count = db.query(LandRecord).count() + 1
    record_identifier = f"LR-{datetime.datetime.now().year}-{rec_count:05d}"
    filename = f"reg_doc_{uuid.uuid4().hex[:8]}.jpg"
    doc_type = payload.get("document_type") or "Jamabandi / RoR"
    reg_date = payload.get("registration_date") or datetime.date.today().isoformat()

    # 2. Render visual deed scan document image
    rel_path = generate_document_image(
        filename=filename,
        title="Official Land Record Registration",
        doc_type=doc_type,
        district=district,
        village=village or "Revenue Mauza",
        owner=owner_name,
        parentage=payload.get("parentage") or "Recorded Titleholder",
        khasra=khasra_number,
        khata=payload.get("khata_number") or "N/A",
        area_str=f"{area_value} {area_unit}",
        classification=payload.get("land_classification") or "Agricultural (Irrigated)",
        year_str=reg_date[:4] if len(reg_date) >= 4 else "2026",
    )

    raw_ocr_text = (
        f"GOVERNMENT REVENUE DEPARTMENT - {district.upper()}\n"
        f"OFFICIAL TITLE SANAD & RECORD OF RIGHTS\n"
        f"Registration / Mutation Date: {reg_date}\n"
        f"District: {district}   Tehsil: {tehsil}   Village / Mauza: {village}\n"
        f"Khata No: {payload.get('khata_number', 'N/A')}   Khasra No: {khasra_number}\n"
        f"Registered Owner: {owner_name}   Parentage: {payload.get('parentage', '')}\n"
        f"Total Area: {area_value} {area_unit} ({area_acres} Acres)\n"
        f"Classification: {payload.get('land_classification', 'Agricultural')}\n"
        f"Applicant Category: {payload.get('applicant_category', 'Individual')}\n"
    )

    # 3. Create Document
    doc = Document(
        filename=filename,
        filepath=rel_path,
        file_type="image/jpeg",
        doc_type=doc_type,
        status="PROCESSED",
        raw_ocr_text=raw_ocr_text,
        uploaded_at=datetime.datetime.utcnow(),
    )
    db.add(doc)
    db.flush()

    # 4. Run Validation and Duplicate Check
    parsed_dict = {
        "owner_name": owner_name,
        "parentage": payload.get("parentage", ""),
        "khasra_number": khasra_number,
        "khata_number": payload.get("khata_number", ""),
        "village": village,
        "tehsil": tehsil,
        "district": district,
        "area_value": area_value,
        "area_acres": area_acres,
        "overall_confidence": 98.5,
    }
    status, issues, is_flagged, flag_reason = LandRecordValidator.validate_record(parsed_dict, db)

    field_confidences = {
        "owner_name": 99.0,
        "parentage": 98.0 if payload.get("parentage") else 30.0,
        "khasra_number": 99.0,
        "khata_number": 98.0,
        "area": 99.0 if area_value > 0 else 10.0,
        "village": 98.0,
        "tehsil": 98.0,
        "district": 98.0,
        "land_classification": 98.0,
        "document_type": 99.0,
    }

    # 5. Create LandRecord
    record = LandRecord(
        document_id=doc.id,
        record_identifier=record_identifier,
        owner_name=owner_name,
        parentage=payload.get("parentage", ""),
        khata_number=payload.get("khata_number", ""),
        khasra_number=khasra_number,
        area_value=area_value,
        area_unit=area_unit,
        area_acres=area_acres,
        village=village or "Central Ward",
        tehsil=tehsil,
        district=district,
        state=payload.get("state") or "Rajasthan",
        land_classification=payload.get("land_classification") or "Agricultural (Irrigated)",
        document_type=doc_type,
        registration_date=reg_date,
        overall_confidence=98.5,
        field_confidences=json.dumps(field_confidences),
        status=status,
        is_flagged=is_flagged,
        flag_reason=flag_reason,
        reviewer_notes=payload.get("remarks") or "Registered via Citizen / Revenue Entry Portal",
        created_at=datetime.datetime.utcnow(),
    )
    db.add(record)
    db.flush()

    # 6. Add Validation Issues
    for issue in issues:
        v_issue = ValidationIssue(
            land_record_id=record.id,
            issue_type=issue["issue_type"],
            severity=issue["severity"],
            field_name=issue["field_name"],
            message=issue["message"],
            details=json.dumps(issue.get("details", {})),
            is_resolved=False,
        )
        db.add(v_issue)

    # 7. Audit Log
    audit = AuditLog(
        land_record_id=record.id,
        action="CITIZEN_REGISTRATION",
        performed_by=payload.get("submitted_by") or "Citizen / Revenue Desk",
        changes=json.dumps({"record_identifier": record_identifier, "status": status}),
        notes=f"New land record registered. Assigned status '{status}'.",
        created_at=datetime.datetime.utcnow(),
    )
    db.add(audit)

    db.commit()
    db.refresh(record)
    return record.to_dict()


@router.get("/{record_id}")
def get_record_detail(record_id: int, db: Session = Depends(get_db)):
    record = db.query(LandRecord).filter(LandRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Land record not found")

    audit_logs = (
        db.query(AuditLog)
        .filter(AuditLog.land_record_id == record_id)
        .order_by(desc(AuditLog.created_at))
        .all()
    )

    data = record.to_dict()
    data["audit_logs"] = [log.to_dict() for log in audit_logs]
    return data


@router.put("/{record_id}")
def update_record_fields(record_id: int, payload: dict, db: Session = Depends(get_db)):
    record = db.query(LandRecord).filter(LandRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Land record not found")

    old_values = {
        "owner_name": record.owner_name,
        "parentage": record.parentage,
        "khata_number": record.khata_number,
        "khasra_number": record.khasra_number,
        "area_value": record.area_value,
        "area_unit": record.area_unit,
        "village": record.village,
        "tehsil": record.tehsil,
        "district": record.district,
    }

    # Update editable fields
    for field in [
        "owner_name", "parentage", "khata_number", "khasra_number",
        "area_value", "area_unit", "village", "tehsil", "district",
        "state", "land_classification", "document_type", "registration_date",
        "reviewer_notes"
    ]:
        if field in payload:
            setattr(record, field, payload[field])

    # Recompute standardized area in acres
    mult = 1.0
    unit = (record.area_unit or "").lower()
    if "hect" in unit or unit == "ha":
        mult = 2.47105
    elif "bigha" in unit:
        mult = 0.625
    elif "yard" in unit:
        mult = 0.000206612
    elif "guntha" in unit:
        mult = 0.025
    record.area_acres = round(float(record.area_value or 0.0) * mult, 3)

    # Re-validate record
    status, issues, is_flagged, flag_reason = LandRecordValidator.validate_record(
        record.__dict__, db, current_record_id=record.id
    )

    if payload.get("status"):
        record.status = payload["status"]
    else:
        if record.status != "HUMAN_VERIFIED":
            record.status = status

    record.is_flagged = is_flagged
    record.flag_reason = flag_reason

    # Clear old unresolved issues and add new ones
    db.query(ValidationIssue).filter(ValidationIssue.land_record_id == record.id).delete()
    for issue_dict in issues:
        v_issue = ValidationIssue(
            land_record_id=record.id,
            issue_type=issue_dict["issue_type"],
            severity=issue_dict["severity"],
            field_name=issue_dict["field_name"],
            message=issue_dict["message"],
            details=json.dumps(issue_dict.get("details", {})),
        )
        db.add(v_issue)

    # Audit Log
    audit = AuditLog(
        land_record_id=record.id,
        action="HUMAN_EDITED",
        performed_by=payload.get("reviewed_by", "Officer Review"),
        changes=json.dumps({"before": old_values, "after": payload}),
        notes="Record fields edited during human review",
    )
    db.add(audit)

    db.commit()
    db.refresh(record)
    return record.to_dict()


@router.put("/{record_id}/verify")
def approve_and_verify_record(record_id: int, payload: dict = None, db: Session = Depends(get_db)):
    record = db.query(LandRecord).filter(LandRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Land record not found")

    payload = payload or {}
    
    for field in [
        "owner_name", "parentage", "khata_number", "khasra_number",
        "area_value", "area_unit", "village", "tehsil", "district",
        "land_classification", "reviewer_notes"
    ]:
        if field in payload:
            setattr(record, field, payload[field])

    record.status = "HUMAN_VERIFIED"
    record.is_flagged = False
    record.reviewed_by = payload.get("reviewed_by", "Officer S. K. Sharma")
    record.reviewer_notes = payload.get("reviewer_notes", "Verified against original document scan. All entries confirmed.")
    record.reviewed_at = datetime.datetime.utcnow()

    for issue in record.validation_issues:
        issue.is_resolved = True

    audit = AuditLog(
        land_record_id=record.id,
        action="HUMAN_VERIFIED",
        performed_by=record.reviewed_by,
        changes=json.dumps({"status": "HUMAN_VERIFIED", "notes": record.reviewer_notes}),
        notes="Document accepted and sealed into land register.",
    )
    db.add(audit)

    db.commit()
    db.refresh(record)
    return record.to_dict()


@router.put("/{record_id}/reject")
def reject_record(record_id: int, payload: dict, db: Session = Depends(get_db)):
    record = db.query(LandRecord).filter(LandRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Land record not found")

    reason = payload.get("reason", "Illegible / Mutilated Document")
    record.status = "REJECTED"
    record.is_flagged = True
    record.flag_reason = f"Rejected: {reason}"
    record.reviewed_by = payload.get("reviewed_by", "Officer Review")
    record.reviewer_notes = reason
    record.reviewed_at = datetime.datetime.utcnow()

    audit = AuditLog(
        land_record_id=record.id,
        action="REJECTED",
        performed_by=record.reviewed_by,
        changes=json.dumps({"status": "REJECTED", "reason": reason}),
        notes=f"Rejected: {reason}",
    )
    db.add(audit)

    db.commit()
    db.refresh(record)
    return record.to_dict()


@router.get("/export/csv")
def export_csv(db: Session = Depends(get_db)):
    records = db.query(LandRecord).order_by(LandRecord.id.asc()).all()
    output = io.StringIO()
    writer = csv.writer(output)
    
    headers = [
        "Record ID", "Owner Name", "Parentage", "Khata No", "Khasra No",
        "Area Value", "Area Unit", "Area (Acres)", "Village", "Tehsil",
        "District", "State", "Classification", "Document Type", "Reg Date",
        "Confidence %", "Status", "Flagged", "Reviewer Notes"
    ]
    writer.writerow(headers)

    for r in records:
        writer.writerow([
            r.record_identifier,
            r.owner_name,
            r.parentage or "",
            r.khata_number or "",
            r.khasra_number,
            r.area_value,
            r.area_unit,
            r.area_acres,
            r.village,
            r.tehsil,
            r.district,
            r.state,
            r.land_classification,
            r.document_type,
            r.registration_date or "",
            r.overall_confidence,
            r.status,
            "YES" if r.is_flagged else "NO",
            r.reviewer_notes or "",
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=land_records_export.csv"},
    )
