from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from ..database import get_db
from ..models import LandRecord, Document, ValidationIssue, AuditLog

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_docs = db.query(LandRecord).count()
    auto_verified = db.query(LandRecord).filter(LandRecord.status == "AUTO_VERIFIED").count()
    human_verified = db.query(LandRecord).filter(LandRecord.status == "HUMAN_VERIFIED").count()
    pending_review = db.query(LandRecord).filter(LandRecord.status == "PENDING_REVIEW").count()
    flagged = db.query(LandRecord).filter(LandRecord.status == "FLAGGED").count()
    rejected = db.query(LandRecord).filter(LandRecord.status == "REJECTED").count()

    total_verified = auto_verified + human_verified
    accuracy_rate = round((total_verified / total_docs * 100), 1) if total_docs > 0 else 0.0

    avg_conf = db.query(func.avg(LandRecord.overall_confidence)).scalar() or 0.0
    total_acres = db.query(func.sum(LandRecord.area_acres)).scalar() or 0.0

    # Status Breakdown for Pie/Donut Chart
    status_breakdown = [
        {"name": "Auto-Verified", "count": auto_verified, "color": "#10b981"},
        {"name": "Human-Verified", "count": human_verified, "color": "#3b82f6"},
        {"name": "Pending Review", "count": pending_review, "color": "#f59e0b"},
        {"name": "Flagged / Duplicate", "count": flagged, "color": "#ef4444"},
        {"name": "Rejected", "count": rejected, "color": "#6b7280"},
    ]

    # Document Type breakdown
    doc_types = (
        db.query(LandRecord.document_type, func.count(LandRecord.id))
        .group_by(LandRecord.document_type)
        .all()
    )
    doc_type_breakdown = [{"type": dt, "count": cnt} for dt, cnt in doc_types]

    # Confidence Range Distribution
    records = db.query(LandRecord.overall_confidence).all()
    conf_ranges = {
        "95-100% (Very High)": 0,
        "85-94% (High)": 0,
        "70-84% (Moderate)": 0,
        "< 70% (Low / Faded)": 0,
    }
    for (c,) in records:
        if c >= 95.0:
            conf_ranges["95-100% (Very High)"] += 1
        elif c >= 85.0:
            conf_ranges["85-94% (High)"] += 1
        elif c >= 70.0:
            conf_ranges["70-84% (Moderate)"] += 1
        else:
            conf_ranges["< 70% (Low / Faded)"] += 1

    confidence_distribution = [{"range": k, "count": v} for k, v in conf_ranges.items()]

    # Land Classification Breakdown
    class_stats = (
        db.query(
            LandRecord.land_classification,
            func.count(LandRecord.id),
            func.sum(LandRecord.area_acres),
        )
        .group_by(LandRecord.land_classification)
        .all()
    )
    classification_breakdown = [
        {"classification": cls_name, "count": cnt, "acres": round(acres or 0.0, 1)}
        for cls_name, cnt, acres in class_stats
    ]

    # Recent Audit Log Activity
    recent_logs = (
        db.query(AuditLog)
        .order_by(desc(AuditLog.created_at))
        .limit(8)
        .all()
    )
    recent_activities = []
    for l in recent_logs:
        rec = db.query(LandRecord).filter(LandRecord.id == l.land_record_id).first()
        recent_activities.append({
            "id": l.id,
            "action": l.action,
            "performed_by": l.performed_by,
            "record_identifier": rec.record_identifier if rec else "N/A",
            "owner_name": rec.owner_name if rec else "N/A",
            "district": rec.district if rec else "N/A",
            "notes": l.notes,
            "created_at": l.created_at.isoformat() if l.created_at else None,
        })

    return {
        "summary": {
            "total_documents": total_docs,
            "auto_verified": auto_verified,
            "human_verified": human_verified,
            "pending_review": pending_review,
            "flagged_issues": flagged,
            "rejected": rejected,
            "average_confidence": round(avg_conf, 1),
            "total_area_acres": round(total_acres, 1),
            "accuracy_rate": accuracy_rate,
        },
        "status_breakdown": status_breakdown,
        "doc_type_breakdown": doc_type_breakdown,
        "confidence_distribution": confidence_distribution,
        "classification_breakdown": classification_breakdown,
        "recent_activities": recent_activities,
    }
