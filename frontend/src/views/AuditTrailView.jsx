import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Download,
  Calendar,
  User,
  ShieldCheck,
  FileText,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Clock,
  Layers,
  ArrowUpDown,
  FileSpreadsheet,
} from 'lucide-react';
import { api } from '../api';

export const AuditTrailView = ({ onNavigate, onSelectRecord }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [viewMode, setViewMode] = useState('timeline'); // timeline or table
  const [exportSuccess, setExportSuccess] = useState(false);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getAuditLogs({ search, action: actionFilter });
      setLogs(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, actionFilter]);

  const handleExportCSV = () => {
    api.exportCSV(`Landmark_AI_Audit_Log_${new Date().toISOString().split('T')[0]}`, logs);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handleExportJSON = () => {
    api.exportJSON(`Landmark_AI_Audit_Log_${new Date().toISOString().split('T')[0]}`, logs);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const getActionBadge = (action) => {
    const act = (action || '').toUpperCase();
    if (act.includes('APPROVED') || act.includes('AUTO_VERIFIED') || act.includes('GENUINE')) {
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    }
    if (act.includes('FLAGGED') || act.includes('DUPLICATE') || act.includes('REJECTED')) {
      return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    }
    if (act.includes('REGISTERED') || act.includes('UPLOAD')) {
      return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    }
    return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Immutable Audit Trail &amp; Provenance Log</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
              Cryptographic Hash Log
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Chronological, non-repudiable audit logs of every OCR extraction, officer modification, verification sign-off, and mutation event.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchLogs}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-2 transition cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {exportSuccess && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Audit Log exported successfully to your downloads folder.</span>
        </div>
      )}

      {/* Filter and View Mode Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search audit trail by Record ID, Officer, Notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Action Filter Dropdown */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition"
          >
            <option value="">All Action Types</option>
            <option value="VERIFIED">Verified / Approved</option>
            <option value="FLAGGED">Flagged Anomalies</option>
            <option value="REGISTERED">New Registrations</option>
            <option value="MODIFIED">Officer Edits</option>
            <option value="OCR">OCR Parsing</option>
          </select>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              viewMode === 'timeline'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Timeline View
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              viewMode === 'table'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Structured Table
          </button>
        </div>
      </div>

      {/* Logs Display */}
      {logs.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
          <History className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No matching audit events found</p>
          <p className="text-xs text-slate-500">Try adjusting your search criteria or action filter.</p>
        </div>
      ) : viewMode === 'timeline' ? (
        /* Timeline View */
        <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-800 space-y-8 my-4 ml-3">
          {logs.map((log) => {
            const dateStr = log.created_at ? new Date(log.created_at).toLocaleString() : 'Recent';
            return (
              <div key={log.id} className="relative group">
                {/* Node circle */}
                <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-slate-950 border-2 border-indigo-500 group-hover:border-indigo-400 transition" />

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono font-semibold border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                      {log.record_identifier && (
                        <span className="font-mono text-xs font-bold text-indigo-300">
                          {log.record_identifier}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{dateStr}</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                    {log.notes || 'System action executed'}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Performed by: <strong className="text-slate-300">{log.performed_by}</strong></span>
                      {log.user_role && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700 font-mono">
                          {log.user_role}
                        </span>
                      )}
                    </div>

                    {log.changes && Object.keys(log.changes).length > 0 && (
                      <div className="text-[11px] font-mono text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                        Changes: {JSON.stringify(log.changes)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Record ID</th>
                  <th className="px-4 py-3.5">Action</th>
                  <th className="px-4 py-3.5">Performed By / Role</th>
                  <th className="px-4 py-3.5">Notes &amp; Mutation Changes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : 'Recent'}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-indigo-300 whitespace-nowrap">
                      {log.record_identifier || `REC-${log.land_record_id || 'SYS'}`}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold text-slate-200">{log.performed_by}</div>
                      <div className="text-[10px] text-slate-400">{log.user_role || 'System'}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-300 max-w-md">
                      <div>{log.notes}</div>
                      {log.changes && Object.keys(log.changes).length > 0 && (
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                          {JSON.stringify(log.changes)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
