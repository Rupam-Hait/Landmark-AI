import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Eye,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
  FileSpreadsheet,
  AlertOctagon,
} from 'lucide-react';
import { api } from '../api';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { StatusBadge } from '../components/StatusBadge';

export const RecordsView = ({ onSelectRecord, onOpenReview }) => {
  const [records, setRecords] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [district, setDistrict] = useState('');
  const [docType, setDocType] = useState('');
  const [classification, setClassification] = useState('');

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.getRecords({
        search,
        status,
        district,
        document_type: docType,
        land_classification: classification,
        page,
        page_size: 15,
      });
      setRecords(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page, status, district, docType, classification]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRecords();
  };

  const handleDownloadCSV = () => {
    if (!records || records.length === 0) return;
    const exportData = records.map((r) => ({
      Record_ID: r.record_identifier,
      Owner_Name: r.owner_name,
      Parentage: r.parentage,
      Khasra_No: r.khasra_number,
      Khata_No: r.khata_number,
      ULPIN: r.ulpin,
      Area_Value: r.area_value,
      Area_Unit: r.area_unit,
      Area_Acres: r.area_acres,
      Land_Classification: r.land_classification,
      Village: r.village,
      Tehsil: r.tehsil,
      District: r.district,
      State: r.state,
      Status: r.status,
      Confidence: r.overall_confidence,
    }));
    api.exportCSV('landmark_ai_land_records', exportData);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100">Land Records Archive Explorer</h2>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, and inspect all digitized cadastral parcels, mutation entries, and conveyance deeds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRecords}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-2 transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleDownloadCSV}
            className="px-3.5 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Owner Name, Khasra #, Khata #, Village, Tehsil, or Record ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="">All Verification Statuses</option>
            <option value="AUTO_VERIFIED">Auto-Verified</option>
            <option value="HUMAN_VERIFIED">Human-Verified</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="FLAGGED">Flagged Conflicts</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* District Filter */}
          <select
            value={district}
            onChange={(e) => {
              setDistrict(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="">All Districts</option>
            <option value="Jaipur">Jaipur (Rajasthan)</option>
            <option value="Jodhpur">Jodhpur (Rajasthan)</option>
            <option value="Pune">Pune (Maharashtra)</option>
            <option value="Varanasi">Varanasi (UP)</option>
            <option value="Lucknow">Lucknow (UP)</option>
            <option value="Indore">Indore (MP)</option>
            <option value="Patna">Patna (Bihar)</option>
            <option value="Bhopal">Bhopal (MP)</option>
            <option value="Nagpur">Nagpur (Maharashtra)</option>
          </select>

          {/* Document Type Filter */}
          <select
            value={docType}
            onChange={(e) => {
              setDocType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="">All Document Types</option>
            <option value="Jamabandi / RoR">Jamabandi / RoR</option>
            <option value="Mutation Register (Intiqal)">Mutation Register</option>
            <option value="Sale Deed">Sale Deed</option>
            <option value="Khasra Girdawari">Khasra Girdawari</option>
          </select>

          {/* Classification Filter */}
          <select
            value={classification}
            onChange={(e) => {
              setClassification(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="">All Classifications</option>
            <option value="Agricultural (Irrigated)">Agricultural (Irrigated)</option>
            <option value="Agricultural (Nahri / Canal)">Agricultural (Nahri)</option>
            <option value="Residential (Abadi)">Residential (Abadi)</option>
            <option value="Commercial / Industrial">Commercial / Industrial</option>
            <option value="Forest / Protected Land">Forest / Protected</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="px-4 py-3.5">Record ID</th>
                <th className="px-4 py-3.5">Khatedar / Owner</th>
                <th className="px-4 py-3.5">Khasra / Khata</th>
                <th className="px-4 py-3.5">Area Extent</th>
                <th className="px-4 py-3.5">Location</th>
                <th className="px-4 py-3.5">Confidence</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
                    <span>Loading land records...</span>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 italic">
                    No matching land records found.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-800/40 transition cursor-pointer"
                    onClick={() => onSelectRecord(r)}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-slate-100 whitespace-nowrap">
                      {r.record_identifier}
                      <span className="block text-[10px] text-slate-500 font-sans font-normal">
                        {r.document_type}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-100">{r.owner_name}</div>
                      <div className="text-[11px] text-slate-400">{r.parentage || 'N/A'}</div>
                    </td>

                    <td className="px-4 py-3 font-mono">
                      <div className="font-semibold text-indigo-300">Khasra #{r.khasra_number}</div>
                      <div className="text-[11px] text-slate-400">Khata: {r.khata_number || 'N/A'}</div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap font-mono">
                      <div className="font-semibold text-slate-200">
                        {r.area_value} {r.area_unit}
                      </div>
                      <div className="text-[11px] text-emerald-400">
                        ({r.area_acres} Acres)
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-200">{r.village}</div>
                      <div className="text-[11px] text-slate-400">
                        {r.tehsil}, {r.district}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <ConfidenceBadge score={r.overall_confidence} size="sm" />
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={r.status} isFlagged={r.is_flagged} size="sm" />
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onSelectRecord(r)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                          title="Inspect Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {(r.status === 'PENDING_REVIEW' || r.status === 'FLAGGED') && (
                          <button
                            onClick={() => onOpenReview(r)}
                            className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 transition"
                            title="Open Human Review"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="text-slate-200 font-semibold">{records.length}</span> of{' '}
            <span className="text-slate-200 font-semibold">{total}</span> records
          </div>

          <div className="flex items-center gap-2">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
