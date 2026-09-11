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
  Download,
  FileSpreadsheet,
  FileText,
  Building2,
  Layers,
  CheckCircle2,
  ChevronRight,
  Filter,
  BarChart3,
  Calendar,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from 'recharts';
import { api } from '../api';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { StatusBadge } from '../components/StatusBadge';

export const DashboardView = ({ onNavigate, onSelectRecord, userProfile }) => {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.getStats();
      setStatsData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleExportCSV = () => {
    if (!statsData) return;
    const exportRows = (statsData.status_breakdown || []).map((s) => ({
      Metric_Category: 'Verification Status',
      Label: s.name,
      Count: s.value || s.count,
    }));
    api.exportCSV('landmark_ai_analytics_summary', exportRows);
    setExportNotice('CSV report exported successfully!');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (loading && !statsData) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading DILRMP digitization metrics...</p>
        </div>
      </div>
    );
  }

  const summary = statsData?.summary || {};
  const statusBreakdown = statsData?.status_breakdown || [];
  const confidenceDist = statsData?.confidence_distribution || [];
  const accuracyTimeline = statsData?.accuracy_timeline || [
    { month: 'Apr', accuracy: 88.4, volume: 84000 },
    { month: 'May', accuracy: 89.8, volume: 112000 },
    { month: 'Jun', accuracy: 91.2, volume: 145000 },
    { month: 'Jul', accuracy: 92.9, volume: 198000 },
    { month: 'Aug', accuracy: 94.1, volume: 245000 },
    { month: 'Sep (Current)', accuracy: 95.3, volume: 310000 },
  ];
  const errorStats = statsData?.error_statistics || [
    { error_type: 'OCR Character Ambiguity (Urdu/Old Script)', count: 4820, percentage: 38 },
    { error_type: 'Cadastral GIS Area Boundary Discrepancy', count: 3110, percentage: 25 },
    { error_type: 'Duplicate Khasra Multi-Claim Suspicion', count: 2450, percentage: 19 },
    { error_type: 'Missing / Illegible Khata or Sub-division', count: 1420, percentage: 11 },
    { error_type: 'Encumbrance / Prohibited Waqf Land Alert', count: 890, percentage: 7 },
  ];
  const docTypeBreakdown = statsData?.doc_type_breakdown || [];
  const recentActivities = statsData?.recent_activities || [];

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header Banner & Regional Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              National Land Records Modernization Overview
            </h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              DILRMP Live Engine
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Real-time analytics across AI OCR pipeline, cadastral shapefile reconciliation, and officer verification queue.
          </p>
        </div>

        {/* Filters & Export Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* State Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-medium"
            >
              <option value="All" className="bg-slate-900">All States</option>
              <option value="Rajasthan" className="bg-slate-900">Rajasthan</option>
              <option value="Maharashtra" className="bg-slate-900">Maharashtra</option>
              <option value="Uttar Pradesh" className="bg-slate-900">Uttar Pradesh</option>
              <option value="Madhya Pradesh" className="bg-slate-900">Madhya Pradesh</option>
            </select>
          </div>

          {/* District Filter */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-1.5 text-xs">
            <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-medium"
            >
              <option value="All" className="bg-slate-900">All Districts</option>
              <option value="Jaipur" className="bg-slate-900">Jaipur</option>
              <option value="Jodhpur" className="bg-slate-900">Jodhpur</option>
              <option value="Pune" className="bg-slate-900">Pune</option>
              <option value="Varanasi" className="bg-slate-900">Varanasi</option>
              <option value="Bhopal" className="bg-slate-900">Bhopal</option>
            </select>
          </div>

          <button
            onClick={fetchStats}
            className="p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Export Actions */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setReportModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Report</span>
          </button>
        </div>
      </div>

      {/* Export Toast Notification */}
      {exportNotice && (
        <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            <span>{exportNotice}</span>
          </div>
          <button onClick={() => setExportNotice(null)} className="text-emerald-400 hover:text-emerald-200">
            &times;
          </button>
        </div>
      )}

      {/* 6 Key KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Documents */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Total Digitized</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileCheck2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono">
              {(summary.total_documents || 1428908).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Parcels processed</div>
          </div>
        </div>

        {/* Auto-Verified Rate */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Auto-Verified (&ge;85%)</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-400 font-mono">
              {(summary.auto_verified || 1114548).toLocaleString()}
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">78.0% Instant AI Pass</div>
          </div>
        </div>

        {/* Pending Review Queue */}
        <div
          onClick={() => onNavigate('review')}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 transition space-y-2 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 group-hover:text-amber-300">Pending Review</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-amber-400 font-mono">
              {(summary.pending_review || 3842).toLocaleString()}
            </div>
            <div className="text-[10px] text-amber-400/90 mt-0.5 flex items-center gap-0.5">
              <span>Open Queue</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
            </div>
          </div>
        </div>

        {/* Flagged Duplicates & Anomalies */}
        <div
          onClick={() => onNavigate('fraud')}
          className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/50 transition space-y-2 cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 group-hover:text-rose-300">Flagged Anomalies</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertOctagon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-rose-400 font-mono">
              {(summary.flagged_issues || 1422).toLocaleString()}
            </div>
            <div className="text-[10px] text-rose-400/90 mt-0.5 flex items-center gap-0.5">
              <span>Inspect Flags</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
            </div>
          </div>
        </div>

        {/* ULPINs Issued */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">ULPIN Bhu-Aadhaar</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-indigo-300 font-mono">
              {(summary.ulpins_generated || 1424708).toLocaleString()}
            </div>
            <div className="text-[10px] text-indigo-400 font-medium mt-0.5">99.7% Standardized</div>
          </div>
        </div>

        {/* Overall Accuracy */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400">Overall Accuracy</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-400 font-mono">
              {summary.overall_accuracy || 94.8}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">28 States &bull; 412 Dist</div>
          </div>
        </div>
      </div>

      {/* Row 1: Accuracy & Volume Over Time + Status Breakdown Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (Col 7): Accuracy & Volume Over Time AreaChart */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <span>AI Accuracy &amp; Processing Volume Trajectory</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Month-on-month Indic OCR model refinement and throughput growth
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="font-mono">Accuracy %</span>
              </div>
              <div className="flex items-center gap-1 text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span className="font-mono">Volume</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={accuracyTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis
                  yAxisId="left"
                  domain={[80, 100]}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  unit="%"
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickFormatter={(val) => `${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="accuracy"
                  name="Accuracy %"
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#accuracyGradient)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="volume"
                  name="Records Digitized"
                  stroke="#6366F1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#volumeGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs pt-3 border-t border-slate-800 text-slate-400">
            <span>Baseline Accuracy: 88.4% (Apr 2026)</span>
            <span className="text-emerald-400 font-semibold font-mono">Current Target: 95.3% (&gt;99% in Urban cadastres)</span>
          </div>
        </div>

        {/* Right (Col 5): Status Breakdown Donut */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Verification Status Breakdown</h3>
            <p className="text-xs text-slate-400 mt-0.5">Proportion of automatic vs officer certifications</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || '#6366F1'} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [Number(value).toLocaleString(), 'Records']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
            {statusBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-400 truncate text-[11px]">{item.name.split('(')[0]}:</span>
                <span className="font-mono text-slate-200 font-semibold text-[11px]">
                  {Number(item.value || item.count).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: OCR Confidence Spectrum + Error Statistics by Type */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left (Col 6): OCR Confidence Spectrum */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">OCR Confidence Distribution</h3>
              <p className="text-xs text-slate-400 mt-0.5">Machine extraction certainty bands</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Avg 94.8%
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confidenceDist} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip
                  formatter={(val) => [`${Number(val).toLocaleString()} Records`, 'Volume']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-800">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="text-emerald-400 font-bold font-mono text-sm block">78.0%</span>
              <span className="text-[10px] text-slate-400">High (&ge;90%)</span>
            </div>
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
              <span className="text-indigo-300 font-bold font-mono text-sm block">17.0%</span>
              <span className="text-[10px] text-slate-400">Med (75-89%)</span>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <span className="text-amber-400 font-bold font-mono text-sm block">5.0%</span>
              <span className="text-[10px] text-slate-400">Low (&lt;75%)</span>
            </div>
          </div>
        </div>

        {/* Right (Col 6): Error Statistics by Type */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Digitization Error Statistics by Type</h3>
              <p className="text-xs text-slate-400 mt-0.5">Top flagged anomalies requiring correction</p>
            </div>
            <button
              onClick={() => onNavigate('fraud')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Inspect All &rarr;
            </button>
          </div>

          <div className="space-y-3 pt-1">
            {errorStats.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{item.error_type}</span>
                  <span className="font-mono text-slate-400 font-semibold">
                    {item.count.toLocaleString()} ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      idx === 0
                        ? 'bg-amber-500'
                        : idx === 1
                        ? 'bg-rose-500'
                        : idx === 2
                        ? 'bg-orange-500'
                        : 'bg-indigo-500'
                    }`}
                    style={{ width: `${item.percentage * 2.2}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Active Automated Conflict Detectors:</span>
            <span className="font-mono text-emerald-400 font-semibold">4 Rules + GIS Polygon Cross-Match</span>
          </div>
        </div>
      </div>

      {/* Row 3: Scanned Document Formats + Live Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document Formats Distribution (Col 4) */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Document Type Distribution</h3>
            <p className="text-xs text-slate-400 mt-0.5">Revenue registers digitized across states</p>
          </div>

          <div className="space-y-3">
            {docTypeBreakdown.map((doc, idx) => {
              const pct = Math.round(((doc.value || doc.count) / 1428908) * 100);
              return (
                <div key={idx} className="p-3 rounded-xl bg-slate-800/40 border border-slate-800/80 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-200 font-semibold">{doc.name || doc.type}</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {(doc.value || doc.count).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${pct * 2.5}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Digitization Audit Stream (Col 8) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Live Digitization Audit Log</h3>
              <p className="text-xs text-slate-400 mt-0.5">Real-time immutable log of AI extractions and officer certifications</p>
            </div>
            <button
              onClick={() => onNavigate('audit')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Full Immutable Log &rarr;
            </button>
          </div>

          <div className="space-y-2.5">
            {recentActivities.map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-xl bg-slate-800/40 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs hover:bg-slate-800/70 transition"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      act.action.includes('APPROVED') || act.action.includes('AUTO')
                        ? 'bg-emerald-400'
                        : act.action.includes('FLAGGED')
                        ? 'bg-rose-400'
                        : 'bg-amber-400'
                    }`}
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-slate-200">{act.record_identifier}</span>
                      <span className="text-slate-500">&bull;</span>
                      <span className="text-indigo-300 font-medium">{act.action}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{act.notes}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    {act.performed_by}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Report Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">DILRMP Executive Digitization Report</h3>
                  <p className="text-xs text-slate-400">Department of Land Resources &bull; Government of India</p>
                </div>
              </div>
              <button
                onClick={() => setReportModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>

            {/* Report Content Preview */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">REPORT PERIOD:</span>
                <span className="text-slate-200">APRIL 2026 – CURRENT (FY2026-27)</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-slate-300">
                <div>Total Records Digitized: <span className="text-white font-bold">1,428,908</span></div>
                <div>Auto-Verification Rate: <span className="text-emerald-400 font-bold">78.0%</span></div>
                <div>Human Officer Queue: <span className="text-amber-400 font-bold">3,842</span></div>
                <div>Fraud / Boundary Conflicts: <span className="text-rose-400 font-bold">1,422</span></div>
                <div>Average OCR Accuracy: <span className="text-emerald-400 font-bold">94.8%</span></div>
                <div>ULPIN Bhu-Aadhaars Issued: <span className="text-indigo-300 font-bold">1,424,708</span></div>
              </div>
              <div className="pt-2 text-[11px] text-slate-400 leading-relaxed font-sans">
                Summary: The Indic OCR &amp; Cadastral Spatial Engine has successfully processed legacy handwritten registers with 94.8% baseline confidence. All land records are indexed under 14-digit ULPIN Bhu-Aadhaar identifiers.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handlePrintPDF}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Print / Download PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

