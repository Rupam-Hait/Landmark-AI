import re
import json

class LandRecordParser:
    # Standard area conversion multipliers to Acres
    UNIT_TO_ACRES = {
        "acres": 1.0,
        "acre": 1.0,
        "hectares": 2.47105,
        "hectare": 2.47105,
        "ha": 2.47105,
        "bigha": 0.625,  # Standard Pucca Bigha (approx 0.625 acres / 2500 sq.m)
        "bighas": 0.625,
        "biswa": 0.03125,
        "guntha": 0.025,
        "gunthas": 0.025,
        "sq. meters": 0.000247105,
        "sq meters": 0.000247105,
        "sq. yards": 0.000206612,
        "sq yards": 0.000206612,
        "sq. feet": 0.0000229568,
        "sq ft": 0.0000229568,
    }

    KNOWN_DISTRICTS = [
        "Jaipur", "Jodhpur", "Pune", "Varanasi", "Lucknow", "Indore", "Patna",
        "Bhopal", "Nagpur", "Udaipur", "Kota", "Ajmer", "Kanpur", "Nashik",
        "Ahmedabad", "Surat", "Gwalior", "Jabalpur", "Prayagraj", "Meerut"
    ]

    KNOWN_CLASSIFICATIONS = [
        "Agricultural (Irrigated)",
        "Agricultural (Unirrigated)",
        "Agricultural (Nahri / Canal)",
        "Agricultural (Chahi / Well)",
        "Residential (Abadi)",
        "Commercial / Industrial",
        "Pasture / Charagah (Gair Mumkin)",
        "Barren / Waste Land",
        "Forest / Protected Land"
    ]

    @classmethod
    def parse(cls, raw_text: str) -> dict:
        """
        Parses unformatted OCR text into structured land record attributes
        with per-field confidence scores (0-100%).
        """
        if not raw_text:
            return cls._empty_record()

        text = raw_text.replace("\r", "")
        lines = [line.strip() for line in text.split("\n") if line.strip()]

        parsed = {
            "owner_name": "",
            "parentage": "",
            "khata_number": "",
            "khasra_number": "",
            "area_value": 0.0,
            "area_unit": "Acres",
            "area_acres": 0.0,
            "village": "",
            "tehsil": "",
            "district": "",
            "state": "Rajasthan",
            "land_classification": "Agricultural (Irrigated)",
            "document_type": "Jamabandi / RoR",
            "registration_date": "",
        }

        confidences = {
            "owner_name": 40.0,
            "parentage": 30.0,
            "khata_number": 40.0,
            "khasra_number": 40.0,
            "area": 30.0,
            "village": 40.0,
            "tehsil": 40.0,
            "district": 40.0,
            "land_classification": 50.0,
            "document_type": 70.0,
        }

        # 1. Detect Document Type
        if re.search(r"mutation|intiqal|dakhil\s*kharij|fard\s*badar", text, re.I):
            parsed["document_type"] = "Mutation Register (Intiqal)"
            confidences["document_type"] = 96.0
        elif re.search(r"sale\s*deed|deed\s*of\s*conveyance|registry|bainama", text, re.I):
            parsed["document_type"] = "Sale Deed"
            confidences["document_type"] = 95.0
        elif re.search(r"girdawari|crop\s*inspection|khasra\s*girdawari", text, re.I):
            parsed["document_type"] = "Khasra Girdawari"
            confidences["document_type"] = 92.0
        elif re.search(r"mortgage|rehan|girvi", text, re.I):
            parsed["document_type"] = "Mortgage Deed (Rehannama)"
            confidences["document_type"] = 90.0
        elif re.search(r"jamabandi|ror|record\s*of\s*rights|khatauni", text, re.I):
            parsed["document_type"] = "Jamabandi / RoR"
            confidences["document_type"] = 95.0

        # 2. Extract District
        for d in cls.KNOWN_DISTRICTS:
            if re.search(rf"\b{re.escape(d)}\b", text, re.I):
                parsed["district"] = d
                confidences["district"] = 95.0
                break
        if not parsed["district"]:
            m_dist = re.search(r"(?:district|zila)[\s:/-]+([A-Za-z\s]+?)(?:[\n,\.]|tehsil|state|$)", text, re.I)
            if m_dist:
                parsed["district"] = m_dist.group(1).strip()
                confidences["district"] = 78.0

        # State Heuristics based on District
        if parsed["district"] in ["Pune", "Nagpur", "Nashik"]:
            parsed["state"] = "Maharashtra"
        elif parsed["district"] in ["Varanasi", "Lucknow", "Kanpur", "Prayagraj", "Meerut"]:
            parsed["state"] = "Uttar Pradesh"
        elif parsed["district"] in ["Indore", "Bhopal", "Gwalior", "Jabalpur"]:
            parsed["state"] = "Madhya Pradesh"
        elif parsed["district"] in ["Patna"]:
            parsed["state"] = "Bihar"
        elif parsed["district"] in ["Ahmedabad", "Surat"]:
            parsed["state"] = "Gujarat"
        else:
            parsed["state"] = "Rajasthan"

        # 3. Extract Tehsil / Taluka
        m_teh = re.search(r"(?:tehsil|taluka|mandal|sub-district)[\s:/-]+([A-Za-z\s]+?)(?:[\n,\.]|district|village|$)", text, re.I)
        if m_teh:
            parsed["tehsil"] = m_teh.group(1).strip()
            confidences["tehsil"] = 92.0
        else:
            for line in lines:
                if "tehsil" in line.lower() or "taluka" in line.lower():
                    clean = re.sub(r"(?i)tehsil|taluka|sub-district|[:\-/]", "", line).strip()
                    if clean and len(clean) < 30:
                        parsed["tehsil"] = clean
                        confidences["tehsil"] = 75.0
                        break

        # 4. Extract Village / Mauza
        m_vil = re.search(r"(?:village|mauza|gaon|gram)[\s:/-]+([A-Za-z\s]+?)(?:[\n,\.]|tehsil|khasra|patwar|$)", text, re.I)
        if m_vil:
            parsed["village"] = m_vil.group(1).strip()
            confidences["village"] = 91.0
        else:
            for line in lines:
                if "village" in line.lower() or "mauza" in line.lower():
                    clean = re.sub(r"(?i)village|mauza|gaon|gram|[:\-/]", "", line).strip()
                    if clean and len(clean) < 35:
                        parsed["village"] = clean
                        confidences["village"] = 72.0
                        break

        # 5. Extract Khasra / Survey Number
        m_khasra = re.search(r"(?:khasra\s*(?:no|number)?|survey\s*(?:no|number)?|gat\s*(?:no|number)?|gut\s*no)[\s:/-]+([0-9\s/,]+[0-9a-zA-Z/]*)", text, re.I)
        if m_khasra:
            parsed["khasra_number"] = m_khasra.group(1).strip()
            confidences["khasra_number"] = 94.0
        else:
            # Look for number patterns like 142/3 or 310/1
            m_alt_khasra = re.search(r"\b(\d{1,4}/\d{1,3}(?:,\s*\d{1,4}/\d{1,3})*|\d{2,4})\b", text)
            if m_alt_khasra:
                parsed["khasra_number"] = m_alt_khasra.group(1).strip()
                confidences["khasra_number"] = 70.0

        # 6. Extract Khata / Khatauni Number
        m_khata = re.search(r"(?:khata\s*(?:no|number)?|khatauni\s*(?:no)?|khewat\s*(?:no)?)[\s:/-]+([0-9\s/,]+[0-9a-zA-Z/]*)", text, re.I)
        if m_khata:
            parsed["khata_number"] = m_khata.group(1).strip()
            confidences["khata_number"] = 92.0

        # 7. Extract Owner Name & Parentage
        m_owner = re.search(r"(?:owner|khatedar|pattedar|transferee|purchaser|name)[\s:/-]+([A-Za-z\s]+?)(?:[\n,\.]|s/o|w/o|d/o|son of|wife of|daughter of|area|khasra|$)", text, re.I)
        if m_owner:
            owner_candidate = m_owner.group(1).strip()
            if len(owner_candidate) > 2:
                parsed["owner_name"] = owner_candidate
                confidences["owner_name"] = 91.0

        # Parentage
        m_par = re.search(r"(?:s/o|w/o|d/o|son of|wife of|daughter of|walad)[\s:/-]+([A-Za-z\s]+?)(?:[\n,\.]|khasra|khata|area|resident|$)", text, re.I)
        if m_par:
            par_name = m_par.group(1).strip()
            prefix = "S/O "
            if re.search(r"w/o|wife of", text, re.I):
                prefix = "W/O "
            elif re.search(r"d/o|daughter of", text, re.I):
                prefix = "D/O "
            parsed["parentage"] = prefix + par_name
            confidences["parentage"] = 90.0

        # Fallback if owner not extracted cleanly
        if not parsed["owner_name"]:
            for line in lines:
                if any(k in line.lower() for k in ["shri", "smt", "kumar", "singh", "sharma", "patil", "yadav", "verma", "shukla"]):
                    cleaned = re.sub(r"(?i)owner|khatedar|pattedar|purchaser|name|[:\-/]", "", line).strip()
                    if cleaned and len(cleaned) < 40 and not any(d in cleaned for d in ["Jaipur", "Pune", "Tehsil"]):
                        parsed["owner_name"] = cleaned
                        confidences["owner_name"] = 72.0
                        break

        # 8. Extract Area & Units
        m_area = re.search(r"(?:total\s*area|rakba|area\s*sold|extent|area)[\s:/-]+(\d+(?:\.\d+)?)\s*(acres?|hectares?|ha|bighas?|biswa|gunthas?|sq\.?\s*(?:meters?|yards?|feet|ft))?", text, re.I)
        if m_area:
            val = float(m_area.group(1))
            unit_raw = m_area.group(2) or "Acres"
            parsed["area_value"] = val
            
            # Normalize unit
            unit_norm = unit_raw.lower().replace(".", "").strip()
            if "hect" in unit_norm or unit_norm == "ha":
                parsed["area_unit"] = "Hectares"
            elif "bigha" in unit_norm:
                parsed["area_unit"] = "Bigha"
            elif "guntha" in unit_norm:
                parsed["area_unit"] = "Guntha"
            elif "yard" in unit_norm:
                parsed["area_unit"] = "Sq. Yards"
            elif "meter" in unit_norm:
                parsed["area_unit"] = "Sq. Meters"
            else:
                parsed["area_unit"] = "Acres"

            multiplier = cls.UNIT_TO_ACRES.get(unit_norm, 1.0)
            parsed["area_acres"] = round(val * multiplier, 3)
            confidences["area"] = 94.0
        else:
            # Simple numeric area search
            m_num = re.search(r"(\d+(?:\.\d+)?)\s*(?:acres?|hectares?|bigha)", text, re.I)
            if m_num:
                parsed["area_value"] = float(m_num.group(1))
                parsed["area_unit"] = "Acres"
                parsed["area_acres"] = parsed["area_value"]
                confidences["area"] = 75.0

        # 9. Extract Land Classification
        for c in cls.KNOWN_CLASSIFICATIONS:
            tokens = c.lower().replace("(", "").replace(")", "").split()
            if any(t in text.lower() for t in tokens if len(t) > 4):
                parsed["land_classification"] = c
                confidences["land_classification"] = 92.0
                break
        if "nahri" in text.lower() or "canal" in text.lower():
            parsed["land_classification"] = "Agricultural (Nahri / Canal)"
            confidences["land_classification"] = 94.0
        elif "chahi" in text.lower() or "well" in text.lower():
            parsed["land_classification"] = "Agricultural (Chahi / Well)"
            confidences["land_classification"] = 94.0
        elif "commercial" in text.lower() or "na" in text.lower():
            parsed["land_classification"] = "Commercial / Industrial"
            confidences["land_classification"] = 91.0
        elif "abadi" in text.lower() or "residential" in text.lower():
            parsed["land_classification"] = "Residential (Abadi)"
            confidences["land_classification"] = 93.0

        # 10. Extract Date
        m_date = re.search(r"\b(\d{1,2}[-/\.]\d{1,2}[-/\.](?:19|20)\d{2}|(?:19|20)\d{2}[-/\.]\d{1,2}[-/\.]\d{1,2})\b", text)
        if m_date:
            parsed["registration_date"] = m_date.group(1).replace("/", "-").replace(".", "-")

        # 11. Calculate Overall Confidence
        weights = {
            "owner_name": 0.20,
            "khasra_number": 0.20,
            "area": 0.15,
            "village": 0.15,
            "tehsil": 0.10,
            "district": 0.10,
            "document_type": 0.05,
            "land_classification": 0.05,
        }
        
        overall = sum(confidences.get(k, 50.0) * w for k, w in weights.items())
        parsed["overall_confidence"] = round(overall, 1)
        parsed["field_confidences"] = confidences

        return parsed

    @classmethod
    def _empty_record(cls) -> dict:
        return {
            "owner_name": "Unextracted Owner",
            "parentage": "",
            "khata_number": "",
            "khasra_number": "",
            "area_value": 0.0,
            "area_unit": "Acres",
            "area_acres": 0.0,
            "village": "",
            "tehsil": "",
            "district": "",
            "state": "Rajasthan",
            "land_classification": "Agricultural (Irrigated)",
            "document_type": "Jamabandi / RoR",
            "registration_date": "",
            "overall_confidence": 20.0,
            "field_confidences": {
                "owner_name": 20.0,
                "khasra_number": 20.0,
                "area": 20.0,
                "village": 20.0,
                "tehsil": 20.0,
                "district": 20.0,
                "document_type": 30.0,
                "land_classification": 30.0,
            },
        }
