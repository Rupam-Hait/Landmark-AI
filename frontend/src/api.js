const BACKEND_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

export const getStaticUrl = (path) => {
  if (!path) return '';
  const cleanPath = path.replace(/^\/?(static\/)?/, '');
  return BACKEND_URL ? `${BACKEND_URL}/static/${cleanPath}` : `/static/${cleanPath}`;
};

export const api = {
  // Dashboard
  getStats: async () => {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  // Districts Map
  getDistricts: async () => {
    const res = await fetch(`${API_BASE}/districts`);
    if (!res.ok) throw new Error('Failed to fetch districts');
    return res.json();
  },

  // Records
  getRecords: async (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const res = await fetch(`${API_BASE}/records?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch records');
    return res.json();
  },

  getRecordDetail: async (id) => {
    const res = await fetch(`${API_BASE}/records/${id}`);
    if (!res.ok) throw new Error('Failed to fetch record details');
    return res.json();
  },

  createRecord: async (data) => {
    const res = await fetch(`${API_BASE}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to create land record');
    }
    return res.json();
  },

  checkDuplicate: async (data) => {
    const res = await fetch(`${API_BASE}/records/check-duplicate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to pre-validate record');
    return res.json();
  },

  updateRecord: async (id, data) => {
    const res = await fetch(`${API_BASE}/records/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update record');
    return res.json();
  },

  verifyRecord: async (id, data = {}) => {
    const res = await fetch(`${API_BASE}/records/${id}/verify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to verify record');
    return res.json();
  },

  rejectRecord: async (id, reason) => {
    const res = await fetch(`${API_BASE}/records/${id}/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error('Failed to reject record');
    return res.json();
  },

  // OCR & Uploads
  getSamples: async () => {
    const res = await fetch(`${API_BASE}/ocr/samples`);
    if (!res.ok) throw new Error('Failed to fetch sample documents');
    return res.json();
  },

  processSample: async (sampleId, preset = 'standard') => {
    const res = await fetch(`${API_BASE}/ocr/process-sample`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sample_id: sampleId, preset }),
    });
    if (!res.ok) throw new Error('Failed to process sample document');
    return res.json();
  },

  uploadFile: async (file, preset = 'standard') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('preset', preset);
    const res = await fetch(`${API_BASE}/ocr/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload and process document');
    return res.json();
  },

  getPreprocessPreview: async (imagePath, preset) => {
    const res = await fetch(`${API_BASE}/ocr/preprocess-preview`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_path: imagePath, preset }),
    });
    if (!res.ok) throw new Error('Failed to generate preview');
    return res.json();
  },
};
