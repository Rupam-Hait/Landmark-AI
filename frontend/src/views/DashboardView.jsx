import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  AlertOctagon,
  Clock,
  CheckCircle,
  TrendingUp,
  Landmark,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  MapPin,
  RefreshCw,
  Eye,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { api } from '../api';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { StatusBadge } from '../components/StatusBadge';

export const DashboardView = ({ onNavigate, onSelectRecord }) => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.getStats();
      setStatsData(res);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !statsData) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading digitization dashboard metrics...</p>
        </div>
      </div>
    );
  }

  const summary = statsData?.summary || {};
  const statusBreakdown = statsData?.status_breakdown || [];
  const confidenceDist = statsData?.confidence_distribution || [];
  const docTypeBreakdown = statsData?.doc_type_breakdown || [];
  const classBreakdown = statsData?.classification_breakdown || [];
  const recentActivities = statsData?.recent_activities || [];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-100">National Land Records Modernization Overview</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              Live Pipeline
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status of legacy cadastral registers, Jamabandis, and mutation deeds digitization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-2 transition cursor-pointer"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => onNavigate('upload')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digitize New Document</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Documents */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Digitized Records</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-100 font-mono">{summary.total_documents || 0}</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-400 font-semibold">{summary.total_area_acres || 0} Acres</span>
              <span>total mapped parcel area</span>
            </div>
          </div>
        </div>

        {/* Auto-Verified */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Auto-Verified (High Conf.)</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">{summary.auto_verified || 0}</div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-semibold">{summary.accuracy_rate || 0}%</span>
              <span>total verification rate</span>
            </div>
          </div>
        </div>

        {/* Pending Human Review */}
        <div
          onClick={() => onNavigate('review')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 transition space-y-3 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 group-hover:text-amber-300 transition">Pending Review</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-400 font-mono">{summary.pending_review || 0}</div>
            <div className="text-[11px] text-amber-400/80 mt-1 flex items-center gap-1">
              <span>Action required in queue &rarr;</span>
            </div>
          </div>
        </div>

        {/* Flagged / Duplicates */}
        <div
          onClick={() => onNavigate('review')}
          className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/50 transition space-y-3 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 group-hover:text-rose-300 transition">Flagged Duplicates & Rules</span>
            <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-rose-400 font-mono">{summary.flagged_issues || 0}</div>
            <div className="text-[11px] text-rose-400/80 mt-1 flex items-center gap-1">
              <span>Fuzzy duplicate conflicts &rarr;</span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart: Status Distribution */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Digitization Status Breakdown</h3>
            <p className="text-xs text-slate-400 mt-0.5">Verification status across all land records</p>
          </div>

          <div className="h-60 w-full my-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
            {statusBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-400">{item.name}:</span>
                <span className="font-mono text-slate-200 font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart: OCR Confidence Spectrum */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">OCR Extraction Confidence</h3>
            <p className="text-xs text-slate-400 mt-0.5">Distribution of machine confidence scores</p>
          </div>

          <div className="h-60 w-full my-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confidenceDist} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <XAxis
                  dataKey="range"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800 text-slate-400">
            <span>Average OCR Confidence:</span>
            <span className="font-mono text-emerald-400 font-bold">{summary.average_confidence || 0}%</span>
          </div>
        </div>

        {/* Document Types Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Document Type Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">Scanned revenue registers digitized</p>
          </div>

          <div className="space-y-3 my-4">
            {docTypeBreakdown.map((doc, idx) => {
              const pct = summary.total_documents > 0 ? Math.round((doc.count / summary.total_documents) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{doc.type}</span>
                    <span className="font-mono text-slate-400">{doc.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => onNavigate('records')}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>Explore All Records</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity & Land Classification Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Recent Digitization Audit Stream</h3>
              <p className="text-xs text-slate-400">Live transaction log of AI extractions and officer approvals</p>
            </div>
            <button
              onClick={() => onNavigate('records')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              View Full Archive &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {recentActivities.map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 flex items-center justify-between text-xs hover:bg-slate-800/70 transition"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      act.action === 'HUMAN_VERIFIED'
                        ? 'bg-blue-400'
                        : act.action === 'AUTO_ACCEPTED'
                        ? 'bg-emerald-400'
                        : act.action === 'REJECTED'
                        ? 'bg-rose-400'
                        : 'bg-amber-400'
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-slate-200">{act.record_identifier}</span>
                      <span className="text-slate-400">&bull;</span>
                      <span className="text-slate-300">{act.owner_name}</span>
                      <span className="text-slate-500">({act.district})</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{act.notes}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    {act.performed_by}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Land Classification Summary */}
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Land Classification Extent</h3>
            <p className="text-xs text-slate-400">Total area digitized by usage category</p>
          </div>

          <div className="space-y-3">
            {classBreakdown.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-800/40 border border-slate-800/80 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-200 font-medium">{item.classification}</span>
                  <span className="font-mono text-emerald-400 font-semibold">{item.acres} Acres</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{item.count} Parcels</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
