import os
from PIL import Image, ImageDraw
from .database import SAMPLES_DIR

def generate_samples():
    """Generates 5 ready-to-test sample scanned documents in static/samples."""
    os.makedirs(SAMPLES_DIR, exist_ok=True)

    samples = [
        {
            "filename": "vintage_jamabandi_1982.jpg",
            "title": "Jamabandi Record of Rights",
            "type": "Jamabandi / RoR",
            "district": "Jaipur",
            "tehsil": "Sanganer",
            "village": "Muhana",
            "owner": "Rameshwar Prasad Sharma",
            "parentage": "S/O Badri Narayan",
            "khata": "72/14",
            "khasra": "310/1",
            "area": "4.25 Acres",
            "class": "Agricultural (Chahi / Well)",
            "year": "1982-83",
            "faded": False,
        },
        {
            "filename": "handwritten_mutation_1994.jpg",
            "title": "Mutation Register Form 7 (Intiqal)",
            "type": "Mutation Register (Intiqal)",
            "district": "Jaipur",
            "tehsil": "Amer",
            "village": "Rampura Kalan",
            "owner": "Suresh Chand Verma",
            "parentage": "S/O Rameshwar Dayal",
            "khata": "58/3",
            "khasra": "142/3",
            "area": "3.75 Acres",
            "class": "Agricultural (Nahri / Canal)",
            "year": "1994-95",
            "faded": False,
        },
        {
            "filename": "pune_sale_deed_1988.jpg",
            "title": "Deed of Conveyance",
            "type": "Sale Deed",
            "district": "Pune",
            "tehsil": "Haveli",
            "village": "Wagholi",
            "owner": "Anand Balwant Kulkarni",
            "parentage": "S/O Balwant Kulkarni",
            "khata": "112/A",
            "khasra": "204/1A",
            "area": "1.80 Hectares",
            "class": "Commercial / Industrial",
            "year": "1988-89",
            "faded": False,
        },
        {
            "filename": "faded_damaged_ror_1976.jpg",
            "title": "Old Torn Jamabandi Sheet",
            "type": "Jamabandi / RoR",
            "district": "Jaipur",
            "tehsil": "Bassi",
            "village": "Bassi",
            "owner": "Kailash Chand Meena",
            "parentage": "S/O Hariram Meena",
            "khata": "89",
            "khasra": "412/1",
            "area": "0.00 Acres",
            "class": "Agricultural (Unirrigated)",
            "year": "1976-77",
            "faded": True,
        },
        {
            "filename": "duplicate_conflict_test.jpg",
            "title": "Conflicting Mutation Record",
            "type": "Mutation Register (Intiqal)",
            "district": "Jaipur",
            "tehsil": "Sanganer",
            "village": "Muhana",
            "owner": "Ram Prasad Sharma",
            "parentage": "S/O Badri Narayan Sharma",
            "khata": "72/14",
            "khasra": "310/1",
            "area": "4.25 Acres",
            "class": "Agricultural (Chahi / Well)",
            "year": "1989-90",
            "faded": False,
        }
    ]

    for s in samples:
        width, height = 900, 1200
        bg_color = (248, 242, 228) if s["faded"] else (253, 249, 240)
        img = Image.new("RGB", (width, height), color=bg_color)
        draw = ImageDraw.Draw(img)

        # Border
        draw.rectangle([35, 35, width - 35, height - 35], outline=(140, 110, 80), width=3)
        draw.rectangle([41, 41, width - 41, height - 41], outline=(190, 160, 130), width=1)

        # Stamp
        draw.ellipse([width - 190, 60, width - 60, 190], outline=(180, 50, 50), width=3)
        draw.text((width - 170, 110), "GOVT. REVENUE\nSEAL ARCHIVE", fill=(180, 50, 50))

        # Header
        draw.text((65, 60), "REVENUE DEPARTMENT ARCHIVAL RECORD", fill=(80, 50, 30))
        draw.text((65, 85), f"OFFICE OF SUB-DIVISIONAL OFFICER & TEHSILDAR ({s['district'].upper()})", fill=(100, 70, 40))
        draw.line([65, 115, width - 210, 115], fill=(140, 110, 80), width=2)

        # Title
        draw.rectangle([55, 140, width - 55, 185], fill=(235, 225, 205), outline=(160, 130, 100))
        draw.text((75, 153), f"{s['title'].upper()} - {s['type'].upper()}", fill=(40, 30, 20))

        # Fields Table
        top_y = 215
        line_h = 36
        text_color = (130, 120, 110) if s["faded"] else (30, 30, 30)

        rows = [
            ("REGISTRATION / FASLI YEAR", s["year"]),
            ("DISTRICT (ZILA)", s["district"]),
            ("TEHSIL / TALUKA", s["tehsil"]),
            ("VILLAGE / MAUZA", s["village"]),
            ("KHATA / KHATAUNI NO.", s["khata"]),
            ("KHASRA / SURVEY NO.", s["khasra"]),
            ("KHATEDAR / OWNER NAME", s["owner"]),
            ("PARENTAGE / FATHER / HUSBAND", s["parentage"]),
            ("TOTAL MEASURED AREA", s["area"]),
            ("LAND CLASSIFICATION", s["class"]),
            ("REVENUE ASSESSMENT", "Rs. 25.00 Paid"),
            ("VERIFICATION SEAL", "Authenticated by Revenue Inspector"),
        ]

        draw.rectangle([55, top_y - 10, width - 55, top_y + len(rows) * line_h + 20], outline=(200, 180, 150), width=1)

        for i, (label, val) in enumerate(rows):
            curr_y = top_y + (i * line_h)
            if i % 2 == 0:
                draw.rectangle([56, curr_y - 4, width - 56, curr_y + line_h - 6], fill=(245, 240, 230))
            draw.text((75, curr_y), f"{label}:", fill=(100, 80, 60))
            draw.text((360, curr_y), str(val), fill=text_color)
            draw.line([56, curr_y + line_h - 6, width - 56, curr_y + line_h - 6], fill=(225, 215, 195), width=1)

        bottom_y = top_y + len(rows) * line_h + 50
        draw.text((65, bottom_y), "Official Endorsements & Land Survey Notes:", fill=(100, 70, 40))
        draw.text((65, bottom_y + 25), "Digitized for National Land Records Modernization Programme (NLRMP).\nBoundary lines verified against cadastre sheet.", fill=(70, 60, 50))

        # Signatures
        draw.line([85, height - 120, 285, height - 120], fill=(100, 100, 100), width=1)
        draw.text((105, height - 110), "Revenue Inspector Sign", fill=(100, 90, 80))

        draw.line([width - 285, height - 120, width - 85, height - 120], fill=(100, 100, 100), width=1)
        draw.text((width - 265, height - 110), "Tehsildar Seal & Sign", fill=(100, 90, 80))

        target_file = os.path.join(SAMPLES_DIR, s["filename"])
        img.save(target_file, quality=92)

        # Also write sidecar text file for fallback OCR fidelity
        sidecar_text = (
            f"REVENUE DEPARTMENT ARCHIVAL RECORD - {s['district'].upper()}\n"
            f"{s['title'].upper()} ({s['type'].upper()})\n"
            f"District: {s['district']}   Tehsil: {s['tehsil']}   Village: {s['village']}\n"
            f"Khata No: {s['khata']}   Khasra No: {s['khasra']}\n"
            f"Owner: {s['owner']}   Parentage: {s['parentage']}\n"
            f"Total Area: {s['area']}\n"
            f"Land Classification: {s['class']}\n"
            f"Year: {s['year']}\n"
        )
        with open(target_file + ".txt", "w", encoding="utf-8") as f:
            f.write(sidecar_text)

if __name__ == "__main__":
    generate_samples()
