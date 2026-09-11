// Landmark-AI API & Dual-Mode Client Adapter
// Seamlessly communicates with FastAPI backend when available,
// with robust built-in mock fallback for standalone demo and static deployment.

const BACKEND_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

export const getStaticUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const cleanPath = path.replace(/^\/?(static\/)?/, '');
  return BACKEND_URL ? `${BACKEND_URL}/static/${cleanPath}` : `/static/${cleanPath}`;
};

// ==========================================
// MOCK DATA STORE (For Standalone & Offline)
// ==========================================

const INITIAL_SAMPLES = [
  {
    id: 'sample_jamabandi_1974',
    title: '1974 Handwritten Jamabandi (RoR)',
    subtitle: 'Chak 4-B, Tehsil Sanganer, Jaipur',
    script: 'Devanagari (Handwritten Hindi)',
    condition: 'Aged parchment, Faint ink, Folds',
    fields_count: 12,
    preview_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    mock_data: {
      owner_name: 'रामेश्वर पुत्र जगदीश प्रसाद शर्मा (Rameshwar Sharma)',
      parentage: 'Jagdish Prasad Sharma',
      khata_number: '142/38',
      khasra_number: '782/1',
      survey_number: 'SR-1974-942',
      ulpin: 'RJ-JAI-SAN-7821-4820',
      village: 'Sanganer Dehat',
      tehsil: 'Sanganer',
      district: 'Jaipur',
      state: 'Rajasthan',
      area_value: 4.85,
      area_unit: 'Acres',
      area_acres: 4.85,
      land_classification: 'Agricultural (Chahi / Irrigated)',
      ownership_type: 'Sole Ownership (Khatedari)',
      mutation_status: 'Mutation No. 341 Sanctioned',
      registration_date: '1974-08-14',
      overall_confidence: 93.4,
      field_confidences: {
        owner_name: 96.5,
        parentage: 94.0,
        khata_number: 98.0,
        khasra_number: 95.5,
        survey_number: 91.0,
        ulpin: 99.0,
        village: 97.0,
        tehsil: 96.0,
        district: 99.0,
        area_value: 88.5,
        land_classification: 92.0,
        mutation_status: 89.0,
      }
    }
  },
  {
    id: 'sample_urdu_mutation_1962',
    title: '1962 Urdu-Devanagari Dakhil Kharij Register',
    subtitle: 'Mauza Amber, District Jaipur',
    script: 'Shikasta Urdu + Devanagari',
    condition: 'Water-stained margins, brittle paper',
    fields_count: 14,
    preview_url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
    mock_data: {
      owner_name: 'हफीजुर रहमान खान वल्द मुनीर खान (Hafizur Rahman Khan)',
      parentage: 'Munir Ahmad Khan',
      khata_number: '89/12',
      khasra_number: '419/3',
      survey_number: 'AMB-62-108',
      ulpin: 'RJ-JAI-AMB-4193-9021',
      village: 'Amer Kasba',
      tehsil: 'Amer',
      district: 'Jaipur',
      state: 'Rajasthan',
      area_value: 3.20,
      area_unit: 'Bighas',
      area_acres: 2.00,
      land_classification: 'Agricultural (Nahri / Canal-fed)',
      ownership_type: 'Joint Family Khata',
      mutation_status: 'Mutation Verified (Dakhil Kharij)',
      registration_date: '1962-11-20',
      overall_confidence: 86.8,
      field_confidences: {
        owner_name: 84.0,
        parentage: 82.5,
        khata_number: 95.0,
        khasra_number: 89.0,
        survey_number: 81.0,
        ulpin: 98.0,
        village: 94.0,
        tehsil: 95.0,
        district: 99.0,
        area_value: 79.5,
        land_classification: 88.0,
        mutation_status: 78.0,
      }
    }
  },
  {
    id: 'sample_sale_deed_1985',
    title: '1985 Registered Sale Deed (Bainama)',
    subtitle: 'Sub-Registrar Office, Jodhpur South',
    script: 'Standard Hindi (Typewritten + Hand Stamp)',
    condition: 'Clean text, Revenue stamp seal blur',
    fields_count: 15,
    preview_url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    mock_data: {
      owner_name: 'सुरेश कुमार चौधरी पुत्र नारायण लाल (Suresh Choudhary)',
      parentage: 'Narayan Lal Choudhary',
      khata_number: '210/45',
      khasra_number: '1104',
      survey_number: 'JDH-85-449',
      ulpin: 'RJ-JDH-LUN-1104-5512',
      village: 'Luni',
      tehsil: 'Luni',
      district: 'Jodhpur',
      state: 'Rajasthan',
      area_value: 6.50,
      area_unit: 'Acres',
      area_acres: 6.50,
      land_classification: 'Commercial / Mixed Use',
      ownership_type: 'Freehold Individual',
      mutation_status: 'Registered Transfer',
      registration_date: '1985-04-09',
      overall_confidence: 96.2,
      field_confidences: {
        owner_name: 98.0,
        parentage: 97.0,
        khata_number: 99.0,
        khasra_number: 99.0,
        survey_number: 95.0,
        ulpin: 99.5,
        village: 98.0,
        tehsil: 98.0,
        district: 99.5,
        area_value: 96.0,
        land_classification: 94.0,
        mutation_status: 97.0,
      }
    }
  },
  {
    id: 'sample_khasra_girdawari',
    title: '1998 Khasra Girdawari Crop Register',
    subtitle: 'Patwar Circle Bassi, Jaipur',
    script: 'Devanagari Tabular Register',
    condition: 'Ink bleed, Column line shifts',
    fields_count: 11,
    preview_url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80',
    mock_data: {
      owner_name: 'कमला देवी पत्नी स्वर्गीय ओम प्रकाश (Kamla Devi)',
      parentage: 'Late Om Prakash Meena',
      khata_number: '64/09',
      khasra_number: '552/4',
      survey_number: 'BSI-98-311',
      ulpin: 'RJ-JAI-BAS-0552-8834',
      village: 'Bassi Khurd',
      tehsil: 'Bassi',
      district: 'Jaipur',
      state: 'Rajasthan',
      area_value: 2.75,
      area_unit: 'Hectares',
      area_acres: 6.80,
      land_classification: 'Agricultural (Un-irrigated / Barani)',
      ownership_type: 'Individual Female Title',
      mutation_status: 'Varisan / Inheritance Sanctioned',
      registration_date: '1998-10-12',
      overall_confidence: 91.0,
      field_confidences: {
        owner_name: 94.0,
        parentage: 90.0,
        khata_number: 93.0,
        khasra_number: 95.0,
        survey_number: 88.0,
        ulpin: 98.0,
        village: 96.0,
        tehsil: 95.0,
        district: 99.0,
        area_value: 86.0,
        land_classification: 90.0,
        mutation_status: 87.0,
      }
    }
  }
];

let mockRecords = [
  {
    id: 101,
    record_identifier: 'BHU-REC-2026-001',
    owner_name: 'रामेश्वर पुत्र जगदीश प्रसाद शर्मा (Rameshwar Sharma)',
    parentage: 'Jagdish Prasad Sharma',
    khata_number: '142/38',
    khasra_number: '782/1',
    survey_number: 'SR-1974-942',
    ulpin: 'RJ-JAI-SAN-7821-4820',
    village: 'Sanganer Dehat',
    tehsil: 'Sanganer',
    district: 'Jaipur',
    state: 'Rajasthan',
    area_value: 4.85,
    area_unit: 'Acres',
    area_acres: 4.85,
    land_classification: 'Agricultural (Chahi / Irrigated)',
    ownership_type: 'Sole Ownership',
    document_type: 'Jamabandi / RoR',
    mutation_status: 'Mutation No. 341 Sanctioned',
    registration_date: '1974-08-14',
    overall_confidence: 94.2,
    field_confidences: {
      owner_name: 96.5,
      parentage: 94.0,
      khata_number: 98.0,
      khasra_number: 95.5,
      area_value: 88.5,
      land_classification: 92.0,
      village: 97.0,
      tehsil: 96.0,
      district: 99.0,
    },
    status: 'AUTO_VERIFIED',
    is_flagged: false,
    flag_reason: null,
    reviewer_notes: 'OCR entity alignment validated with cadastral map layer',
    reviewed_by: 'AI Engine Pipeline',
    reviewed_at: '2026-09-08T14:20:00Z',
    created_at: '2026-09-08T14:15:00Z',
    updated_at: '2026-09-08T14:20:00Z',
    document_filepath: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    validation_issues: []
  },
  {
    id: 102,
    record_identifier: 'BHU-REC-2026-002',
    owner_name: 'हफीजुर रहमान खान वल्द मुनीर खान (Hafizur Rahman)',
    parentage: 'Munir Ahmad Khan',
    khata_number: '89/12',
    khasra_number: '419/3',
    survey_number: 'AMB-62-108',
    ulpin: 'RJ-JAI-AMB-4193-9021',
    village: 'Amer Kasba',
    tehsil: 'Amer',
    district: 'Jaipur',
    state: 'Rajasthan',
    area_value: 3.20,
    area_unit: 'Bighas',
    area_acres: 2.00,
    land_classification: 'Agricultural (Nahri / Canal-fed)',
    ownership_type: 'Joint Family Khata',
    document_type: 'Mutation Register (Dakhil Kharij)',
    mutation_status: 'Pending Officer Signoff',
    registration_date: '1962-11-20',
    overall_confidence: 76.5,
    field_confidences: {
      owner_name: 74.0,
      parentage: 72.5,
      khata_number: 95.0,
      khasra_number: 78.0,
      area_value: 69.5,
      land_classification: 88.0,
      village: 94.0,
      tehsil: 95.0,
      district: 99.0,
    },
    status: 'PENDING_REVIEW',
    is_flagged: true,
    flag_reason: 'Faint Urdu script character ambiguity in owner patronymic & area value',
    reviewer_notes: null,
    reviewed_by: null,
    reviewed_at: null,
    created_at: '2026-09-09T09:30:00Z',
    updated_at: '2026-09-09T09:30:00Z',
    document_filepath: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
    validation_issues: [
      {
        id: 1,
        issue_type: 'LOW_CONFIDENCE',
        severity: 'WARNING',
        field_name: 'area_value',
        message: 'Area field confidence is 69.5% - needs Patwari confirmation',
        is_resolved: false
      }
    ]
  },
  {
    id: 103,
    record_identifier: 'BHU-REC-2026-003',
    owner_name: 'सुरेश कुमार चौधरी पुत्र नारायण लाल (Suresh Choudhary)',
    parentage: 'Narayan Lal Choudhary',
    khata_number: '210/45',
    khasra_number: '1104',
    survey_number: 'JDH-85-449',
    ulpin: 'RJ-JDH-LUN-1104-5512',
    village: 'Luni',
    tehsil: 'Luni',
    district: 'Jodhpur',
    state: 'Rajasthan',
    area_value: 6.50,
    area_unit: 'Acres',
    area_acres: 6.50,
    land_classification: 'Commercial / Mixed Use',
    ownership_type: 'Freehold Individual',
    document_type: 'Sale Deed (Bainama)',
    mutation_status: 'Registered Transfer Completed',
    registration_date: '1985-04-09',
    overall_confidence: 96.8,
    field_confidences: {
      owner_name: 98.0,
      parentage: 97.0,
      khata_number: 99.0,
      khasra_number: 99.0,
      area_value: 96.0,
      land_classification: 94.0,
      village: 98.0,
      tehsil: 98.0,
      district: 99.5,
    },
    status: 'HUMAN_VERIFIED',
    is_flagged: false,
    flag_reason: null,
    reviewer_notes: 'Verified by Tehsildar with digital token signature',
    reviewed_by: 'Rajesh Meena (Revenue Inspector)',
    reviewed_at: '2026-09-09T16:45:00Z',
    created_at: '2026-09-09T11:15:00Z',
    updated_at: '2026-09-09T16:45:00Z',
    document_filepath: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    validation_issues: []
  },
  {
    id: 104,
    record_identifier: 'BHU-REC-2026-004',
    owner_name: 'विकास गोयल पुत्र शांतिलाल गोयल (Vikas Goyal)',
    parentage: 'Shantilal Goyal',
    khata_number: '412/10',
    khasra_number: '782/1',
    survey_number: 'SR-2001-512',
    ulpin: 'RJ-JAI-SAN-7821-4820',
    village: 'Sanganer Dehat',
    tehsil: 'Sanganer',
    district: 'Jaipur',
    state: 'Rajasthan',
    area_value: 4.85,
    area_unit: 'Acres',
    area_acres: 4.85,
    land_classification: 'Agricultural (Irrigated)',
    ownership_type: 'Claimed Purchaser Title',
    document_type: 'Unregistered Agreement / Iqranama',
    mutation_status: 'Contested / Under Stay Order',
    registration_date: '2001-02-18',
    overall_confidence: 88.0,
    field_confidences: {
      owner_name: 91.0,
      parentage: 89.0,
      khata_number: 84.0,
      khasra_number: 95.0,
      area_value: 88.0,
      land_classification: 85.0,
      village: 96.0,
      tehsil: 95.0,
      district: 99.0,
    },
    status: 'FLAGGED',
    is_flagged: true,
    flag_reason: 'CRITICAL DUPLICATE: Khasra 782/1 is already officially recorded under Rameshwar Sharma (Record BHU-REC-2026-001)',
    reviewer_notes: 'Case referred to Sub-Divisional Magistrate (SDM) revenue court',
    reviewed_by: 'System Duplicate Detector',
    reviewed_at: '2026-09-10T08:10:00Z',
    created_at: '2026-09-10T08:00:00Z',
    updated_at: '2026-09-10T08:10:00Z',
    document_filepath: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    validation_issues: [
      {
        id: 2,
        issue_type: 'DUPLICATE_CLAIM',
        severity: 'CRITICAL',
        field_name: 'khasra_number',
        message: 'Khasra 782/1 already exists with conflicting title owner',
        is_resolved: false
      }
    ]
  },
  {
    id: 105,
    record_identifier: 'BHU-REC-2026-005',
    owner_name: 'कमला देवी पत्नी स्वर्गीय ओम प्रकाश (Kamla Devi)',
    parentage: 'Late Om Prakash Meena',
    khata_number: '64/09',
    khasra_number: '552/4',
    survey_number: 'BSI-98-311',
    ulpin: 'RJ-JAI-BAS-0552-8834',
    village: 'Bassi Khurd',
    tehsil: 'Bassi',
    district: 'Jaipur',
    state: 'Rajasthan',
    area_value: 6.80,
    area_unit: 'Acres',
    area_acres: 6.80,
    land_classification: 'Agricultural (Un-irrigated / Barani)',
    ownership_type: 'Individual Female Title',
    document_type: 'Khasra Girdawari',
    mutation_status: 'Varisan / Inheritance Sanctioned',
    registration_date: '1998-10-12',
    overall_confidence: 91.5,
    field_confidences: {
      owner_name: 94.0,
      parentage: 90.0,
      khata_number: 93.0,
      khasra_number: 95.0,
      area_value: 86.0,
      land_classification: 90.0,
      village: 96.0,
      tehsil: 95.0,
      district: 99.0,
    },
    status: 'AUTO_VERIFIED',
    is_flagged: false,
    flag_reason: null,
    reviewer_notes: 'Matched with Family Register and Death Certificate OCR',
    reviewed_by: 'AI Engine Pipeline',
    reviewed_at: '2026-09-10T12:00:00Z',
    created_at: '2026-09-10T11:45:00Z',
    updated_at: '2026-09-10T12:00:00Z',
    document_filepath: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=800&q=80',
    validation_issues: []
  },
  {
    id: 106,
    record_identifier: 'BHU-REC-2026-006',
    owner_name: 'आनंद राव भोसले (Anand Rao Bhosle)',
    parentage: 'Yashwant Rao Bhosle',
    khata_number: '112/03',
    khasra_number: '304/A',
    survey_number: 'PN-712-901',
    ulpin: 'MH-PUN-HAV-0304-7120',
    village: 'Haveli',
    tehsil: 'Haveli',
    district: 'Pune',
    state: 'Maharashtra',
    area_value: 8.40,
    area_unit: 'Acres',
    area_acres: 8.40,
    land_classification: 'Agricultural (Bagayat / Horticultural)',
    ownership_type: 'Joint Ancestral Property',
    document_type: '7/12 Extract (Saat Bara)',
    mutation_status: 'Pherphar No. 891 Approved',
    registration_date: '2004-06-19',
    overall_confidence: 95.0,
    field_confidences: {
      owner_name: 96.0,
      parentage: 95.0,
      khata_number: 97.0,
      khasra_number: 98.0,
      area_value: 94.0,
      land_classification: 93.0,
      village: 97.0,
      tehsil: 96.0,
      district: 99.0,
    },
    status: 'AUTO_VERIFIED',
    is_flagged: false,
    flag_reason: null,
    reviewer_notes: 'Saat Bara digital signature verified against Mahabhulekh API',
    reviewed_by: 'AI Engine Pipeline',
    reviewed_at: '2026-09-10T15:20:00Z',
    created_at: '2026-09-10T15:00:00Z',
    updated_at: '2026-09-10T15:20:00Z',
    document_filepath: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    validation_issues: []
  },
  {
    id: 107,
    record_identifier: 'BHU-REC-2026-007',
    owner_name: 'प्रदीप कुमार सिंह व अन्य (Pradeep Kumar Singh)',
    parentage: 'Birendra Singh',
    khata_number: '502/77',
    khasra_number: '912',
    survey_number: 'VAR-89-102',
    ulpin: 'UP-VAR-PIN-0912-4011',
    village: 'Pindra',
    tehsil: 'Pindra',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    area_value: 5.25,
    area_unit: 'Acres',
    area_acres: 5.25,
    land_classification: 'Residential (Abadi / Converted)',
    ownership_type: 'Multiple Co-sharers',
    document_type: 'Khatauni / CH-41',
    mutation_status: 'Sec 143 Conversion Sanctioned',
    registration_date: '1989-03-24',
    overall_confidence: 72.0,
    field_confidences: {
      owner_name: 70.0,
      parentage: 68.0,
      khata_number: 89.0,
      khasra_number: 75.0,
      area_value: 65.0,
      land_classification: 80.0,
      village: 92.0,
      tehsil: 91.0,
      district: 99.0,
    },
    status: 'PENDING_REVIEW',
    is_flagged: false,
    flag_reason: 'Faded carbon copy text on Section 143 non-agricultural order',
    reviewer_notes: null,
    reviewed_by: null,
    reviewed_at: null,
    created_at: '2026-09-11T04:10:00Z',
    updated_at: '2026-09-11T04:10:00Z',
    document_filepath: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
    validation_issues: [
      {
        id: 3,
        issue_type: 'LOW_CONFIDENCE',
        severity: 'WARNING',
        field_name: 'area_value',
        message: 'Area conversion fraction is ambiguous in carbon copy',
        is_resolved: false
      }
    ]
  },
  {
    id: 108,
    record_identifier: 'BHU-REC-2026-008',
    owner_name: 'मेसर्स अरावली रियल्टर्स प्रा. लि. (Aravali Realtors Pvt Ltd)',
    parentage: 'Director: Sanjay Singhal',
    khata_number: '991/14',
    khasra_number: '205/B',
    survey_number: 'ALW-14-883',
    ulpin: 'RJ-ALW-NEJ-0205-9920',
    village: 'Neemrana',
    tehsil: 'Behror',
    district: 'Alwar',
    state: 'Rajasthan',
    area_value: 12.00,
    area_unit: 'Acres',
    area_acres: 12.00,
    land_classification: 'Industrial Zone (RIICO Boundary)',
    ownership_type: 'Corporate Entity',
    document_type: 'Lease Agreement & Mutation',
    mutation_status: 'CAD Boundary Discrepancy',
    registration_date: '2014-11-05',
    overall_confidence: 89.0,
    field_confidences: {
      owner_name: 95.0,
      parentage: 92.0,
      khata_number: 96.0,
      khasra_number: 94.0,
      area_value: 80.0,
      land_classification: 95.0,
      village: 97.0,
      tehsil: 96.0,
      district: 99.0,
    },
    status: 'FLAGGED',
    is_flagged: true,
    flag_reason: 'CADASTRAL MISMATCH: Document claims 12.00 acres, GIS shapefile boundary measures 9.85 acres (2.15 acres excess claim)',
    reviewer_notes: 'Physical DGPS survey scheduled with Revenue Inspector',
    reviewed_by: 'GIS Boundary Engine',
    reviewed_at: '2026-09-11T07:20:00Z',
    created_at: '2026-09-11T07:00:00Z',
    updated_at: '2026-09-11T07:20:00Z',
    document_filepath: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
    validation_issues: [
      {
        id: 4,
        issue_type: 'SPATIAL_MISMATCH',
        severity: 'CRITICAL',
        field_name: 'area_acres',
        message: 'Spatial polygon area (9.85 acres) does not match deed (12.00 acres)',
        is_resolved: false
      }
    ]
  }
];

let mockAuditLogs = [
  {
    id: 1,
    land_record_id: 108,
    record_identifier: 'BHU-REC-2026-008',
    action: 'FLAGGED_ANOMALY',
    performed_by: 'GIS Spatial Validation Engine',
    user_role: 'System AI',
    notes: 'Spatial area mismatch detected: Deed 12.00 Acres vs Cadastral Polygon 9.85 Acres',
    changes: { field: 'area_acres', claimed: 12.00, spatial_calculated: 9.85, discrepancy: '+2.15 Acres' },
    created_at: '2026-09-11T07:20:00Z'
  },
  {
    id: 2,
    land_record_id: 107,
    record_identifier: 'BHU-REC-2026-007',
    action: 'QUEUED_FOR_HUMAN_REVIEW',
    performed_by: 'OCR Pipeline v2.4',
    user_role: 'System AI',
    notes: 'Record queued due to confidence 72.0% below auto-verify threshold (85%)',
    changes: { overall_confidence: 72.0, low_fields: ['area_value', 'owner_name'] },
    created_at: '2026-09-11T04:10:00Z'
  },
  {
    id: 3,
    land_record_id: 104,
    record_identifier: 'BHU-REC-2026-004',
    action: 'DUPLICATE_FLAGGED',
    performed_by: 'Bhu-Duplicate Cross-Matcher',
    user_role: 'System AI',
    notes: 'Khasra No 782/1 identified under conflicting ownership title with BHU-REC-2026-001',
    changes: { khasra_number: '782/1', conflicting_record: 'BHU-REC-2026-001' },
    created_at: '2026-09-10T08:10:00Z'
  },
  {
    id: 4,
    land_record_id: 103,
    record_identifier: 'BHU-REC-2026-003',
    action: 'HUMAN_VERIFIED_APPROVED',
    performed_by: 'Rajesh Meena (Revenue Inspector)',
    user_role: 'Verifier / Revenue Officer',
    notes: 'Verified against physically sealed Sub-Registrar volume register 1985',
    changes: { status_from: 'PENDING_REVIEW', status_to: 'HUMAN_VERIFIED' },
    created_at: '2026-09-09T16:45:00Z'
  },
  {
    id: 5,
    land_record_id: 101,
    record_identifier: 'BHU-REC-2026-001',
    action: 'AUTO_VERIFIED',
    performed_by: 'Landmark-AI Core Pipeline',
    user_role: 'System AI',
    notes: 'High confidence extraction (94.2%) with 0 spatial or duplicate anomalies',
    changes: { ulpin_generated: 'RJ-JAI-SAN-7821-4820', status: 'AUTO_VERIFIED' },
    created_at: '2026-09-08T14:20:00Z'
  },
  {
    id: 6,
    land_record_id: 105,
    record_identifier: 'BHU-REC-2026-005',
    action: 'NEW_RECORD_REGISTERED',
    performed_by: 'Sunil Sharma (Patwari Circle Bassi)',
    user_role: 'Patwari / Field Officer',
    notes: 'Succession mutation registered following demise of previous title holder',
    changes: { mutation_type: 'Varisan / Inheritance', applicant: 'Kamla Devi' },
    created_at: '2026-09-10T11:45:00Z'
  }
];

const MOCK_DISTRICTS = [
  {
    id: 1,
    district: 'Jaipur',
    state: 'Rajasthan',
    lat: 26.9124,
    lng: 75.7873,
    total_records: 48290,
    verified_records: 44100,
    pending_records: 3820,
    flagged_records: 370,
    accuracy_rate: 96.2,
    villages_count: 512,
    plots: [
      { khasra: '782/1', owner: 'Rameshwar Sharma', area: '4.85 Acres', ulpin: 'RJ-JAI-SAN-7821-4820', lat: 26.820, lng: 75.780, status: 'VERIFIED', type: 'Agricultural' },
      { khasra: '419/3', owner: 'Hafizur Rahman', area: '2.00 Acres', ulpin: 'RJ-JAI-AMB-4193-9021', lat: 26.985, lng: 75.850, status: 'PENDING', type: 'Agricultural' },
      { khasra: '552/4', owner: 'Kamla Devi', area: '6.80 Acres', ulpin: 'RJ-JAI-BAS-0552-8834', lat: 26.830, lng: 76.040, status: 'VERIFIED', type: 'Agricultural' },
      { khasra: '782/1-B', owner: 'Contested Parcel (Vikas Goyal)', area: '4.85 Acres', ulpin: 'RJ-JAI-SAN-7821-4820', lat: 26.822, lng: 75.782, status: 'FLAGGED', type: 'Contested' },
    ]
  },
  {
    id: 2,
    district: 'Jodhpur',
    state: 'Rajasthan',
    lat: 26.2389,
    lng: 73.0243,
    total_records: 36400,
    verified_records: 33890,
    pending_records: 2190,
    flagged_records: 320,
    accuracy_rate: 95.8,
    villages_count: 384,
    plots: [
      { khasra: '1104', owner: 'Suresh Choudhary', area: '6.50 Acres', ulpin: 'RJ-JDH-LUN-1104-5512', lat: 26.012, lng: 73.080, status: 'VERIFIED', type: 'Commercial' },
      { khasra: '914/2', owner: 'Mahesh Bhati', area: '12.40 Acres', ulpin: 'RJ-JDH-OSI-0914-1102', lat: 26.720, lng: 72.910, status: 'VERIFIED', type: 'Agricultural' }
    ]
  },
  {
    id: 3,
    district: 'Alwar',
    state: 'Rajasthan',
    lat: 27.5530,
    lng: 76.6346,
    total_records: 29150,
    verified_records: 25800,
    pending_records: 2900,
    flagged_records: 450,
    accuracy_rate: 93.4,
    villages_count: 420,
    plots: [
      { khasra: '205/B', owner: 'Aravali Realtors (Boundary Discrepancy)', area: '12.00 Acres (GIS 9.85)', ulpin: 'RJ-ALW-NEJ-0205-9920', lat: 27.980, lng: 76.380, status: 'FLAGGED', type: 'Industrial' }
    ]
  },
  {
    id: 4,
    district: 'Pune',
    state: 'Maharashtra',
    lat: 18.5204,
    lng: 73.8567,
    total_records: 52100,
    verified_records: 48900,
    pending_records: 2850,
    flagged_records: 350,
    accuracy_rate: 96.9,
    villages_count: 610,
    plots: [
      { khasra: '304/A', owner: 'Anand Rao Bhosle', area: '8.40 Acres', ulpin: 'MH-PUN-HAV-0304-7120', lat: 18.490, lng: 73.910, status: 'VERIFIED', type: 'Agricultural' }
    ]
  },
  {
    id: 5,
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    lat: 25.3176,
    lng: 82.9739,
    total_records: 41800,
    verified_records: 37400,
    pending_records: 3950,
    flagged_records: 450,
    accuracy_rate: 92.8,
    villages_count: 490,
    plots: [
      { khasra: '912', owner: 'Pradeep Kumar Singh', area: '5.25 Acres', ulpin: 'UP-VAR-PIN-0912-4011', lat: 25.450, lng: 82.880, status: 'PENDING', type: 'Residential' }
    ]
  },
  {
    id: 6,
    district: 'Bhopal',
    state: 'Madhya Pradesh',
    lat: 23.2599,
    lng: 77.4126,
    total_records: 31200,
    verified_records: 28600,
    pending_records: 2280,
    flagged_records: 320,
    accuracy_rate: 94.6,
    villages_count: 360,
    plots: [
      { khasra: '144/2', owner: 'Digvijay Patel', area: '7.10 Acres', ulpin: 'MP-BHP-BER-0144-8812', lat: 23.310, lng: 77.380, status: 'VERIFIED', type: 'Agricultural' }
    ]
  }
];

// Helper to calculate mock stats
const calculateMockStats = () => {
  const total = mockRecords.length + 1428900;
  const autoVerified = Math.round(total * 0.78);
  const humanVerified = Math.round(total * 0.16);
  const pending = mockRecords.filter(r => r.status === 'PENDING_REVIEW').length + 3840;
  const flagged = mockRecords.filter(r => r.is_flagged || r.status === 'FLAGGED').length + 1420;
  const rejected = 890;

  return {
    summary: {
      total_documents: total,
      auto_verified: autoVerified,
      human_verified: humanVerified,
      pending_review: pending,
      flagged_issues: flagged,
      rejected: rejected,
      overall_accuracy: 94.8,
      states_onboarded: 28,
      districts_onboarded: 412,
      ulpins_generated: total - 4200,
      fraud_prevented: flagged,
    },
    accuracy_timeline: [
      { month: 'Apr', accuracy: 88.4, volume: 84000 },
      { month: 'May', accuracy: 89.8, volume: 112000 },
      { month: 'Jun', accuracy: 91.2, volume: 145000 },
      { month: 'Jul', accuracy: 92.9, volume: 198000 },
      { month: 'Aug', accuracy: 94.1, volume: 245000 },
      { month: 'Sep (Current)', accuracy: 95.3, volume: 310000 },
    ],
    status_breakdown: [
      { name: 'Auto Verified (AI >= 85%)', value: autoVerified, color: '#10B981' },
      { name: 'Officer Verified', value: humanVerified, color: '#3B82F6' },
      { name: 'Pending Review', value: pending, color: '#F59E0B' },
      { name: 'Flagged / Anomaly', value: flagged, color: '#EF4444' },
      { name: 'Rejected', value: rejected, color: '#6B7280' },
    ],
    confidence_distribution: [
      { range: '90-100% High Confidence', count: 1115000, percentage: 78.0 },
      { range: '75-89% Medium Confidence', count: 242000, percentage: 17.0 },
      { range: '< 75% Low / Review Needed', count: 71900, percentage: 5.0 },
    ],
    error_statistics: [
      { error_type: 'OCR Character Ambiguity (Urdu/Old Devanagari)', count: 4820, percentage: 38 },
      { error_type: 'Cadastral GIS Area Boundary Discrepancy', count: 3110, percentage: 25 },
      { error_type: 'Duplicate Khasra Multi-Claim Suspicion', count: 2450, percentage: 19 },
      { error_type: 'Missing / Illegible Khata or Sub-division', count: 1420, percentage: 11 },
      { error_type: 'Encumbrance / Prohibited Waqf Land Alert', count: 890, percentage: 7 },
    ],
    doc_type_breakdown: [
      { name: 'Jamabandi / RoR', value: 580000 },
      { name: 'Mutation Registers', value: 390000 },
      { name: 'Sale Deeds (Bainama)', value: 240000 },
      { name: 'Khasra Girdawari', value: 160000 },
      { name: '7/12 Extract (Saat Bara)', value: 58900 },
    ],
    recent_activities: mockAuditLogs.slice(0, 6)
  };
};

// ==========================================
// EXPORT API SERVICE
// ==========================================

export const api = {
  // Dashboard & Analytics
  getStats: async () => {
    try {
      const res = await fetch(`${API_BASE}/dashboard/stats`);
      if (res.ok) return await res.json();
    } catch {
      // ignore network errors and fallback
    }
    return calculateMockStats();
  },

  // Districts & GIS Map
  getDistricts: async () => {
    try {
      const res = await fetch(`${API_BASE}/districts`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) return data;
      }
    } catch {
      // fallback
    }
    return MOCK_DISTRICTS;
  },

  // Land Records
  getRecords: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, val);
        }
      });
      const res = await fetch(`${API_BASE}/records?${query.toString()}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    let filtered = [...mockRecords];
    if (params.search) {
      const s = params.search.toLowerCase();
      filtered = filtered.filter(
        r =>
          r.owner_name.toLowerCase().includes(s) ||
          r.record_identifier.toLowerCase().includes(s) ||
          r.khasra_number.toLowerCase().includes(s) ||
          r.village.toLowerCase().includes(s) ||
          r.district.toLowerCase().includes(s) ||
          (r.ulpin && r.ulpin.toLowerCase().includes(s))
      );
    }
    if (params.district) {
      filtered = filtered.filter(r => r.district.toLowerCase() === params.district.toLowerCase());
    }
    if (params.status) {
      filtered = filtered.filter(r => r.status === params.status);
    }
    if (params.is_flagged !== undefined && params.is_flagged !== null && params.is_flagged !== '') {
      const isFlag = String(params.is_flagged) === 'true';
      filtered = filtered.filter(r => r.is_flagged === isFlag);
    }

    const page = parseInt(params.page || 1, 10);
    const pageSize = parseInt(params.page_size || 50, 10);
    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    return {
      items: paginated,
      total,
      page,
      page_size: pageSize,
      total_pages: Math.ceil(total / pageSize) || 1,
    };
  },

  getRecordDetail: async (id) => {
    try {
      const res = await fetch(`${API_BASE}/records/${id}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const found = mockRecords.find(r => r.id === Number(id));
    if (found) {
      const recordLogs = mockAuditLogs.filter(l => l.land_record_id === found.id);
      return { ...found, audit_logs: recordLogs };
    }
    throw new Error('Record not found');
  },

  createRecord: async (data) => {
    try {
      const res = await fetch(`${API_BASE}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const newId = Date.now();
    const stateCode = (data.state || 'RJ').slice(0, 2).toUpperCase();
    const distCode = (data.district || 'JAI').slice(0, 3).toUpperCase();
    const khasraClean = (data.khasra_number || '000').replace(/[^a-zA-Z0-9]/g, '');
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedUlpin = `${stateCode}-${distCode}-${khasraClean}-${randSuffix}`;

    const newRecord = {
      id: newId,
      record_identifier: `BHU-REC-${new Date().getFullYear()}-${String(mockRecords.length + 1).padStart(3, '0')}`,
      owner_name: data.owner_name,
      parentage: data.parentage || '',
      khata_number: data.khata_number || '',
      khasra_number: data.khasra_number,
      survey_number: data.survey_number || `SRV-${randSuffix}`,
      ulpin: data.ulpin || generatedUlpin,
      village: data.village,
      tehsil: data.tehsil,
      district: data.district,
      state: data.state || 'Rajasthan',
      area_value: parseFloat(data.area_value) || 1.0,
      area_unit: data.area_unit || 'Acres',
      area_acres: parseFloat(data.area_acres || data.area_value) || 1.0,
      land_classification: data.land_classification || 'Agricultural (Irrigated)',
      ownership_type: data.ownership_type || 'Sole Ownership',
      document_type: data.document_type || 'New Registration',
      mutation_status: 'Mutation Initiated / In-Process',
      registration_date: data.registration_date || new Date().toISOString().split('T')[0],
      overall_confidence: 95.0,
      field_confidences: {
        owner_name: 98.0,
        khasra_number: 99.0,
        village: 97.0,
        district: 99.0,
      },
      status: 'PENDING_REVIEW',
      is_flagged: false,
      flag_reason: null,
      reviewer_notes: data.notes || 'Created via Landmark-AI New Registration Portal',
      reviewed_by: null,
      reviewed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      document_filepath: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      validation_issues: [],
    };

    mockRecords.unshift(newRecord);

    mockAuditLogs.unshift({
      id: Date.now(),
      land_record_id: newId,
      record_identifier: newRecord.record_identifier,
      action: 'NEW_RECORD_REGISTERED',
      performed_by: data.submitted_by || 'Citizen / Field Portal',
      user_role: 'Registrar User',
      notes: `New record registered for Khasra ${newRecord.khasra_number} (${newRecord.owner_name})`,
      changes: { owner_name: newRecord.owner_name, khasra_number: newRecord.khasra_number, ulpin: newRecord.ulpin },
      created_at: new Date().toISOString()
    });

    return newRecord;
  },

  checkDuplicate: async (data) => {
    try {
      const res = await fetch(`${API_BASE}/records/check-duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const khasra = data.khasra_number ? data.khasra_number.trim().toLowerCase() : '';
    const village = data.village ? data.village.trim().toLowerCase() : '';

    const matching = mockRecords.find(
      r => r.khasra_number.trim().toLowerCase() === khasra &&
           (!village || r.village.trim().toLowerCase() === village)
    );

    if (matching) {
      return {
        is_duplicate: true,
        risk_level: 'HIGH',
        message: `Khasra No. ${data.khasra_number} is already registered under '${matching.owner_name}' in ${matching.village}`,
        conflicting_record: matching,
      };
    }

    return {
      is_duplicate: false,
      risk_level: 'LOW',
      message: 'No conflicting parcel or ownership collision detected.',
      conflicting_record: null,
    };
  },

  updateRecord: async (id, data) => {
    try {
      const res = await fetch(`${API_BASE}/records/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const idx = mockRecords.findIndex(r => r.id === Number(id));
    if (idx !== -1) {
      mockRecords[idx] = {
        ...mockRecords[idx],
        ...data,
        updated_at: new Date().toISOString(),
      };

      mockAuditLogs.unshift({
        id: Date.now(),
        land_record_id: Number(id),
        record_identifier: mockRecords[idx].record_identifier,
        action: 'HUMAN_FIELD_MODIFIED',
        performed_by: data.updated_by || 'Patwari / Revenue Officer',
        user_role: 'Revenue Officer',
        notes: data.notes || 'Fields manually confirmed and corrected',
        changes: data,
        created_at: new Date().toISOString()
      });

      return mockRecords[idx];
    }
    throw new Error('Record not found');
  },

  verifyRecord: async (id, data = {}) => {
    try {
      const res = await fetch(`${API_BASE}/records/${id}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const idx = mockRecords.findIndex(r => r.id === Number(id));
    if (idx !== -1) {
      mockRecords[idx].status = 'HUMAN_VERIFIED';
      mockRecords[idx].is_flagged = false;
      mockRecords[idx].reviewed_by = data.reviewed_by || 'Revenue Inspector / Verifier';
      mockRecords[idx].reviewer_notes = data.notes || 'Manually approved & verified in revenue records';
      mockRecords[idx].reviewed_at = new Date().toISOString();
      mockRecords[idx].updated_at = new Date().toISOString();

      mockAuditLogs.unshift({
        id: Date.now(),
        land_record_id: Number(id),
        record_identifier: mockRecords[idx].record_identifier,
        action: 'HUMAN_VERIFIED_APPROVED',
        performed_by: data.reviewed_by || 'Revenue Inspector / Verifier',
        user_role: 'Verifier / Revenue Officer',
        notes: data.notes || 'Manually approved & verified in revenue records',
        changes: { status: 'HUMAN_VERIFIED' },
        created_at: new Date().toISOString()
      });

      return mockRecords[idx];
    }
    throw new Error('Record not found');
  },

  rejectRecord: async (id, reason = 'Document data could not be verified') => {
    try {
      const res = await fetch(`${API_BASE}/records/${id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const idx = mockRecords.findIndex(r => r.id === Number(id));
    if (idx !== -1) {
      mockRecords[idx].status = 'REJECTED';
      mockRecords[idx].reviewer_notes = `Rejected: ${reason}`;
      mockRecords[idx].reviewed_by = 'Revenue Officer';
      mockRecords[idx].reviewed_at = new Date().toISOString();
      mockRecords[idx].updated_at = new Date().toISOString();

      mockAuditLogs.unshift({
        id: Date.now(),
        land_record_id: Number(id),
        record_identifier: mockRecords[idx].record_identifier,
        action: 'RECORD_REJECTED',
        performed_by: 'Revenue Officer',
        user_role: 'Verifier / Revenue Officer',
        notes: reason,
        changes: { status: 'REJECTED', reason },
        created_at: new Date().toISOString()
      });

      return mockRecords[idx];
    }
    throw new Error('Record not found');
  },

  resolveFlag: async (id, actionType, notes) => {
    const idx = mockRecords.findIndex(r => r.id === Number(id));
    if (idx !== -1) {
      if (actionType === 'GENUINE') {
        mockRecords[idx].is_flagged = false;
        mockRecords[idx].status = 'HUMAN_VERIFIED';
      } else if (actionType === 'DUPLICATE') {
        mockRecords[idx].is_flagged = true;
        mockRecords[idx].status = 'REJECTED';
      } else if (actionType === 'ESCALATE') {
        mockRecords[idx].is_flagged = true;
        mockRecords[idx].status = 'FLAGGED';
      }
      mockRecords[idx].reviewer_notes = notes || `Flag resolved as: ${actionType}`;
      mockRecords[idx].updated_at = new Date().toISOString();

      mockAuditLogs.unshift({
        id: Date.now(),
        land_record_id: Number(id),
        record_identifier: mockRecords[idx].record_identifier,
        action: `FRAUD_FLAG_RESOLVED_${actionType}`,
        performed_by: 'District Admin / Tehsildar',
        user_role: 'District Admin',
        notes: notes || `Resolved as ${actionType}`,
        changes: { resolution: actionType, new_status: mockRecords[idx].status },
        created_at: new Date().toISOString()
      });

      return mockRecords[idx];
    }
    throw new Error('Record not found');
  },

  // OCR & Upload Studio
  getSamples: async () => {
    try {
      const res = await fetch(`${API_BASE}/ocr/samples`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return INITIAL_SAMPLES;
  },

  processSample: async (sampleId, preset = 'standard') => {
    try {
      const res = await fetch(`${API_BASE}/ocr/process-sample`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sample_id: sampleId, preset }),
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    const sample = INITIAL_SAMPLES.find(s => s.id === sampleId) || INITIAL_SAMPLES[0];
    const newId = Date.now();
    const createdRecord = {
      id: newId,
      record_identifier: `BHU-OCR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      ...sample.mock_data,
      document_filepath: sample.preview_url,
      status: sample.mock_data.overall_confidence >= 85 ? 'AUTO_VERIFIED' : 'PENDING_REVIEW',
      is_flagged: sample.mock_data.overall_confidence < 85,
      flag_reason: sample.mock_data.overall_confidence < 85 ? 'Low OCR confidence on historical script' : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      validation_issues: [],
    };

    mockRecords.unshift(createdRecord);
    return createdRecord;
  },

  uploadFile: async (file, preset = 'standard') => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('preset', preset);
      const res = await fetch(`${API_BASE}/ocr/upload`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback simulation
    }

    // Simulate OCR Extraction from uploaded file
    const newId = Date.now();
    const randNum = Math.floor(100 + Math.random() * 900);
    const isGoodConfidence = Math.random() > 0.25;
    const overallConf = isGoodConfidence ? (88 + Math.random() * 8) : (68 + Math.random() * 10);

    const generatedRecord = {
      id: newId,
      record_identifier: `BHU-OCR-${new Date().getFullYear()}-${randNum}`,
      owner_name: `राजेन्द्र कुमार शर्मा पुत्र रामलाल (Rajendra Sharma)`,
      parentage: 'Ramlal Sharma',
      khata_number: `${Math.floor(50 + Math.random() * 200)}/${Math.floor(10 + Math.random() * 50)}`,
      khasra_number: `${Math.floor(100 + Math.random() * 800)}/${Math.floor(1 + Math.random() * 4)}`,
      survey_number: `SRV-${randNum}`,
      ulpin: `RJ-JAI-SAN-${randNum}-9812`,
      village: 'Sanganer Dehat',
      tehsil: 'Sanganer',
      district: 'Jaipur',
      state: 'Rajasthan',
      area_value: 3.50,
      area_unit: 'Acres',
      area_acres: 3.50,
      land_classification: 'Agricultural (Irrigated)',
      ownership_type: 'Sole Ownership',
      document_type: file.name.toLowerCase().includes('deed') ? 'Sale Deed (Bainama)' : 'Jamabandi / RoR',
      mutation_status: 'Extracted from Scanned Document',
      registration_date: '1982-05-14',
      overall_confidence: Math.round(overallConf * 10) / 10,
      field_confidences: {
        owner_name: isGoodConfidence ? 95.0 : 71.0,
        parentage: isGoodConfidence ? 92.0 : 68.0,
        khata_number: 94.0,
        khasra_number: isGoodConfidence ? 96.0 : 75.0,
        area_value: isGoodConfidence ? 91.0 : 64.0,
        village: 96.0,
        tehsil: 95.0,
        district: 99.0,
      },
      status: overallConf >= 85 ? 'AUTO_VERIFIED' : 'PENDING_REVIEW',
      is_flagged: overallConf < 85,
      flag_reason: overallConf < 85 ? 'Aged paper distortion - area and owner name require human verification' : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      document_filepath: URL.createObjectURL(file),
      validation_issues: overallConf < 85 ? [
        {
          id: Date.now(),
          issue_type: 'LOW_CONFIDENCE',
          severity: 'WARNING',
          field_name: 'area_value',
          message: 'Low confidence score on handwritten numerals',
          is_resolved: false
        }
      ] : []
    };

    mockRecords.unshift(generatedRecord);

    mockAuditLogs.unshift({
      id: Date.now(),
      land_record_id: newId,
      record_identifier: generatedRecord.record_identifier,
      action: 'DOCUMENT_UPLOAD_OCR_PARSED',
      performed_by: 'User Upload (Preset: ' + preset + ')',
      user_role: 'Patwari / Officer',
      notes: `Uploaded file "${file.name}" processed with AI OCR Engine (Score: ${generatedRecord.overall_confidence}%)`,
      changes: { filename: file.name, confidence: generatedRecord.overall_confidence },
      created_at: new Date().toISOString()
    });

    return generatedRecord;
  },

  // Audit Logs
  getAuditLogs: async (params = {}) => {
    try {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, val);
        }
      });
      const res = await fetch(`${API_BASE}/records/audit-logs?${query.toString()}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }

    let list = [...mockAuditLogs];
    if (params.search) {
      const s = params.search.toLowerCase();
      list = list.filter(
        l =>
          (l.record_identifier && l.record_identifier.toLowerCase().includes(s)) ||
          (l.performed_by && l.performed_by.toLowerCase().includes(s)) ||
          (l.action && l.action.toLowerCase().includes(s)) ||
          (l.notes && l.notes.toLowerCase().includes(s))
      );
    }
    if (params.action) {
      list = list.filter(l => l.action.toLowerCase().includes(params.action.toLowerCase()));
    }
    return list;
  },

  // Fraud / Duplicates
  getFraudFlags: async () => {
    try {
      const res = await fetch(`${API_BASE}/records?is_flagged=true`);
      if (res.ok) {
        const data = await res.json();
        return data.items || [];
      }
    } catch {
      // fallback
    }
    return mockRecords.filter(r => r.is_flagged || r.status === 'FLAGGED');
  },

  // Export Helpers
  exportCSV: (filename, rows) => {
    if (!rows || !rows.length) return;
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      rows
        .map(row => {
          return keys
            .map(k => {
              let cell = row[k] === null || row[k] === undefined ? '' : row[k];
              cell = typeof cell === 'object' ? JSON.stringify(cell).replace(/"/g, '""') : String(cell).replace(/"/g, '""');
              if (cell.search(/("|,|\n)/g) >= 0) {
                cell = `"${cell}"`;
              }
              return cell;
            })
            .join(separator);
        })
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportJSON: (filename, data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
