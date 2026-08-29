import json
from rapidfuzz import fuzz
from sqlalchemy.orm import Session
from .models import LandRecord, ValidationIssue

class LandRecordValidator:
    @classmethod
    def validate_record(cls, record_data: dict, db: Session, current_record_id: int = None) -> tuple[str, list[dict], bool, str]:
        """
        Validates record against sanity rules and performs fuzzy duplicate detection against existing DB records.
        Returns: (computed_status, list_of_issues_dict, is_flagged, flag_reason)
        """
        issues = []
        is_flagged = False
        flag_reasons = []

        owner = (record_data.get("owner_name") or "").strip()
        khasra = (record_data.get("khasra_number") or "").strip()
        village = (record_data.get("village") or "").strip()
        tehsil = (record_data.get("tehsil") or "").strip()
        district = (record_data.get("district") or "").strip()
        area_value = float(record_data.get("area_value") or 0.0)
        area_acres = float(record_data.get("area_acres") or 0.0)
        confidence = float(record_data.get("overall_confidence") or 0.0)

        # 1. Mandatory Field Checks
        if not owner or owner.lower() in ["unextracted owner", "unknown", "n/a", ""]:
            issues.append({
                "issue_type": "MISSING_FIELD",
                "severity": "CRITICAL",
                "field_name": "owner_name",
                "message": "Owner name is missing or unreadable from document.",
                "details": {"provided": owner},
            })
            flag_reasons.append("Missing Owner Name")

        if not khasra or khasra.lower() in ["unknown", "n/a", ""]:
            issues.append({
                "issue_type": "MISSING_FIELD",
                "severity": "CRITICAL",
                "field_name": "khasra_number",
                "message": "Survey / Khasra number is missing.",
                "details": {"provided": khasra},
            })
            flag_reasons.append("Missing Khasra Number")

        if not village:
            issues.append({
                "issue_type": "MISSING_FIELD",
                "severity": "WARNING",
                "field_name": "village",
                "message": "Village (Mauza) name not detected.",
                "details": {},
            })

        if not tehsil:
            issues.append({
                "issue_type": "MISSING_FIELD",
                "severity": "WARNING",
                "field_name": "tehsil",
                "message": "Tehsil name not detected.",
                "details": {},
            })

        if not district:
            issues.append({
                "issue_type": "MISSING_FIELD",
                "severity": "WARNING",
                "field_name": "district",
                "message": "District name not detected.",
                "details": {},
            })

        # 2. Area Sanity Checks
        if area_value <= 0.0 or area_acres <= 0.0:
            issues.append({
                "issue_type": "OUT_OF_RANGE_AREA",
                "severity": "CRITICAL",
                "field_name": "area_value",
                "message": "Extracted land area is zero or negative (impossible parcel value).",
                "details": {"area_value": area_value, "area_acres": area_acres},
            })
            flag_reasons.append("Invalid Area <= 0")
        elif area_acres > 500.0:
            issues.append({
                "issue_type": "OUT_OF_RANGE_AREA",
                "severity": "CRITICAL",
                "field_name": "area_value",
                "message": f"Land area ({area_acres:.1f} Acres) exceeds standard single parcel ceiling (500 Acres). Verification required.",
                "details": {"area_acres": area_acres},
            })
            flag_reasons.append("Extreme Land Area (> 500 Acres)")
        elif area_acres > 150.0:
            issues.append({
                "issue_type": "OUT_OF_RANGE_AREA",
                "severity": "WARNING",
                "field_name": "area_value",
                "message": f"Large land holding ({area_acres:.1f} Acres) flagged for manual verification.",
                "details": {"area_acres": area_acres},
            })

        # 3. OCR Confidence Threshold
        if confidence < 75.0:
            issues.append({
                "issue_type": "LOW_CONFIDENCE",
                "severity": "WARNING",
                "field_name": "overall_confidence",
                "message": f"Overall extraction confidence ({confidence:.1f}%) is below 75% threshold.",
                "details": {"confidence": confidence},
            })
            flag_reasons.append("Low OCR Confidence")

        # 4. Fuzzy Duplicate Detection against existing DB records
        existing_records = db.query(LandRecord).all()
        for rec in existing_records:
            if current_record_id and rec.id == current_record_id:
                continue

            # Compare Village similarity
            village_sim = fuzz.token_sort_ratio(village.lower(), (rec.village or "").lower())
            tehsil_sim = fuzz.token_sort_ratio(tehsil.lower(), (rec.tehsil or "").lower())
            owner_sim = fuzz.token_sort_ratio(owner.lower(), (rec.owner_name or "").lower())
            
            # Khasra comparison (exact match or partial)
            khasra_sim = 100 if khasra.strip() == (rec.khasra_number or "").strip() else fuzz.ratio(khasra, rec.khasra_number or "")

            # If same village/tehsil and matching khasra or matching owner
            is_khasra_conflict = (village_sim > 80 or tehsil_sim > 80) and khasra_sim >= 90
            is_owner_conflict = (village_sim > 80) and (owner_sim >= 85) and (khasra_sim >= 75)

            if is_khasra_conflict or is_owner_conflict:
                composite_score = round((owner_sim * 0.4) + (khasra_sim * 0.4) + (village_sim * 0.2), 1)
                severity = "CRITICAL" if composite_score >= 85 else "WARNING"
                
                reason_desc = (
                    f"Conflicting record on Khasra #{rec.khasra_number} in {rec.village} "
                    f"(Record ID: {rec.record_identifier}, Registered Owner: '{rec.owner_name}'). "
                    f"Similarity match: {composite_score}%"
                )

                issues.append({
                    "issue_type": "DUPLICATE_SUSPECT",
                    "severity": severity,
                    "field_name": "khasra_number",
                    "message": reason_desc,
                    "details": {
                        "conflicting_record_id": rec.id,
                        "conflicting_record_identifier": rec.record_identifier,
                        "conflicting_owner": rec.owner_name,
                        "conflicting_khasra": rec.khasra_number,
                        "conflicting_village": rec.village,
                        "similarity_score": composite_score,
                    },
                })
                flag_reasons.append(f"Fuzzy Duplicate ({composite_score}% match with {rec.record_identifier})")
                break  # Don't overwhelm with duplicate flags

        # 5. Status Decision Matrix
        has_critical = any(issue["severity"] == "CRITICAL" for issue in issues)
        has_warnings = len(issues) > 0

        if has_critical:
            status = "FLAGGED" if any(i["issue_type"] in ["DUPLICATE_SUSPECT", "OUT_OF_RANGE_AREA"] for i in issues) else "PENDING_REVIEW"
            is_flagged = True
        elif has_warnings or confidence < 85.0:
            status = "PENDING_REVIEW"
            is_flagged = len(flag_reasons) > 0
        else:
            status = "AUTO_VERIFIED"
            is_flagged = False

        flag_reason = " | ".join(flag_reasons) if flag_reasons else None
        return status, issues, is_flagged, flag_reason
