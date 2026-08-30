import React, { useState } from 'react';
import {
  X,
  FileText,
  ShieldCheck,
  AlertTriangle,
  History,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ConfidenceBadge } from './ConfidenceBadge';
import { StatusBadge } from './StatusBadge';
import { getStaticUrl } from '../api';

export const RecordDetailModal = ({ record, onClose, onOpenReview }) => {
  const [activeTab, setActiveTab] = useState('details'); // details, validation, scan, audit

  if (!record) return null;

  const fieldConfidences = record.field_confidences || {};
  const issues = record.validation_issues || [];
  const audits = record.audit_logs || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">{record.record_identifier}</h3>
                <StatusBadge status={record.status} isFlagged={record.is_flagged} size="sm" />
                <ConfidenceBadge score={record.overall_confidence} size="sm" />
              </div>
              <p className="text-xs text-slate-400">
                {record.document_type} &bull; {record.village}, {record.tehsil}, {record.district} ({record.state})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(record.status === 'PENDING_REVIEW' || record.status === 'FLAGGED') && onOpenReview && (
              <button
                onClick={() => {
                  onClose();
                  onOpenReview(record);
                }}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <span>Open in Review Screen</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-800 flex gap-6 text-xs font-medium bg-slate-950/40">
          <button
            onClick={() => setActiveTab('details')}
            className={`py-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'details'
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Structured Attributes</span>
          </button>
          <button
            onClick={() => setActiveTab('validation')}
            className={`py-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'validation'
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Validation Checks ({issues.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={`py-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'scan'
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Scanned Deed & OCR Text</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 border-b-2 transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'audit'
                ? 'border-indigo-500 text-indigo-300 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Audit Trail ({audits.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Top Banner if Flagged */}
              {record.is_flagged && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-rose-300">Flagged Issue Description</h4>
                    <p className="text-xs text-rose-400/90 mt-0.5">{record.flag_reason || 'Requires officer verification'}</p>
                  </div>
                </div>
              )}

              {/* Grid of Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Land Ownership Card */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
                    <span className="text-xs font-semibold text-slate-300">Ownership Information</span>
                    <ConfidenceBadge score={fieldConfidences.owner_name || record.overall_confidence} size="sm" />
                  </div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400">Khatedar / Owner Name:</span>
                      <p className="text-sm font-semibold text-slate-100 mt-0.5">{record.owner_name}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Parentage / Relation:</span>
                      <p className="text-slate-200 mt-0.5">{record.parentage || <span className="text-slate-500 italic">Not Recorded</span>}</p>
                    </div>
                  </div>
                </div>

                {/* Spatial / Parcel Card */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
                    <span className="text-xs font-semibold text-slate-300">Parcel Identification</span>
                    <ConfidenceBadge score={fieldConfidences.khasra_number || record.overall_confidence} size="sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400">Khasra / Survey No:</span>
                      <p className="text-sm font-mono font-semibold text-indigo-300 mt-0.5">{record.khasra_number}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Khata / Khatauni:</span>
                      <p className="text-sm font-mono text-slate-200 mt-0.5">{record.khata_number || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Area & Extent Card */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
                    <span className="text-xs font-semibold text-slate-300">Measured Area & Units</span>
                    <ConfidenceBadge score={fieldConfidences.area || record.overall_confidence} size="sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400">Recorded Extent:</span>
                      <p className="text-sm font-semibold text-slate-100 mt-0.5">
                        {record.area_value} {record.area_unit}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-400">Standardized (Acres):</span>
                      <p className="text-sm font-semibold text-emerald-400 font-mono mt-0.5">
                        {record.area_acres} Acres
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location & Jurisdiction */}
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-700/50">
                    <span className="text-xs font-semibold text-slate-300">Revenue Jurisdiction</span>
                    <ConfidenceBadge score={fieldConfidences.village || record.overall_confidence} size="sm" />
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400">Village (Mauza):</span>
                      <p className="text-slate-200 font-medium mt-0.5">{record.village}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Tehsil:</span>
                      <p className="text-slate-200 font-medium mt-0.5">{record.tehsil}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">District:</span>
                      <p className="text-slate-200 font-medium mt-0.5">{record.district}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Classification & Metadata */}
              <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/40 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-400">Land Classification:</span>
                  <p className="text-slate-200 font-semibold mt-1">{record.land_classification}</p>
                </div>
                <div>
                  <span className="text-slate-400">Document Type:</span>
                  <p className="text-slate-200 font-semibold mt-1">{record.document_type}</p>
                </div>
                <div>
                  <span className="text-slate-400">Registration / Fasli Date:</span>
                  <p className="text-slate-200 font-semibold mt-1">{record.registration_date || 'Archival Vintage'}</p>
                </div>
              </div>

              {/* Reviewer Section if Reviewed */}
              {record.reviewed_by && (
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-1 text-xs">
                  <div className="flex items-center justify-between text-blue-300 font-semibold">
                    <span>Officer Review Endorsement</span>
                    <span>Reviewed by: {record.reviewed_by}</span>
                  </div>
                  <p className="text-slate-300 italic pt-1">{record.reviewer_notes}</p>
                </div>
              )}
            </div>
          )}

          {/* Validation Tab */}
          {activeTab === 'validation' && (
            <div className="space-y-4">
              {issues.length === 0 ? (
                <div className="p-8 rounded-xl bg-slate-800/30 border border-slate-700/50 text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h4 className="text-sm font-semibold text-slate-200">Zero Validation Violations</h4>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    All mandatory fields present, area within realistic parameters, and no conflicting duplicate records found.
                  </p>
                </div>
              ) : (
                issues.map((issue, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border space-y-2 ${
                      issue.severity === 'CRITICAL'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-semibold text-xs">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{issue.issue_type} ({issue.severity})</span>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900/60 border border-current">
                        Field: {issue.field_name || 'General'}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-200">{issue.message}</p>
                    {issue.details && issue.details.similarity_score && (
                      <div className="text-[11px] p-2.5 rounded bg-slate-900/80 border border-slate-700/60 text-slate-300 font-mono space-y-1">
                        <div>Matched Record: #{issue.details.conflicting_record_identifier}</div>
                        <div>Conflicting Owner: {issue.details.conflicting_owner}</div>
                        <div>Fuzzy Similarity Score: {issue.details.similarity_score}%</div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Scanned Document & OCR Text Tab */}
          {activeTab === 'scan' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Document Image */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300">Original Document Archival Scan</span>
                <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center min-h-[350px]">
                  {record.document_filepath ? (
                    <img
                      src={getStaticUrl(record.document_filepath)}
                      alt="Scanned Deed"
                      className="max-h-[420px] rounded object-contain shadow-lg"
                    />
                  ) : (
                    <p className="text-xs text-slate-500">Scan not attached</p>
                  )}
                </div>
              </div>

              {/* Raw OCR Text */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-300">Extracted Raw OCR Text Stream</span>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 h-[420px] overflow-y-auto font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {record.raw_ocr_text || 'Raw OCR stream not available.'}
                </div>
              </div>
            </div>
          )}

          {/* Audit Trail Tab */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              {audits.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-6">No audit records logged yet.</p>
              ) : (
                audits.map((log, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-start justify-between text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-200">{log.action}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                          {log.performed_by}
                        </span>
                      </div>
                      <p className="text-slate-400">{log.notes || 'Status and attribute modification'}</p>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : ''}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
