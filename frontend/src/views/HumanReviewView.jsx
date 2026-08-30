import React, { useState, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Save,
  FileText,
  UserCheck,
  AlertOctagon,
  Sparkles,
  Layers,
  ArrowRightLeft,
  RefreshCw,
} from 'lucide-react';
import { api, getStaticUrl } from '../api';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { StatusBadge } from '../components/StatusBadge';

export const HumanReviewView = ({ selectedRecordId, onRecordUpdated, onNavigate }) => {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imagePreset, setImagePreset] = useState('standard');
  const [previewImageUrl, setPreviewImageUrl] = useState(null);
  const [officerName, setOfficerName] = useState('Officer S. K. Sharma');
  const [officerNotes, setOfficerNotes] = useState('Document verified against cadastral sheet and revenue ledger.');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Illegible handwritten script in area column');
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Fetch pending review queue
  const fetchQueue = async () => {
    try {
      setLoading(true);
      const resPending = await api.getRecords({ status: 'PENDING_REVIEW', page_size: 50 });
      const resFlagged = await api.getRecords({ status: 'FLAGGED', page_size: 50 });
      const combined = [...(resPending.items || []), ...(resFlagged.items || [])];

      setQueue(combined);

      if (combined.length > 0) {
        let targetIdx = 0;
        if (selectedRecordId) {
          const found = combined.findIndex((r) => r.id === selectedRecordId);
          if (found !== -1) targetIdx = found;
        }
        setCurrentIndex(targetIdx);
        loadRecordDetails(combined[targetIdx].id);
      } else {
        setCurrentRecord(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadRecordDetails = async (id) => {
    try {
      const details = await api.getRecordDetail(id);
      setCurrentRecord(details);
      setFormData({
        owner_name: details.owner_name || '',
        parentage: details.parentage || '',
        khasra_number: details.khasra_number || '',
        khata_number: details.khata_number || '',
        area_value: details.area_value || 0,
        area_unit: details.area_unit || 'Acres',
        village: details.village || '',
        tehsil: details.tehsil || '',
        district: details.district || '',
        state: details.state || 'Rajasthan',
        land_classification: details.land_classification || 'Agricultural (Irrigated)',
        document_type: details.document_type || 'Jamabandi / RoR',
        registration_date: details.registration_date || '',
      });
      setOfficerNotes(details.reviewer_notes || 'Document verified against cadastral sheet.');
      setPreviewImageUrl(null);
      setImagePreset('standard');
      setZoomLevel(1);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [selectedRecordId]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePresetChange = async (preset) => {
    setImagePreset(preset);
    if (!currentRecord?.document_filepath) return;
    try {
      const res = await api.getPreprocessPreview(currentRecord.document_filepath, preset);
      setPreviewImageUrl(res.preview_url);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveDraft = async () => {
    if (!currentRecord) return;
    try {
      setSaving(true);
      const updated = await api.updateRecord(currentRecord.id, {
        ...formData,
        reviewed_by: officerName,
        reviewer_notes: officerNotes,
      });
      setCurrentRecord(updated);
      setFeedbackMsg({ type: 'success', text: 'Draft edits and validation re-evaluated successfully!' });
      setTimeout(() => setFeedbackMsg(null), 3000);
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    if (!currentRecord) return;
    try {
      setSaving(true);
      await api.verifyRecord(currentRecord.id, {
        ...formData,
        reviewed_by: officerName,
        reviewer_notes: officerNotes,
      });
      setFeedbackMsg({ type: 'success', text: `Record ${currentRecord.record_identifier} verified and sealed!` });

      if (onRecordUpdated) onRecordUpdated();

      // Advance to next record in queue
      setTimeout(() => {
        setFeedbackMsg(null);
        fetchQueue();
      }, 1200);
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message });
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!currentRecord) return;
    try {
      setSaving(true);
      await api.rejectRecord(currentRecord.id, rejectReason);
      setRejectModalOpen(false);
      setFeedbackMsg({ type: 'error', text: `Record marked as REJECTED (${rejectReason})` });

      if (onRecordUpdated) onRecordUpdated();

      setTimeout(() => {
        setFeedbackMsg(null);
        fetchQueue();
      }, 1200);
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message });
      setSaving(false);
    }
  };

  const handleNavigateQueue = (newIdx) => {
    if (newIdx >= 0 && newIdx < queue.length) {
      setCurrentIndex(newIdx);
      loadRecordDetails(queue[newIdx].id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading human review workspace...</p>
        </div>
      </div>
    );
  }

  if (!currentRecord) {
    return (
      <div className="p-12 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4 my-8">
        <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit mx-auto">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h3 className="text-lg font-bold text-slate-100">Review Queue is Clear!</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          There are currently no documents pending human review. All records have either been auto-verified or certified by an officer.
        </p>
        <div className="pt-2 flex justify-center gap-3">
          <button
            onClick={() => onNavigate('upload')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
          >
            Upload New Document
          </button>
          <button
            onClick={() => onNavigate('records')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Explore Land Records
          </button>
        </div>
      </div>
    );
  }

  const fieldConfidences = currentRecord.field_confidences || {};
  const issues = currentRecord.validation_issues || [];
  const duplicateIssue = issues.find((i) => i.issue_type === 'DUPLICATE_SUSPECT');

  return (
    <div className="space-y-4 animate-fade-in pb-12">
      {/* Top Header & Queue Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-100">{currentRecord.record_identifier}</h2>
              <StatusBadge status={currentRecord.status} isFlagged={currentRecord.is_flagged} size="sm" />
              <ConfidenceBadge score={currentRecord.overall_confidence} size="sm" />
            </div>
            <p className="text-xs text-slate-400">
              Document Type: <span className="text-slate-300 font-medium">{currentRecord.document_type}</span> &bull; {currentRecord.district}
            </p>
          </div>
        </div>

        {/* Queue Navigator */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">
            Reviewing <span className="text-slate-200 font-semibold">{currentIndex + 1}</span> of{' '}
            <span className="text-slate-200 font-semibold">{queue.length}</span>
          </span>
          <div className="flex items-center gap-1 bg-slate-800 rounded-xl p-1 border border-slate-700">
            <button
              onClick={() => handleNavigateQueue(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              title="Previous document"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleNavigateQueue(currentIndex + 1)}
              disabled={currentIndex >= queue.length - 1}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              title="Next document"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-200">
            &times;
          </button>
        </div>
      )}

      {/* Split-Screen Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Pane (Col 6): Document Scan Viewer */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col h-[750px]">
          {/* Scan Controls Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Original Archival Scan
              </span>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-800/80 rounded-lg p-1 border border-slate-700">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.2))}
                className="p-1 rounded text-slate-300 hover:bg-slate-700 transition cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono px-1 text-slate-400">{Math.round(zoomLevel * 100)}%</span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                className="p-1 rounded text-slate-300 hover:bg-slate-700 transition cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                className="p-1 rounded text-slate-300 hover:bg-slate-700 transition cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* OpenCV Preset Filters Row */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
            <span className="text-slate-400 shrink-0 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-indigo-400" />
              Filter:
            </span>
            {['standard', 'high_contrast', 'deskew', 'denoise', 'invert'].map((p) => (
              <button
                key={p}
                onClick={() => handlePresetChange(p)}
                className={`px-2 py-1 rounded-md font-medium transition cursor-pointer shrink-0 ${
                  imagePreset === p
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {p === 'high_contrast' ? 'High Contrast' : p === 'deskew' ? 'Deskew' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          {/* Scanned Image Canvas Area */}
          <div className="flex-1 overflow-auto rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-4 relative select-none">
            {currentRecord.document_filepath ? (
              <img
                src={
                  previewImageUrl ||
                  getStaticUrl(currentRecord.document_filepath)
                }
                alt="Document Scan"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out',
                }}
                className="max-w-full rounded shadow-2xl"
              />
            ) : (
              <div className="text-xs text-slate-500 italic">No image scan attached</div>
            )}
          </div>
        </div>

        {/* Right Pane (Col 6): Extracted Editable Fields Form */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 flex flex-col h-[750px] overflow-y-auto">
          {/* Validation Warnings Header */}
          {issues.length > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-semibold text-amber-300">
                <AlertTriangle className="w-4 h-4" />
                <span>Verification Warnings ({issues.length})</span>
              </div>
              <div className="space-y-1 text-slate-200">
                {issues.map((issue, idx) => (
                  <div key={idx} className="text-[11px] leading-relaxed">
                    &bull; <span className="font-semibold text-amber-300">{issue.issue_type}:</span> {issue.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Duplicate Conflict Comparison Drawer if duplicate */}
          {duplicateIssue && duplicateIssue.details && duplicateIssue.details.conflicting_record_identifier && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/40 space-y-3 text-xs">
              <div className="flex items-center justify-between text-rose-300 font-bold">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4" />
                  <span>Fuzzy Duplicate Conflict Comparison</span>
                </div>
                <span className="font-mono px-2 py-0.5 rounded bg-rose-900/60 border border-rose-700">
                  {duplicateIssue.details.similarity_score}% Match
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px]">
                <div>
                  <span className="text-slate-400 block font-medium mb-1">Current Extracted Deed:</span>
                  <div className="font-semibold text-slate-100">{formData.owner_name}</div>
                  <div className="text-indigo-300 font-mono">Khasra #{formData.khasra_number}</div>
                  <div className="text-slate-400">{formData.village}, {formData.district}</div>
                </div>

                <div className="border-l border-slate-800 pl-3">
                  <span className="text-slate-400 block font-medium mb-1">
                    Existing Record ({duplicateIssue.details.conflicting_record_identifier}):
                  </span>
                  <div className="font-semibold text-rose-300">{duplicateIssue.details.conflicting_owner}</div>
                  <div className="text-rose-400 font-mono">Khasra #{duplicateIssue.details.conflicting_khasra}</div>
                  <div className="text-slate-400">{duplicateIssue.details.conflicting_village}</div>
                </div>
              </div>
            </div>
          )}

          {/* Editable Form Inputs */}
          <div className="space-y-4 text-xs">
            {/* Owner & Parentage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-300">Khatedar / Owner Name</label>
                  <ConfidenceBadge score={fieldConfidences.owner_name} size="sm" />
                </div>
                <input
                  type="text"
                  value={formData.owner_name || ''}
                  onChange={(e) => handleInputChange('owner_name', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-300">Parentage (Father / Husband)</label>
                  <ConfidenceBadge score={fieldConfidences.parentage} size="sm" />
                </div>
                <input
                  type="text"
                  value={formData.parentage || ''}
                  onChange={(e) => handleInputChange('parentage', e.target.value)}
                  placeholder="e.g. S/O Badri Prasad"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Khasra & Khata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-300">Khasra / Survey Number</label>
                  <ConfidenceBadge score={fieldConfidences.khasra_number} size="sm" />
                </div>
                <input
                  type="text"
                  value={formData.khasra_number || ''}
                  onChange={(e) => handleInputChange('khasra_number', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-indigo-300 font-mono font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-300">Khata / Khatauni Number</label>
                  <ConfidenceBadge score={fieldConfidences.khata_number} size="sm" />
                </div>
                <input
                  type="text"
                  value={formData.khata_number || ''}
                  onChange={(e) => handleInputChange('khata_number', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Area & Units */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-300">Measured Area</label>
                  <ConfidenceBadge score={fieldConfidences.area} size="sm" />
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={formData.area_value || 0}
                  onChange={(e) => handleInputChange('area_value', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 font-mono font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-1">
                <label className="font-semibold text-slate-300 block mb-1">Unit of Measurement</label>
                <select
                  value={formData.area_unit || 'Acres'}
                  onChange={(e) => handleInputChange('area_unit', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Acres">Acres</option>
                  <option value="Hectares">Hectares</option>
                  <option value="Bigha">Bigha</option>
                  <option value="Sq. Yards">Sq. Yards</option>
                  <option value="Sq. Meters">Sq. Meters</option>
                </select>
              </div>

              <div className="sm:col-span-1">
                <label className="font-semibold text-slate-400 block mb-1">Standardized Area</label>
                <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-semibold">
                  {currentRecord.area_acres} Acres
                </div>
              </div>
            </div>

            {/* Jurisdiction: Village, Tehsil, District */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Village (Mauza)</label>
                <input
                  type="text"
                  value={formData.village || ''}
                  onChange={(e) => handleInputChange('village', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Tehsil / Taluka</label>
                <input
                  type="text"
                  value={formData.tehsil || ''}
                  onChange={(e) => handleInputChange('tehsil', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">District</label>
                <input
                  type="text"
                  value={formData.district || ''}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Land Classification & Document Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">Land Classification</label>
                <select
                  value={formData.land_classification || 'Agricultural (Irrigated)'}
                  onChange={(e) => handleInputChange('land_classification', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Agricultural (Irrigated)">Agricultural (Irrigated)</option>
                  <option value="Agricultural (Unirrigated)">Agricultural (Unirrigated)</option>
                  <option value="Agricultural (Nahri / Canal)">Agricultural (Nahri / Canal)</option>
                  <option value="Agricultural (Chahi / Well)">Agricultural (Chahi / Well)</option>
                  <option value="Residential (Abadi)">Residential (Abadi)</option>
                  <option value="Commercial / Industrial">Commercial / Industrial</option>
                  <option value="Pasture / Charagah (Gair Mumkin)">Pasture / Charagah</option>
                  <option value="Forest / Protected Land">Forest / Protected Land</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Registration Date</label>
                <input
                  type="text"
                  value={formData.registration_date || ''}
                  onChange={(e) => handleInputChange('registration_date', e.target.value)}
                  placeholder="YYYY-MM-DD"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Officer Notes */}
            <div>
              <label className="font-semibold text-slate-300 block mb-1">Revenue Officer Endorsement Notes</label>
              <textarea
                rows={2}
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
          </div>

          {/* Action Buttons Footer */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 mt-auto">
            <button
              onClick={() => setRejectModalOpen(true)}
              disabled={saving}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject Document</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveDraft}
                disabled={saving}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Draft</span>
              </button>

              <button
                onClick={handleApprove}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve & Verify Record</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-rose-300 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              <span>Reject Land Record Scan</span>
            </h3>
            <p className="text-xs text-slate-400">
              Provide a valid administrative reason for rejection (e.g. illegible scan, fraudulent seal, torn paper).
            </p>

            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-rose-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
