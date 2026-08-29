from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..database import get_db
from ..models import LandRecord

router = APIRouter(prefix="/api/districts", tags=["districts"])

# Geographic coordinates for Indian revenue districts
DISTRICT_COORDINATES = {
    "Jaipur": {"lat": 26.9124, "lng": 75.7873, "state": "Rajasthan"},
    "Jodhpur": {"lat": 26.2389, "lng": 73.0243, "state": "Rajasthan"},
    "Pune": {"lat": 18.5204, "lng": 73.8567, "state": "Maharashtra"},
    "Varanasi": {"lat": 25.3176, "lng": 82.9739, "state": "Uttar Pradesh"},
    "Lucknow": {"lat": 26.8467, "lng": 80.9462, "state": "Uttar Pradesh"},
    "Indore": {"lat": 22.7196, "lng": 75.8577, "state": "Madhya Pradesh"},
    "Patna": {"lat": 25.5941, "lng": 85.1376, "state": "Bihar"},
    "Bhopal": {"lat": 23.2599, "lng": 77.4126, "state": "Madhya Pradesh"},
    "Nagpur": {"lat": 21.1458, "lng": 79.0882, "state": "Maharashtra"},
    "Udaipur": {"lat": 24.5854, "lng": 73.7125, "state": "Rajasthan"},
    "Kota": {"lat": 25.2138, "lng": 75.8648, "state": "Rajasthan"},
    "Nashik": {"lat": 19.9975, "lng": 73.7898, "state": "Maharashtra"},
    "Ahmedabad": {"lat": 23.0225, "lng": 72.5714, "state": "Gujarat"},
    "Surat": {"lat": 21.1702, "lng": 72.8311, "state": "Gujarat"},
    "Gwalior": {"lat": 26.2183, "lng": 78.1828, "state": "Madhya Pradesh"},
    "Jabalpur": {"lat": 23.1815, "lng": 79.9864, "state": "Madhya Pradesh"},
    "Prayagraj": {"lat": 25.4358, "lng": 81.8463, "state": "Uttar Pradesh"},
    "Meerut": {"lat": 28.9845, "lng": 77.7064, "state": "Uttar Pradesh"},
    "Ajmer": {"lat": 26.4499, "lng": 74.6399, "state": "Rajasthan"},
    "Kanpur": {"lat": 26.4499, "lng": 80.3319, "state": "Uttar Pradesh"},
}

@router.get("")
def get_district_progress(db: Session = Depends(get_db)):
    """Returns aggregated digitization progress per district for Leaflet map."""
    districts = db.query(LandRecord.district).distinct().all()
    results = []

    for (dist_name,) in districts:
        if not dist_name:
            continue

        records = db.query(LandRecord).filter(LandRecord.district == dist_name).all()
        total = len(records)
        if total == 0:
            continue

        auto_ver = sum(1 for r in records if r.status == "AUTO_VERIFIED")
        human_ver = sum(1 for r in records if r.status == "HUMAN_VERIFIED")
        pending = sum(1 for r in records if r.status == "PENDING_REVIEW")
        flagged = sum(1 for r in records if r.status == "FLAGGED")
        rejected = sum(1 for r in records if r.status == "REJECTED")

        verified_total = auto_ver + human_ver
        completion_rate = round((verified_total / total) * 100, 1)
        avg_confidence = round(sum(r.overall_confidence for r in records) / total, 1)
        total_area = round(sum(r.area_acres for r in records), 1)

        geo = DISTRICT_COORDINATES.get(dist_name, {"lat": 20.5937, "lng": 78.9629, "state": "India"})

        results.append({
            "district": dist_name,
            "state": geo["state"],
            "lat": geo["lat"],
            "lng": geo["lng"],
            "total_records": total,
            "verified_records": verified_total,
            "pending_records": pending,
            "flagged_records": flagged,
            "rejected_records": rejected,
            "completion_rate": completion_rate,
            "avg_confidence": avg_confidence,
            "total_area_acres": total_area,
        })

    # Sort by total records descending
    results.sort(key=lambda x: x["total_records"], reverse=True)
    return results
