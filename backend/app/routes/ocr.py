import os
import shutil
import uuid
import datetime
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from ..database import get_db, DOCUMENTS_DIR, SAMPLES_DIR
from ..models import Document, LandRecord, ValidationIssue, AuditLog
from ..ocr_engine import OCREngine
from ..parser import LandRecordParser
from ..validator import LandRecordValidator

router = APIRouter(prefix="/api/ocr", tags=["ocr"])

@router.get("/samples")
def list_sample_documents():
    """Lists pre-loaded sample scanned documents available for testing."""
    samples = [
        {
            "id": "vintage_jamabandi_1982.jpg",
            "title": "Vintage Jamabandi (RoR) - 1982",
            "type": "Jamabandi / RoR",
            "district": "Jaipur",
            "village": "Muhana",
            "expected_khasra": "310/1",
            "description": "Clear archival Record of Rights from Sanganer Tehsil with official seal.",
            "category": "High Confidence / Auto-Accept Candidate",
            "thumbnail_url": "/static/samples/vintage_jamabandi_1982.jpg",
        },
        {
            "id": "handwritten_mutation_1994.jpg",
            "title": "Mutation Record Form 7 (Intiqal) - 1994",
            "type": "Mutation Register (Intiqal)",
            "district": "Jaipur",
            "village": "Rampura Kalan",
            "expected_khasra": "142/3",
            "description": "Mutation deed with transfer endorsement and canal irrigation notes.",
            "category": "High Confidence / Auto-Accept Candidate",
            "thumbnail_url": "/static/samples/handwritten_mutation_1994.jpg",
        },
        {
            "id": "pune_sale_deed_1988.jpg",
            "title": "Deed of Conveyance - Pune 1988",
            "type": "Sale Deed",
            "district": "Pune",
            "village": "Wagholi",
            "expected_khasra": "204/1A",
            "description": "Sub-Registrar conveyancing deed in Hectares with stamp duty notations.",
            "category": "High Confidence / Auto-Accept Candidate",
            "thumbnail_url": "/static/samples/pune_sale_deed_1988.jpg",
        },
        {
            "id": "faded_damaged_ror_1976.jpg",
            "title": "Faded / Torn Jamabandi Sheet - 1976",
            "type": "Jamabandi / RoR",
            "district": "Jaipur",
            "village": "Bassi",
            "expected_khasra": "412/1",
            "description": "Low-contrast aged folio with missing area value to test validation trigger.",
            "category": "Low Confidence / Flagged Rule Violation",
            "thumbnail_url": "/static/samples/faded_damaged_ror_1976.jpg",
        },
        {
            "id": "duplicate_conflict_test.jpg",
            "title": "Duplicate Khasra Conflict Deed",
            "type": "Mutation Register (Intiqal)",
            "district": "Jaipur",
            "village": "Muhana",
            "expected_khasra": "310/1",
            "description": "Tests fuzzy duplicate detection against existing registered Khasra #310/1 in Muhana.",
            "category": "Fuzzy Duplicate Conflict Test",
            "thumbnail_url": "/static/samples/duplicate_conflict_test.jpg",
        },
    ]
    return samples


@router.post("/preprocess-preview")
def preprocess_preview(
    payload: dict,
):
    """Returns base64 preprocessed image for given preset without modifying record."""
    image_rel_path = payload.get("image_path", "")
    preset = payload.get("preset", "standard")

    # Resolve full path
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    full_path = os.path.join(base_dir, "static", image_rel_path.lstrip("/").replace("static/", ""))

    if not os.path.exists(full_path):
        # Check in documents or samples
        doc_candidate = os.path.join(DOCUMENTS_DIR, os.path.basename(image_rel_path))
        if os.path.exists(doc_candidate):
            full_path = doc_candidate
        else:
            sample_candidate = os.path.join(SAMPLES_DIR, os.path.basename(image_rel_path))
            if os.path.exists(sample_candidate):
                full_path = sample_candidate
            else:
                raise HTTPException(status_code=404, detail=f"Image file not found: {image_rel_path}")

    _, preview_url = OCREngine.preprocess_image(full_path, preset)
    return {"preset": preset, "preview_url": preview_url}


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    preset: str = Form("standard"),
    db: Session = Depends(get_db),
):
    """
    Handles scanned land deed upload, runs OpenCV preprocessing + OCR + Field Parser + Rule & Duplicate Validation.
    """
    ext = os.path.splitext(file.filename)[1].lower() or ".jpg"
    unique_filename = f"upload_{uuid.uuid4().hex[:10]}{ext}"
    dest_path = os.path.join(DOCUMENTS_DIR, unique_filename)

    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return _process_image_pipeline(dest_path, unique_filename, preset, db)


@router.post("/process-sample")
def process_sample_document(
    payload: dict,
    db: Session = Depends(get_db),
):
    """Copies sample document to documents directory and processes it."""
    sample_filename = payload.get("sample_id")
    preset = payload.get("preset", "standard")

    src_path = os.path.join(SAMPLES_DIR, sample_filename)
    if not os.path.exists(src_path):
        raise HTTPException(status_code=404, detail="Sample document not found")

    dest_filename = f"sample_run_{uuid.uuid4().hex[:8]}_{sample_filename}"
    dest_path = os.path.join(DOCUMENTS_DIR, dest_filename)
    shutil.copy2(src_path, dest_path)

    # Copy sidecar txt if exists
    if os.path.exists(src_path + ".txt"):
        shutil.copy2(src_path + ".txt", dest_path + ".txt")

    return _process_image_pipeline(dest_path, dest_filename, preset, db)


def _process_image_pipeline(dest_path: str, filename: str, preset: str, db: Session):
    # 1. OCR Text Extraction
    raw_ocr_text, preview_data_url = OCREngine.extract_text(dest_path, preset)

    # 2. Parse Structured Fields & Confidences
    parsed = LandRecordParser.parse(raw_ocr_text)

    # 3. Create Document Record
    doc = Document(
        filename=filename,
        filepath=f"documents/{filename}",
        file_type="image/jpeg",
        doc_type=parsed["document_type"],
        status="PROCESSED",
        raw_ocr_text=raw_ocr_text,
        uploaded_at=datetime.datetime.utcnow(),
    )
    db.add(doc)
    db.flush()

    # 4. Validate Record & Detect Duplicates
    status, issues, is_flagged, flag_reason = LandRecordValidator.validate_record(parsed, db)

    # 5. Generate Record Identifier
    rec_count = db.query(LandRecord).count() + 1
    record_identifier = f"LR-{datetime.datetime.now().year}-{rec_count:05d}"

    record = LandRecord(
        document_id=doc.id,
        record_identifier=record_identifier,
        owner_name=parsed["owner_name"] or "Unextracted Owner",
        parentage=parsed.get("parentage", ""),
        khata_number=parsed.get("khata_number", ""),
        khasra_number=parsed.get("khasra_number", "Unextracted"),
        area_value=parsed["area_value"],
        area_unit=parsed["area_unit"],
        area_acres=parsed["area_acres"],
        village=parsed["village"] or "Unextracted Village",
        tehsil=parsed["tehsil"] or "Unextracted Tehsil",
        district=parsed["district"] or "Jaipur",
        state=parsed["state"],
        land_classification=parsed["land_classification"],
        document_type=parsed["document_type"],
        registration_date=parsed.get("registration_date", ""),
        overall_confidence=parsed["overall_confidence"],
        field_confidences=json.dumps(parsed["field_confidences"]),
        status=status,
        is_flagged=is_flagged,
        flag_reason=flag_reason,
        created_at=datetime.datetime.utcnow(),
    )
    db.add(record)
    db.flush()

    # Add Validation Issues
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

    # Add Audit Log
    action_type = "AUTO_ACCEPTED" if status == "AUTO_VERIFIED" else "OCR_PARSED"
    audit = AuditLog(
        land_record_id=record.id,
        action=action_type,
        performed_by="SYSTEM_AI",
        changes=json.dumps({"status": status, "confidence": parsed["overall_confidence"]}),
        notes=f"Processed with preset '{preset}'. Assigned status '{status}' (Confidence: {parsed['overall_confidence']}%).",
    )
    db.add(audit)

    db.commit()
    db.refresh(record)

    data = record.to_dict()
    data["preprocessed_preview"] = preview_data_url
    return data
