import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  AlertOctagon,
  CheckCircle2,
  XCircle,
  Scale,
  RefreshCw,
  Search,
  Layers,
  ArrowRight,
  Eye,
  FileText,
  FileWarning,
  ExternalLink,
  ChevronRight,
  BadgeAlert,
  MapPin,
} from 'lucide-react';
import { api } from '../api';
import { StatusBadge } from '../components/StatusBadge';

export const FraudDetectionView = ({ onNavigate, onSelectRecord }) => {
  const [flaggedRecords, setFlaggedRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedConflict, setSelectedConflict] = useState(null); // for modal
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchFlagged = async () => {
    try {
      setLoading(true);
      const data = await api.getFraudFlags();
      setFlaggedRecords(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlagged();
  }, []);

  const handleResolve = async (recordId, resolutionType) => {
    try {
      await api.resolveFlag(recordId, resolutionType, `Resolved as ${resolutionType} by Revenue Authority`);
      setActionSuccess(`Record #${recordId} successfully processed: ${resolutionType}`);
      setSelectedConflict(null);
      setTimeout(() => setActionSuccess(''), 4000);
      fetchFlagged();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = flaggedRecords.filter((r) => {
    const s = search.toLowerCase();
    return (
      r.owner_name?.toLowerCase().includes(s) ||
      r.khasra_number?.toLowerCase().includes(s) ||
      r.flag_reason?.toLowerCase().includes(s) ||
      r.district?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Duplicate &amp; Fraud Detection Engine</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono border border-rose-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
              <span>{flaggedRecords.length} Active Flags</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated anomaly detection flagging overlapping Khasra claims, cadastral GIS area discrepancies, and suspicious consecutive mutations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchFlagged}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Alerts</span>
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess('')} className="text-emerald-400 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-900/50 space-y-1">
          <div className="flex items-center justify-between text-xs text-rose-400 font-semibold">
            <span>Duplicate Khasra Claims</span>
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">2 Active Cases</div>
          <p className="text-[11px] text-slate-400">Multiple deeds registered on identical parcel numbers</p>
        </div>

        <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-900/50 space-y-1">
          <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
            <span>GIS Cadastral Area Mismatches</span>
            <MapPin className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">1 Active Case</div>
          <p className="text-[11px] text-slate-400">Deed area exceeds satellite cadastral shapefile boundary</p>
        </div>

        <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-900/50 space-y-1">
          <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold">
            <span>OCR Ambiguity Escalations</span>
            <FileWarning className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">2 Active Cases</div>
          <p className="text-[11px] text-slate-400">Urdu &amp; faded Devanagari script requiring Tehsildar review</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search flagged records by Khasra, Owner Name, District..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
        <div className="text-xs text-slate-400">
          Showing <strong className="text-slate-200 font-mono">{filtered.length}</strong> flagged items
        </div>
      </div>

      {/* Flagged Records List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-200">No Anomaly Flags Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              All parsed land records are clear of duplicate claims and cadastral boundary discrepancies.
            </p>
          </div>
        ) : (
          filtered.map((record) => {
            const isDuplicate = record.flag_reason?.toLowerCase().includes('duplicate') || record.khasra_number === '782/1';
            const isSpatialMismatch = record.flag_reason?.toLowerCase().includes('cadastral') || record.flag_reason?.toLowerCase().includes('mismatch');

            return (
              <div
                key={record.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl shrink-0 ${
                        isDuplicate
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : isSpatialMismatch
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      }`}
                    >
                      {isDuplicate ? (
                        <AlertOctagon className="w-5 h-5" />
                      ) : isSpatialMismatch ? (
                        <MapPin className="w-5 h-5" />
                      ) : (
                        <FileWarning className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-indigo-300">
                          {record.record_identifier}
                        </span>
                        <span className="text-xs text-slate-400">&bull;</span>
                        <span className="text-xs font-semibold text-slate-200">
                          Khasra No: <strong className="text-white font-mono">{record.khasra_number}</strong>
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                          {isDuplicate ? 'CRITICAL DUPLICATE CLAIM' : isSpatialMismatch ? 'CADASTRAL SPATIAL MISMATCH' : 'OCR SCRIPT AMBIGUITY'}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-white mt-1">{record.owner_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedConflict(record)}
                      className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition cursor-pointer"
                    >
                      <Scale className="w-3.5 h-3.5" />
                      <span>Compare Records</span>
                    </button>
                    <button
                      onClick={() => onSelectRecord(record)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Full</span>
                    </button>
                  </div>
                </div>

                {/* Flag Detail Banner */}
                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-900/40 text-xs text-rose-200 space-y-1">
                  <div className="font-semibold flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>System Anomaly Flag Rationale:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-rose-300/90 font-mono">
                    {record.flag_reason || 'Flagged for manual revenue court adjudication'}
                  </p>
                </div>

                {/* Metadata Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-semibold block">Village &amp; Tehsil</span>
                    <span className="text-slate-200 font-medium">{record.village}, {record.tehsil}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-semibold block">District &amp; State</span>
                    <span className="text-slate-200 font-medium">{record.district}, {record.state}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-semibold block">Claimed Area</span>
                    <span className="text-slate-200 font-mono font-medium">{record.area_value} {record.area_unit}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-semibold block">ULPIN Identifier</span>
                    <span className="text-indigo-400 font-mono font-medium">{record.ulpin || 'Pending'}</span>
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleResolve(record.id, 'GENUINE')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition cursor-pointer"
                  >
                    Mark as Genuine
                  </button>
                  <button
                    onClick={() => handleResolve(record.id, 'DUPLICATE')}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold transition cursor-pointer"
                  >
                    Mark as Duplicate
                  </button>
                  <button
                    onClick={() => handleResolve(record.id, 'ESCALATE')}
                    className="px-3 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-semibold transition cursor-pointer"
                  >
                    Escalate to Revenue Court
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Side-by-Side Comparison Modal */}
      {selectedConflict && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="max-w-5xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  <Scale className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Side-by-Side Conflict Adjudication</h3>
                  <p className="text-xs text-slate-400">Comparing flagged claimant against existing Cadastral Base Register</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedConflict(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Comparison Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Flagged Record */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-rose-500/40 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
                    <span>FLAGGED CLAIMANT RECORD</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {selectedConflict.record_identifier}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Claimed Title Holder</span>
                    <span className="text-sm font-bold text-white">{selectedConflict.owner_name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Khasra Number</span>
                      <span className="text-sm font-bold text-indigo-400 font-mono">{selectedConflict.khasra_number}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Deed Area</span>
                      <span className="text-sm font-bold text-slate-200 font-mono">{selectedConflict.area_value} {selectedConflict.area_unit}</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Document Type</span>
                    <span className="text-slate-300">{selectedConflict.document_type}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Registration Date</span>
                    <span className="text-slate-300 font-mono">{selectedConflict.registration_date}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Existing Title / Cadastral Baseline */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/40 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>EXISTING SANCTIONED RECORD</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    BHU-REC-2026-001 (Original)
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Officially Recorded Title Holder</span>
                    <span className="text-sm font-bold text-white">रामेश्वर पुत्र जगदीश प्रसाद शर्मा (Rameshwar Sharma)</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Khasra Number</span>
                      <span className="text-sm font-bold text-indigo-400 font-mono">782/1</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-500 uppercase block">Cadastral GIS Area</span>
                      <span className="text-sm font-bold text-emerald-400 font-mono">4.85 Acres (100% Boundary Match)</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Original Title Deed</span>
                    <span className="text-slate-300">1974 Handwritten Jamabandi (RoR) - Mutation No. 341</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-500 uppercase block">Sanction Date</span>
                    <span className="text-slate-300 font-mono">1974-08-14 (Legacy Baseline)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Adjudication Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-400">
                Authorized Revenue Officer Signature Required for Final Mutation Entry
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleResolve(selectedConflict.id, 'GENUINE')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
                >
                  Mark as Genuine Title
                </button>
                <button
                  onClick={() => handleResolve(selectedConflict.id, 'DUPLICATE')}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition cursor-pointer"
                >
                  Confirm as Duplicate / Void
                </button>
                <button
                  onClick={() => handleResolve(selectedConflict.id, 'ESCALATE')}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition cursor-pointer"
                >
                  Escalate to SDM Court
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
