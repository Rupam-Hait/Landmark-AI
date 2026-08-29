import os
import random
import json
import datetime
from PIL import Image, ImageDraw, ImageFont
from sqlalchemy.orm import Session
from .database import Base, engine, SessionLocal, DOCUMENTS_DIR, SAMPLES_DIR
from .models import Document, LandRecord, ValidationIssue, AuditLog
from .validator import LandRecordValidator

def generate_document_image(
    filename: str,
    title: str,
    doc_type: str,
    district: str,
    village: str,
    owner: str,
    parentage: str,
    khasra: str,
    khata: str,
    area_str: str,
    classification: str,
    year_str: str,
    is_faded: bool = False,
    is_handwritten_style: bool = False,
) -> str:
    """
    Renders an authentic vintage revenue document image with parchment background,
    stamps, seals, and typography using Pillow.
    """
    width, height = 900, 1200
    
    # Parchment background color
    if is_faded:
        bg_color = (248, 243, 230)
    else:
        bg_color = (252, 248, 238)

    img = Image.new("RGB", (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)

    # Draw border lines
    margin = 35
    draw.rectangle([margin, margin, width - margin, height - margin], outline=(140, 110, 80), width=3)
    draw.rectangle([margin + 6, margin + 6, width - margin - 6, height - margin - 6], outline=(180, 150, 120), width=1)

    # Stamp / Seal circle
    seal_color = (180, 50, 50, 180)
    draw.ellipse([width - 190, 60, width - 60, 190], outline=(180, 50, 50), width=3)
    draw.text((width - 170, 110), "GOVT. REVENUE\nDEPT. SEAL", fill=(180, 50, 50))

    # Header
    draw.text((margin + 30, 60), "GOVERNMENT REVENUE RECORD", fill=(80, 50, 30))
    draw.text((margin + 30, 85), f"STATE REVENUE COMMISSIONER ({district.upper()})", fill=(100, 70, 40))
    draw.line([margin + 30, 115, width - 210, 115], fill=(140, 110, 80), width=2)

    # Title Banner
    draw.rectangle([margin + 20, 140, width - margin - 20, 185], fill=(235, 225, 205), outline=(160, 130, 100))
    draw.text((margin + 40, 153), f"{title.upper()} - {doc_type.upper()}", fill=(40, 30, 20))

    # Content Box
    top_y = 215
    line_h = 36
    text_color = (30, 30, 30) if not is_faded else (130, 120, 110)

    fields = [
        ("REGISTRATION YEAR / FASLI", year_str),
        ("DISTRICT (ZILA)", district),
        ("TEHSIL / TALUKA", "Central Revenue Division"),
        ("VILLAGE / MAUZA (GAON)", village),
        ("KHATA / KHATAUNI NO.", khata),
        ("KHASRA / SURVEY NO.", khasra),
        ("KHATEDAR / OWNER NAME", owner),
        ("PARENTAGE / FATHER / HUSBAND", parentage),
        ("LAND EXTENT / TOTAL AREA", area_str),
        ("LAND CLASSIFICATION", classification),
        ("ANNUAL REVENUE / LAGAN", "Rs. 42.50 Paid in Full"),
        ("ENTRY STATUS", "Verified in Revenue Girdawari"),
    ]

    draw.rectangle([margin + 20, top_y - 10, width - margin - 20, top_y + len(fields) * line_h + 20], outline=(200, 180, 150), width=1)

    for i, (label, val) in enumerate(fields):
        curr_y = top_y + (i * line_h)
        # Background stripe
        if i % 2 == 0:
            draw.rectangle([margin + 21, curr_y - 4, width - margin - 21, curr_y + line_h - 6], fill=(245, 240, 230))
        
        draw.text((margin + 40, curr_y), f"{label}:", fill=(100, 80, 60))
        draw.text((margin + 330, curr_y), str(val), fill=text_color)
        draw.line([margin + 21, curr_y + line_h - 6, width - margin - 21, curr_y + line_h - 6], fill=(225, 215, 195), width=1)

    # Bottom notes and signatures
    bottom_y = top_y + len(fields) * line_h + 50
    draw.text((margin + 30, bottom_y), "Notes & Mutation Endorsement:", fill=(100, 70, 40))
    notes_text = (
        f"Record mutated according to Tehsildar decree. Pattedar rights recognized under Section 19.\n"
        f"Boundary marks confirmed by Patwari. Validated for digitization archive."
    )
    draw.text((margin + 30, bottom_y + 25), notes_text, fill=(70, 60, 50))

    # Signature blocks
    draw.line([margin + 50, height - 120, margin + 250, height - 120], fill=(100, 100, 100), width=1)
    draw.text((margin + 70, height - 110), "Halqa Patwari Sign", fill=(100, 90, 80))

    draw.line([width - 280, height - 120, width - 80, height - 120], fill=(100, 100, 100), width=1)
    draw.text((width - 260, height - 110), "Tehsildar / Sub-Registrar", fill=(100, 90, 80))

    # Save image
    out_path = os.path.join(DOCUMENTS_DIR, filename)
    img.save(out_path, quality=92)
    return f"documents/{filename}"


SAMPLE_SEED_RECORDS = [
    # 1. Standard Auto-Verified Jaipur Jamabandi
    {
        "doc_title": "Jamabandi Record of Rights",
        "doc_type": "Jamabandi / RoR",
        "owner_name": "Rameshwar Prasad Sharma",
        "parentage": "S/O Badri Narayan Sharma",
        "khata_number": "72/14",
        "khasra_number": "310/1",
        "area_value": 4.25,
        "area_unit": "Acres",
        "village": "Muhana",
        "tehsil": "Sanganer",
        "district": "Jaipur",
        "state": "Rajasthan",
        "land_classification": "Agricultural (Chahi / Well)",
        "year": "1982-83",
        "status": "AUTO_VERIFIED",
        "confidence": 96.5,
    },
    # 2. DUPLICATE OF RECORD 1 (Fuzzy variation on owner and same Khasra 310/1 in Muhana)
    {
        "doc_title": "Mutation Record Form 7",
        "doc_type": "Mutation Register (Intiqal)",
        "owner_name": "Ram Prasad Sharma",
        "parentage": "S/O Badri Narayan",
        "khata_number": "72/14",
        "khasra_number": "310/1",
        "area_value": 4.25,
        "area_unit": "Acres",
        "village": "Muhana",
        "tehsil": "Sanganer",
        "district": "Jaipur",
        "state": "Rajasthan",
        "land_classification": "Agricultural (Chahi / Well)",
        "year": "1989-90",
        "status": "FLAGGED",
        "confidence": 91.0,
        "is_flagged": True,
        "flag_reason": "Fuzzy Duplicate Detected (Same Khasra 310/1 in Muhana with owner 'Ram Prasad Sharma')",
    },
    # 3. Pune High-Confidence Sale Deed
    {
        "doc_title": "Deed of Conveyance",
        "doc_type": "Sale Deed",
        "owner_name": "Anand Balwant Kulkarni",
        "parentage": "S/O Balwant Kulkarni",
        "khata_number": "112/A",
        "khasra_number": "204/1A",
        "area_value": 1.80,
        "area_unit": "Hectares",
        "village": "Wagholi",
        "tehsil": "Haveli",
        "district": "Pune",
        "state": "Maharashtra",
        "land_classification": "Commercial / Industrial",
        "year": "1988-89",
        "status": "AUTO_VERIFIED",
        "confidence": 94.0,
    },
    # 4. DUPLICATE OF RECORD 3 (Wagholi Gut 204/1A with spelling variation)
    {
        "doc_title": "Mutation Sanad Dakhil",
        "doc_type": "Mutation Register (Intiqal)",
        "owner_name": "Anand B. Kulkarni",
        "parentage": "S/O Balwant Rao",
        "khata_number": "112/A",
        "khasra_number": "204/1A",
        "area_value": 4.45,
        "area_unit": "Acres",
        "village": "Wagholi",
        "tehsil": "Haveli",
        "district": "Pune",
        "state": "Maharashtra",
        "land_classification": "Commercial / Industrial",
        "year": "1993-94",
        "status": "FLAGGED",
        "confidence": 88.5,
        "is_flagged": True,
        "flag_reason": "Fuzzy Duplicate Detected (Matching Survey 204/1A in Wagholi)",
    },
    # 5. Amer Mutation High-Confidence
    {
        "doc_title": "Mutation Register No 9",
        "doc_type": "Mutation Register (Intiqal)",
        "owner_name": "Suresh Chand Verma",
        "parentage": "S/O Rameshwar Dayal Verma",
        "khata_number": "58/3",
        "khasra_number": "142/3",
        "area_value": 3.75,
        "area_unit": "Acres",
        "village": "Rampura Kalan",
        "tehsil": "Amer",
        "district": "Jaipur",
        "state": "Rajasthan",
        "land_classification": "Agricultural (Nahri / Canal)",
        "year": "1994-95",
        "status": "AUTO_VERIFIED",
        "confidence": 95.0,
    },
    # 6. DUPLICATE OF RECORD 5 (Suresh Kumar Verma on 142/3)
    {
        "doc_title": "Khasra Girdawari Extract",
        "doc_type": "Khasra Girdawari",
        "owner_name": "Suresh Kumar Verma",
        "parentage": "S/O Rameshwar Dayal",
        "khata_number": "58/3",
        "khasra_number": "142/3",
        "area_value": 6.0,
        "area_unit": "Bigha",
        "village": "Rampura Kalan",
        "tehsil": "Amer",
        "district": "Jaipur",
        "state": "Rajasthan",
        "land_classification": "Agricultural (Nahri / Canal)",
        "year": "1997-98",
        "status": "FLAGGED",
        "confidence": 89.0,
        "is_flagged": True,
        "flag_reason": "Fuzzy Duplicate Detected (Duplicate Owner & Parcel on Khasra 142/3)",
    },
    # 7. FLAGGED: Impossible Area Value (Area = 0.0)
    {
        "doc_title": "Damaged Jamabandi Leaf",
        "doc_type": "Jamabandi / RoR",
        "owner_name": "Kailash Chand Meena",
        "parentage": "S/O Hariram Meena",
        "khata_number": "89",
        "khasra_number": "412/1",
        "area_value": 0.0,
        "area_unit": "Acres",
        "village": "Bassi",
        "tehsil": "Bassi",
        "district": "Jaipur",
        "state": "Rajasthan",
        "land_classification": "Agricultural (Unirrigated)",
        "year": "1976-77",
        "status": "FLAGGED",
        "confidence": 62.0,
        "is_faded": True,
        "is_flagged": True,
        "flag_reason": "Invalid Area <= 0 (Torn paper in area column)",
    },
    # 8. FLAGGED: Extreme Area Ceiling (> 500 Acres)
    {
        "doc_title": "Allotment Grant Register",
        "doc_type": "Jamabandi / RoR",
        "owner_name": "Rajendra Singh Rathore",
        "parentage": "S/O Bhawani Singh",
        "khata_number": "210",
        "khasra_number": "890/5",
        "area_value": 850.0,
        "area_unit": "Acres",
        "village": "Osian",
        "tehsil": "Osian",
        "district": "Jodhpur",
        "state": "Rajasthan",
        "land_classification": "Pasture / Charagah (Gair Mumkin)",
        "year": "1965-66",
        "status": "FLAGGED",
        "confidence": 82.0,
        "is_flagged": True,
        "flag_reason": "Extreme Land Area (850 Acres exceeds standard individual holding limit)",
    },
    # 9. PENDING_REVIEW: Low OCR Confidence / Faded Ink
    {
        "doc_title": "Faded Jamabandi Folio",
        "doc_type": "Jamabandi / RoR",
        "owner_name": "Bhagwan Sahai Gupta",
        "parentage": "S/O Moolchand",
        "khata_number": "14",
        "khasra_number": "78",
        "area_value": 2.10,
        "area_unit": "Acres",
        "village": "Shivdaspura",
        "tehsil": "Chaksu",
        "district": "Jaipur",
        "state": "Rajasthan",
        "land_classification": "Agricultural (Irrigated)",
        "year": "1972-73",
        "status": "PENDING_REVIEW",
        "confidence": 68.5,
        "is_faded": True,
    },
    # 10. HUMAN_VERIFIED: Reviewed by Officer
    {
        "doc_title": "Verified Jamabandi Sanad",
        "doc_type": "Jamabandi / RoR",
        "owner_name": "Mukesh Kumar Sharma",
        "parentage": "S/O Girdhari Lal",
        "khata_number": "91/2",
        "khasra_number": "523/4",
        "area_value": 5.20,
        "area_unit": "Acres",
        "village": "Jhotwara",
        "tehsil": "Jaipur",
        "district": "Jaipur",
        "state": "Rajasthan",
        "land_classification": "Residential (Abadi)",
        "year": "1990-91",
        "status": "HUMAN_VERIFIED",
        "confidence": 91.0,
        "reviewer_notes": "Cross-verified with Patwari register vol 14, page 88. Boundaries approved.",
        "reviewed_by": "Officer S. K. Choudhary",
    },
    # Additional Diverse Records across Districts
    {
        "doc_title": "RoR Record of Rights",
        "doc_type": "Jamabandi / RoR",
        "owner_name": "Vinod Narayan Patil",
        "parentage": "S/O Narayan Patil",
        "khata_number": "45/A",
        "khasra_number": "118/2",
        "area_value": 3.40,
        "area_unit": "Hectares",
        "village": "Baramati",
        "tehsil": "Baramati",
        "district": "Pune",
        "state": "Maharashtra",
        "land_classification": "Agricultural (Irrigated)",
        "year": "1985-86",
        "status": "AUTO_VERIFIED",
        "confidence": 97.0,
    },
    {
        "doc_title": "Varanasi Registered Deed",
        "doc_type": "Sale Deed",
        "owner_name": "Satish Chandra Mishra",
        "parentage": "S/O Pandit Kashi Nath",
        "khata_number": "304",
        "khasra_number": "612/1",
        "area_value": 2.85,
        "area_unit": "Acres",
        "village": "Sarnath",
        "tehsil": "Sadar",
        "district": "Varanasi",
        "state": "Uttar Pradesh",
        "land_classification": "Residential (Abadi)",
        "year": "1991-92",
        "status": "AUTO_VERIFIED",
        "confidence": 96.0,
    },
    {
        "doc_title": "Lucknow Khatauni Record",
        "doc_type": "Jamabandi / RoR",
        "owner_name": "Mohd. Aslam Siddiqui",
        "parentage": "S/O Akhtar Hussain",
        "khata_number": "188/3",
        "khasra_number": "402/2",
        "area_value": 1.95,
        "area_unit": "Hectares",
        "village": "Kakori",
        "tehsil": "Malihabad",
        "district": "Lucknow",
        "state": "Uttar Pradesh",
        "land_classification": "Agricultural (Nahri / Canal)",
        "year": "1987-88",
        "status": "AUTO_VERIFIED",
        "confidence": 95.5,
    },
    {
        "doc_title": "Indore Mutation Entry",
        "doc_type": "Mutation Register (Intiqal)",
        "owner_name": "Dinesh Kumar Yadav",
        "parentage": "S/O Mohan Lal Yadav",
        "khata_number": "67",
        "khasra_number": "154/9",
        "area_value": 5.50,
        "area_unit": "Acres",
        "village": "Mhow",
        "tehsil": "Dr. Ambedkar Nagar",
        "district": "Indore",
        "state": "Madhya Pradesh",
        "land_classification": "Agricultural (Irrigated)",
        "year": "1995-96",
        "status": "AUTO_VERIFIED",
        "confidence": 94.8,
    },
    {
        "doc_title": "Patna Land Registry",
        "doc_type": "Sale Deed",
        "owner_name": "Brijesh Prasad Singh",
        "parentage": "S/O Jagdish Prasad",
        "khata_number": "410",
        "khasra_number": "921/3",
        "area_value": 1.25,
        "area_unit": "Acres",
        "village": "Danapur",
        "tehsil": "Danapur",
        "district": "Patna",
        "state": "Bihar",
        "land_classification": "Commercial / Industrial",
        "year": "1998-99",
        "status": "AUTO_VERIFIED",
        "confidence": 93.2,
    },
    {
        "doc_title": "Jodhpur Jamabandi Sanad",
        "doc_type": "Jamabandi / RoR",
        "owner_name": "Prem Prakash Gehlot",
        "parentage": "S/O Hanuman Prasad",
        "khata_number": "152",
        "khasra_number": "334/1",
        "area_value": 8.50,
        "area_unit": "Bigha",
        "village": "Mandore",
        "tehsil": "Jodhpur",
        "district": "Jodhpur",
        "state": "Rajasthan",
        "land_classification": "Agricultural (Unirrigated)",
        "year": "1983-84",
        "status": "AUTO_VERIFIED",
        "confidence": 96.0,
    },
    {
        "doc_title": "Udaipur Forest Border Khata",
        "doc_type": "Jamabandi / RoR",
        "owner_name": "Gajendra Singh Chundawat",
        "parentage": "S/O Fateh Singh",
        "khata_number": "94",
        "khasra_number": "720/1",
        "area_value": 6.20,
        "area_unit": "Acres",
        "village": "Gogunda",
        "tehsil": "Gogunda",
        "district": "Udaipur",
        "state": "Rajasthan",
        "land_classification": "Forest / Protected Land",
        "year": "1980-81",
        "status": "AUTO_VERIFIED",
        "confidence": 94.0,
    },
    {
        "doc_title": "Nagpur Agricultural RoR",
        "doc_type": "Jamabandi / RoR",
        "owner_name": "Shrikant Wamanrao Deshmukh",
        "parentage": "S/O Wamanrao Deshmukh",
        "khata_number": "88/B",
        "khasra_number": "145/2",
        "area_value": 2.60,
        "area_unit": "Hectares",
        "village": "Katol",
        "tehsil": "Katol",
        "district": "Nagpur",
        "state": "Maharashtra",
        "land_classification": "Agricultural (Irrigated)",
        "year": "1986-87",
        "status": "AUTO_VERIFIED",
        "confidence": 97.2,
    },
    {
        "doc_title": "Kota Canal Irrigated Deed",
        "doc_type": "Sale Deed",
        "owner_name": "Pawan Kumar Hada",
        "parentage": "S/O Zorawar Singh",
        "khata_number": "215",
        "khasra_number": "504/2",
        "area_value": 5.10,
        "area_unit": "Acres",
        "village": "Sangod",
        "tehsil": "Sangod",
        "district": "Kota",
        "state": "Rajasthan",
        "land_classification": "Agricultural (Nahri / Canal)",
        "year": "1992-93",
        "status": "AUTO_VERIFIED",
        "confidence": 95.8,
    },
    {
        "doc_title": "Bhopal RoR Register",
        "doc_type": "Jamabandi / RoR",
        "owner_name": "Alok Kumar Saxena",
        "parentage": "S/O Prem Narain Saxena",
        "khata_number": "76",
        "khasra_number": "219/1",
        "area_value": 3.80,
        "area_unit": "Acres",
        "village": "Berasia",
        "tehsil": "Berasia",
        "district": "Bhopal",
        "state": "Madhya Pradesh",
        "land_classification": "Agricultural (Chahi / Well)",
        "year": "1984-85",
        "status": "AUTO_VERIFIED",
        "confidence": 96.1,
    },
    {
        "doc_title": "Nashik Vineyard Land Deed",
        "doc_type": "Sale Deed",
        "owner_name": "Ravindra Madhavrao Shinde",
        "parentage": "S/O Madhavrao Shinde",
        "khata_number": "142",
        "khasra_number": "388/1",
        "area_value": 2.15,
        "area_unit": "Hectares",
        "village": "Niphad",
        "tehsil": "Niphad",
        "district": "Nashik",
        "state": "Maharashtra",
        "land_classification": "Agricultural (Irrigated)",
        "year": "1996-97",
        "status": "AUTO_VERIFIED",
        "confidence": 96.8,
    },
    {
        "doc_title": "Prayagraj Khatauni Folio",
        "doc_type": "Jamabandi / RoR",
        "owner_name": "Devesh Kumar Tripathi",
        "parentage": "S/O Ramakant Tripathi",
        "khata_number": "53",
        "khasra_number": "167/3",
        "area_value": 2.40,
        "area_unit": "Acres",
        "village": "Phulpur",
        "tehsil": "Phulpur",
        "district": "Prayagraj",
        "state": "Uttar Pradesh",
        "land_classification": "Agricultural (Irrigated)",
        "year": "1989-90",
        "status": "AUTO_VERIFIED",
        "confidence": 95.0,
    },
    {
        "doc_title": "Kanpur Industrial Plot Sanad",
        "doc_type": "Sale Deed",
        "owner_name": "Ashok Kumar Agarwal",
        "parentage": "S/O Lala Banwari Lal",
        "khata_number": "512",
        "khasra_number": "810/4",
        "area_value": 1.10,
        "area_unit": "Acres",
        "village": "Bilhaur",
        "tehsil": "Bilhaur",
        "district": "Kanpur",
        "state": "Uttar Pradesh",
        "land_classification": "Commercial / Industrial",
        "year": "1994-95",
        "status": "AUTO_VERIFIED",
        "confidence": 94.5,
    },
    {
        "doc_title": "Ajmer Dargah Vicinity RoR",
        "doc_type": "Jamabandi / RoR",
        "owner_name": "Syed Farooq Ali",
        "parentage": "S/O Syed Anwar Ali",
        "khata_number": "33/1",
        "khasra_number": "95/2",
        "area_value": 1.75,
        "area_unit": "Acres",
        "village": "Pushkar",
        "tehsil": "Pushkar",
        "district": "Ajmer",
        "state": "Rajasthan",
        "land_classification": "Residential (Abadi)",
        "year": "1981-82",
        "status": "AUTO_VERIFIED",
        "confidence": 95.2,
    },
    {
        "doc_title": "Gwalior Fort Footprints Deed",
        "doc_type": "Sale Deed",
        "owner_name": "Raghuvir Singh Tomar",
        "parentage": "S/O Pratap Singh Tomar",
        "khata_number": "180",
        "khasra_number": "415/2",
        "area_value": 3.90,
        "area_unit": "Acres",
        "village": "Morar",
        "tehsil": "Gwalior",
        "district": "Gwalior",
        "state": "Madhya Pradesh",
        "land_classification": "Agricultural (Chahi / Well)",
        "year": "1988-89",
        "status": "AUTO_VERIFIED",
        "confidence": 96.0,
    },
    {
        "doc_title": "Ahmedabad Sabarmati Basin RoR",
        "doc_type": "Jamabandi / RoR",
        "owner_name": "Jitendra Bhikhabhai Patel",
        "parentage": "S/O Bhikhabhai Patel",
        "khata_number": "220",
        "khasra_number": "540/1",
        "area_value": 2.30,
        "area_unit": "Hectares",
        "village": "Sanand",
        "tehsil": "Sanand",
        "district": "Ahmedabad",
        "state": "Gujarat",
        "land_classification": "Commercial / Industrial",
        "year": "1995-96",
        "status": "AUTO_VERIFIED",
        "confidence": 97.5,
    },
    {
        "doc_title": "Surat Tapi Riverfront Sanad",
        "doc_type": "Sale Deed",
        "owner_name": "Pravinbhai Kanjibhai Desai",
        "parentage": "S/O Kanjibhai Desai",
        "khata_number": "315",
        "khasra_number": "722/3",
        "area_value": 1.45,
        "area_unit": "Hectares",
        "village": "Bardoli",
        "tehsil": "Bardoli",
        "district": "Surat",
        "state": "Gujarat",
        "land_classification": "Agricultural (Irrigated)",
        "year": "1997-98",
        "status": "AUTO_VERIFIED",
        "confidence": 96.4,
    },
    {
        "doc_title": "Jabalpur Narmada Valley RoR",
        "doc_type": "Jamabandi / RoR",
        "owner_name": "Naveen Chandra Choubey",
        "parentage": "S/O Dwarika Prasad",
        "khata_number": "61",
        "khasra_number": "190/4",
        "area_value": 4.10,
        "area_unit": "Acres",
        "village": "Patan",
        "tehsil": "Patan",
        "district": "Jabalpur",
        "state": "Madhya Pradesh",
        "land_classification": "Agricultural (Irrigated)",
        "year": "1983-84",
        "status": "AUTO_VERIFIED",
        "confidence": 95.0,
    },
    {
        "doc_title": "Meerut Sugarcane Belt RoR",
        "doc_type": "Jamabandi / RoR",
        "owner_name": "Chaudhary Dharamvir Singh",
        "parentage": "S/O Ch. Suraj Mal",
        "khata_number": "104",
        "khasra_number": "298/2",
        "area_value": 6.80,
        "area_unit": "Acres",
        "village": "Mawana",
        "tehsil": "Mawana",
        "district": "Meerut",
        "state": "Uttar Pradesh",
        "land_classification": "Agricultural (Nahri / Canal)",
        "year": "1991-92",
        "status": "AUTO_VERIFIED",
        "confidence": 96.9,
    },
    # PENDING REVIEW: Missing Parentage / Low Confidence
    {
        "doc_title": "Old Chaksu Mutation Sanad",
        "doc_type": "Mutation Register (Intiqal)",
        "owner_name": "Bhanwar Lal Gurjar",
        "parentage": "",
        "khata_number": "41",
        "khasra_number": "119",
        "area_value": 3.15,
        "area_unit": "Acres",
        "village": "Kadera",
        "tehsil": "Chaksu",
        "district": "Jaipur",
        "state": "Rajasthan",
        "land_classification": "Agricultural (Unirrigated)",
        "year": "1974-75",
        "status": "PENDING_REVIEW",
        "confidence": 71.0,
        "is_faded": True,
    },
    # HUMAN_VERIFIED: Approved Record
    {
        "doc_title": "Reviewed Haveli Sale Deed",
        "doc_type": "Sale Deed",
        "owner_name": "Sunil Vasant More",
        "parentage": "S/O Vasant More",
        "khata_number": "201/C",
        "khasra_number": "411/2",
        "area_value": 1.20,
        "area_unit": "Hectares",
        "village": "Khadakwasla",
        "tehsil": "Haveli",
        "district": "Pune",
        "state": "Maharashtra",
        "land_classification": "Residential (Abadi)",
        "year": "1992-93",
        "status": "HUMAN_VERIFIED",
        "confidence": 93.5,
        "reviewer_notes": "Registry index book checked. Stamp duty receipt authenticated.",
        "reviewed_by": "Officer M. K. Deshpande",
    },
    {
        "doc_title": "Reviewed Varanasi Jamabandi",
        "doc_type": "Jamabandi / RoR",
        "owner_name": "Raghunath Prasad Chaubey",
        "parentage": "S/O Pandit Kedarnath",
        "khata_number": "129",
        "khasra_number": "342/1",
        "area_value": 2.90,
        "area_unit": "Acres",
        "village": "Ramnagar",
        "tehsil": "Varanasi",
        "district": "Varanasi",
        "state": "Uttar Pradesh",
        "land_classification": "Agricultural (Irrigated)",
        "year": "1985-86",
        "status": "HUMAN_VERIFIED",
        "confidence": 92.0,
        "reviewer_notes": "Father name verified via Khatauni register ledger 12.",
        "reviewed_by": "Tehsildar V. P. Tiwari",
    }
]

def seed_database():
    """Initializes the database and seeds ~32 realistic land records."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    existing_count = db.query(LandRecord).count()
    if existing_count >= len(SAMPLE_SEED_RECORDS):
        print(f"Database already seeded with {existing_count} records.")
        db.close()
        return

    print("Seeding database with realistic land documents and records...")

    for idx, item in enumerate(SAMPLE_SEED_RECORDS, 1):
        filename = f"scan_doc_{idx:03d}.jpg"
        area_str = f"{item['area_value']} {item['area_unit']}"

        # Standardize area to Acres
        multiplier = 1.0
        if item["area_unit"] == "Hectares":
            multiplier = 2.47105
        elif item["area_unit"] == "Bigha":
            multiplier = 0.625

        area_acres = round(item["area_value"] * multiplier, 3)

        # Generate realistic scanned document image
        rel_path = generate_document_image(
            filename=filename,
            title=item["doc_title"],
            doc_type=item["doc_type"],
            district=item["district"],
            village=item["village"],
            owner=item["owner_name"],
            parentage=item["parentage"],
            khasra=item["khasra_number"],
            khata=item["khata_number"],
            area_str=area_str,
            classification=item["land_classification"],
            year_str=item["year"],
            is_faded=item.get("is_faded", False),
        )

        raw_ocr_text = (
            f"GOVERNMENT REVENUE RECORD - {item['district'].upper()}\n"
            f"{item['doc_title'].upper()} ({item['doc_type'].upper()})\n"
            f"District: {item['district']}   Tehsil: {item['tehsil']}   Village: {item['village']}\n"
            f"Khata No: {item['khata_number']}   Khasra No: {item['khasra_number']}\n"
            f"Khatedar / Owner: {item['owner_name']}   Parentage: {item['parentage']}\n"
            f"Total Area: {area_str} ({area_acres} Acres)\n"
            f"Classification: {item['land_classification']}\n"
            f"Fasli Year: {item['year']}\n"
        )

        # Create Document entity
        doc = Document(
            filename=filename,
            filepath=rel_path,
            file_type="image/jpeg",
            doc_type=item["doc_type"],
            status="PROCESSED",
            raw_ocr_text=raw_ocr_text,
            image_width=900,
            image_height=1200,
            uploaded_at=datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(1, 30)),
        )
        db.add(doc)
        db.flush()

        # Build field confidences
        conf = item["confidence"]
        field_confidences = {
            "owner_name": round(conf, 1),
            "parentage": round(conf - 2.0 if item["parentage"] else 20.0, 1),
            "khata_number": round(conf - 1.0, 1),
            "khasra_number": round(conf, 1),
            "area": round(conf if item["area_value"] > 0 else 15.0, 1),
            "village": round(conf, 1),
            "tehsil": round(conf - 1.5, 1),
            "district": round(conf + 1.0, 1),
            "land_classification": round(conf, 1),
            "document_type": round(conf + 2.0, 1),
        }

        record_id_str = f"LR-{datetime.datetime.now().year}-{idx:05d}"

        record = LandRecord(
            document_id=doc.id,
            record_identifier=record_id_str,
            owner_name=item["owner_name"],
            parentage=item["parentage"],
            khata_number=item["khata_number"],
            khasra_number=item["khasra_number"],
            area_value=item["area_value"],
            area_unit=item["area_unit"],
            area_acres=area_acres,
            village=item["village"],
            tehsil=item["tehsil"],
            district=item["district"],
            state=item["state"],
            land_classification=item["land_classification"],
            document_type=item["doc_type"],
            registration_date=f"{item['year'].split('-')[0]}-04-15",
            overall_confidence=item["confidence"],
            field_confidences=json.dumps(field_confidences),
            status=item["status"],
            is_flagged=item.get("is_flagged", False),
            flag_reason=item.get("flag_reason"),
            reviewer_notes=item.get("reviewer_notes"),
            reviewed_by=item.get("reviewed_by"),
            reviewed_at=datetime.datetime.utcnow() if item["status"] == "HUMAN_VERIFIED" else None,
            created_at=doc.uploaded_at,
        )
        db.add(record)
        db.flush()

        # Add initial Audit Log
        audit = AuditLog(
            land_record_id=record.id,
            action="OCR_PARSED",
            performed_by="SYSTEM_AI",
            changes=json.dumps({"status": item["status"], "confidence": item["confidence"]}),
            notes=f"Digitized from {filename} with OCR confidence {item['confidence']}%",
            created_at=doc.uploaded_at,
        )
        db.add(audit)

        # If flagged or has issue, add ValidationIssue
        if item.get("is_flagged") or item["status"] == "FLAGGED":
            issue_type = "DUPLICATE_SUSPECT" if "Duplicate" in (item.get("flag_reason") or "") else "OUT_OF_RANGE_AREA"
            issue = ValidationIssue(
                land_record_id=record.id,
                issue_type=issue_type,
                severity="CRITICAL",
                field_name="khasra_number" if issue_type == "DUPLICATE_SUSPECT" else "area_value",
                message=item.get("flag_reason", "Validation check failed"),
                details=json.dumps({"flag_reason": item.get("flag_reason")}),
                is_resolved=False,
            )
            db.add(issue)

    db.commit()
    print(f"Successfully seeded {len(SAMPLE_SEED_RECORDS)} realistic land records!")
    db.close()

if __name__ == "__main__":
    seed_database()
