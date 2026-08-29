import React, { useState, useEffect } from 'react';
import {
  FilePlus,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Landmark,
  User,
  Layers,
  Sparkles,
  Printer,
  Eye,
  RefreshCw,
  ArrowRight,
  HelpCircle,
  FileCheck2,
} from 'lucide-react';
import { api } from '../api';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { StatusBadge } from '../components/StatusBadge';

export const RegisterLandView = ({ onNavigate, onSelectRecord, onRecordCreated }) => {
  const [formData, setFormData] = useState({
    owner_name: '',
    parentage: '',
    applicant_category: 'Individual Khatedar',
    applicant_mobile: '',
    applicant_aadhaar: '',
    khasra_number: '',
    khata_number: '',
    hissa_number: '',
    village: '',
    tehsil: 'Central Division',
    district: 'Jaipur',
    state: 'Rajasthan',
    area_value: '',
    area_unit: 'Acres',
    land_classification: 'Agricultural (Irrigated)',
    document_type: 'Jamabandi / RoR',
    registration_date: new Date().toISOString().split('T')[0],
    sub_registrar_office: 'Sub-Registrar Office, Central Zone',
    remarks: 'Registered via Citizen & Revenue Portal',
  });

  const [checking, setChecking] = useState(false);
  const [preCheckResult, setPreCheckResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdRecord, setCreatedRecord] = useState(null);
  const [error, setError] = useState(null);

  // Quick live standardized acres calculation
  const getStandardizedAcres = () => {
    const val = parseFloat(formData.area_value) || 0;
    const unit = (formData.area_unit || '').toLowerCase();
    let mult = 1.0;
    if (unit.includes('hect') || unit === 'ha') mult = 2.47105;
    else if (unit.includes('bigha')) mult = 0.625;
    else if (unit.includes('yard')) mult = 0.000206612;
    else if (unit.includes('guntha')) mult = 0.025;
    return (val * mult).toFixed(3);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setPreCheckResult(null); // Reset pre-check when input changes
  };

  // Run live pre-check against duplicate database
  const handlePreCheck = async () => {
    if (!formData.owner_name || !formData.khasra_number) {
      setError('Please provide at least Owner Name and Khasra Number to run conflict pre-check.');
      return;
    }
    setError(null);
    setChecking(true);
    try {
      const res = await api.checkDuplicate(formData);
      setPreCheckResult(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.owner_name.trim()) {
      setError('Owner Name is required.');
      return;
    }
    if (!formData.khasra_number.trim()) {
      setError('Khasra / Survey Number is required.');
      return;
    }
    if (!formData.area_value || parseFloat(formData.area_value) <= 0) {
      setError('Please enter a valid positive land area.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const result = await api.createRecord({
        ...formData,
        area_value: parseFloat(formData.area_value),
        submitted_by: 'Citizen / Revenue Portal',
      });
      setCreatedRecord(result);
      if (onRecordCreated) onRecordCreated();
    } catch (err) {
      setError(err.message || 'Failed to register land record');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      owner_name: '',
      parentage: '',
      applicant_category: 'Individual Khatedar',
      applicant_mobile: '',
      applicant_aadhaar: '',
      khasra_number: '',
      khata_number: '',
      hissa_number: '',
      village: '',
      tehsil: 'Central Division',
      district: 'Jaipur',
      state: 'Rajasthan',
      area_value: '',
      area_unit: 'Acres',
      land_classification: 'Agricultural (Irrigated)',
      document_type: 'Jamabandi / RoR',
      registration_date: new Date().toISOString().split('T')[0],
      sub_registrar_office: 'Sub-Registrar Office, Central Zone',
      remarks: 'Registered via Citizen & Revenue Portal',
    });
    setCreatedRecord(null);
    setPreCheckResult(null);
    setError(null);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
            <FilePlus className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100">Land Title Registration & Entry Portal</h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                Direct Cadastre Entry
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Add new land parcel entries, specify khatedar titleholder details, and perform real-time cadastral duplicate checks.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('records')}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer self-start sm:self-auto"
        >
          View Registered Archive &rarr;
        </button>
      </div>

      {/* Main Form & Preview Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form (Col 8) */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Titleholder Info */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 pb-2 border-b border-slate-800">
              <User className="w-4 h-4 text-indigo-400" />
              <span>1. Khatedar / Titleholder Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Full Name of Owner / Khatedar <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rameshwar Prasad Sharma"
                  value={formData.owner_name}
                  onChange={(e) => handleInputChange('owner_name', e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Parentage (Father / Husband / Guardian)
                </label>
                <input
                  type="text"
                  placeholder="e.g. S/O Badri Narayan Sharma"
                  value={formData.parentage}
                  onChange={(e) => handleInputChange('parentage', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Khatedari / Ownership Type</label>
                <select
                  value={formData.applicant_category}
                  onChange={(e) => handleInputChange('applicant_category', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Individual Khatedar">Individual Khatedar (Sole Owner)</option>
                  <option value="Joint Khatedari (Shared Title)">Joint Khatedari (Shared Title)</option>
                  <option value="Institutional / Corporate">Institutional / Corporate</option>
                  <option value="Religious / Charitable Trust">Religious / Charitable Trust</option>
                  <option value="Government / Gram Panchayat">Government / Gram Panchayat</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Mobile / Contact Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98290 12345"
                  value={formData.applicant_mobile}
                  onChange={(e) => handleInputChange('applicant_mobile', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Cadastral & Parcel Identification */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 pb-2 border-b border-slate-800">
              <Landmark className="w-4 h-4 text-indigo-400" />
              <span>2. Cadastral Parcel & Location Identification</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Khasra / Survey Number <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 310/1 or 142/3"
                  value={formData.khasra_number}
                  onChange={(e) => handleInputChange('khasra_number', e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-indigo-300 font-mono font-bold placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Khata / Khatauni Number</label>
                <input
                  type="text"
                  placeholder="e.g. 72/14"
                  value={formData.khata_number}
                  onChange={(e) => handleInputChange('khata_number', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Sub-Division / Hissa No.</label>
                <input
                  type="text"
                  placeholder="e.g. Plot B-2"
                  value={formData.hissa_number}
                  onChange={(e) => handleInputChange('hissa_number', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Village (Mauza / Gaon) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Muhana"
                  value={formData.village}
                  onChange={(e) => handleInputChange('village', e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Tehsil / Taluka</label>
                <input
                  type="text"
                  placeholder="e.g. Sanganer"
                  value={formData.tehsil}
                  onChange={(e) => handleInputChange('tehsil', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">District (Zila)</label>
                <select
                  value={formData.district}
                  onChange={(e) => {
                    const dist = e.target.value;
                    let st = 'Rajasthan';
                    if (['Pune', 'Nagpur', 'Nashik'].includes(dist)) st = 'Maharashtra';
                    else if (['Varanasi', 'Lucknow', 'Kanpur', 'Prayagraj', 'Meerut'].includes(dist)) st = 'Uttar Pradesh';
                    else if (['Indore', 'Bhopal', 'Gwalior', 'Jabalpur'].includes(dist)) st = 'Madhya Pradesh';
                    else if (['Patna'].includes(dist)) st = 'Bihar';
                    else if (['Ahmedabad', 'Surat'].includes(dist)) st = 'Gujarat';
                    setFormData((prev) => ({ ...prev, district: dist, state: st }));
                  }}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Jaipur">Jaipur (Rajasthan)</option>
                  <option value="Jodhpur">Jodhpur (Rajasthan)</option>
                  <option value="Pune">Pune (Maharashtra)</option>
                  <option value="Varanasi">Varanasi (Uttar Pradesh)</option>
                  <option value="Lucknow">Lucknow (Uttar Pradesh)</option>
                  <option value="Indore">Indore (Madhya Pradesh)</option>
                  <option value="Patna">Patna (Bihar)</option>
                  <option value="Bhopal">Bhopal (Madhya Pradesh)</option>
                  <option value="Nagpur">Nagpur (Maharashtra)</option>
                  <option value="Udaipur">Udaipur (Rajasthan)</option>
                  <option value="Kota">Kota (Rajasthan)</option>
                  <option value="Nashik">Nashik (Maharashtra)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Extent & Land Classification */}
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200 pb-2 border-b border-slate-800">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>3. Measured Area Extent & Land Classification</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-300 block mb-1">
                  Measured Extent / Area <span className="text-rose-400">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 4.25"
                  value={formData.area_value}
                  onChange={(e) => handleInputChange('area_value', e.target.value)}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-100 font-mono font-semibold placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Unit of Measurement</label>
                <select
                  value={formData.area_unit}
                  onChange={(e) => handleInputChange('area_unit', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Acres">Acres</option>
                  <option value="Hectares">Hectares</option>
                  <option value="Bigha">Bigha (Pucca)</option>
                  <option value="Biswa">Biswa</option>
                  <option value="Sq. Yards">Sq. Yards</option>
                  <option value="Guntha">Guntha</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-400 block mb-1">Standardized Area (Auto)</label>
                <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-bold">
                  {getStandardizedAcres()} Acres
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="font-semibold text-slate-300 block mb-1">Land Classification</label>
                <select
                  value={formData.land_classification}
                  onChange={(e) => handleInputChange('land_classification', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Agricultural (Irrigated)">Agricultural (Irrigated - Chahi/Nahri)</option>
                  <option value="Agricultural (Unirrigated)">Agricultural (Unirrigated - Barani)</option>
                  <option value="Agricultural (Nahri / Canal)">Agricultural (Nahri / Canal Irrigated)</option>
                  <option value="Residential (Abadi)">Residential (Abadi / Settlement)</option>
                  <option value="Commercial / Industrial">Commercial / Industrial</option>
                  <option value="Pasture / Charagah (Gair Mumkin)">Pasture / Charagah (Gair Mumkin)</option>
                  <option value="Forest / Protected Land">Forest / Protected Land</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Document Record Type</label>
                <select
                  value={formData.document_type}
                  onChange={(e) => handleInputChange('document_type', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Jamabandi / RoR">Jamabandi / RoR (Record of Rights)</option>
                  <option value="Mutation Register (Intiqal)">Mutation Register (Dakhil Kharij)</option>
                  <option value="Sale Deed">Registered Sale Deed / Conveyance</option>
                  <option value="Partition Deed">Partition Deed (Batwara)</option>
                  <option value="Allotment Sanad">Government Allotment Sanad</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={handlePreCheck}
              disabled={checking || submitting}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{checking ? 'Checking Conflicts...' : 'Pre-Check Cadastral Conflict'}</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 text-xs font-medium transition cursor-pointer"
              >
                Reset
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>{submitting ? 'Registering Parcel...' : 'Register & Seal Land Record'}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Right Live Card & Conflict Radar (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Live Sanad Preview Box */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-emerald-400" />
                Live Registry Sanad Preview
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Real-time</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3 text-xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-mono">Titleholder</span>
                  <p className="font-bold text-slate-100 text-sm">
                    {formData.owner_name || <span className="text-slate-600 italic">Enter Owner Name</span>}
                  </p>
                  <p className="text-[11px] text-slate-400">{formData.parentage || 'Parentage Not Set'}</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 font-mono border border-indigo-500/20">
                  {formData.document_type.split('/')[0]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60 text-[11px]">
                <div>
                  <span className="text-slate-500">Parcel Number:</span>
                  <p className="font-mono font-bold text-indigo-300">
                    Khasra #{formData.khasra_number || '--'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Khata No:</span>
                  <p className="font-mono text-slate-300">{formData.khata_number || '--'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Extent:</span>
                  <p className="font-semibold text-emerald-400">
                    {formData.area_value || '0'} {formData.area_unit}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Location:</span>
                  <p className="text-slate-300">
                    {formData.village || 'Mauza'}, {formData.district}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pre-Check Conflict Radar Result */}
          {preCheckResult && (
            <div
              className={`p-4 rounded-2xl border space-y-3 text-xs animate-fade-in ${
                preCheckResult.is_flagged
                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                  : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <div className="flex items-center gap-2">
                  {preCheckResult.is_flagged ? (
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  )}
                  <span>{preCheckResult.is_flagged ? 'Cadastral Conflict Detected!' : 'Parcel Clear for Auto-Sealing'}</span>
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900/60 border border-current">
                  {preCheckResult.status}
                </span>
              </div>

              {preCheckResult.issues.length > 0 ? (
                <div className="space-y-1.5 text-[11px] text-slate-200">
                  {preCheckResult.issues.map((iss, i) => (
                    <div key={i} className="leading-relaxed">
                      &bull; <span className="font-semibold text-rose-300">{iss.issue_type}:</span> {iss.message}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-emerald-200/90 leading-relaxed">
                  No duplicate khasras, conflicting owner names, or out-of-bounds area values found in the registry.
                </p>
              )}
            </div>
          )}

          {/* Guidelines Box */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Registration Guidelines</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              &bull; Once registered, a high-resolution visual Sanad deed image is generated and archived.
              <br />
              &bull; Clean records receive automatic seal & auto-verification status.
              <br />
              &bull; Duplicates or discrepancies are flagged for Tehsildar inspection.
            </p>
          </div>
        </div>
      </div>

      {/* Success Receipt / Sanad Modal */}
      {createdRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl p-6 sm:p-8 space-y-6 shadow-2xl overflow-hidden">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Land Record Successfully Registered & Sealed!</h3>
              <p className="text-xs text-slate-400">
                Official Digital Cadastral Sanad generated and archived under NLRMP guidelines.
              </p>
            </div>

            {/* Sanad Slip Card */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 font-mono">RECORD IDENTIFIER</span>
                  <div className="text-base font-bold font-mono text-emerald-400">{createdRecord.record_identifier}</div>
                </div>
                <div className="text-right">
                  <StatusBadge status={createdRecord.status} isFlagged={createdRecord.is_flagged} />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
                <div>
                  <span className="text-slate-500">Khatedar Name:</span>
                  <p className="font-semibold text-slate-100">{createdRecord.owner_name}</p>
                </div>
                <div>
                  <span className="text-slate-500">Khasra / Survey:</span>
                  <p className="font-mono font-bold text-indigo-300">#{createdRecord.khasra_number}</p>
                </div>
                <div>
                  <span className="text-slate-500">Standardized Area:</span>
                  <p className="font-mono font-semibold text-emerald-400">{createdRecord.area_acres} Acres</p>
                </div>
                <div>
                  <span className="text-slate-500">Village & Tehsil:</span>
                  <p className="text-slate-200">{createdRecord.village}, {createdRecord.tehsil}</p>
                </div>
                <div>
                  <span className="text-slate-500">District & State:</span>
                  <p className="text-slate-200">{createdRecord.district} ({createdRecord.state})</p>
                </div>
                <div>
                  <span className="text-slate-500">Classification:</span>
                  <p className="text-slate-200">{createdRecord.land_classification}</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Sanad Receipt</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
                >
                  Register Another Parcel
                </button>
                <button
                  onClick={() => {
                    const rec = createdRecord;
                    setCreatedRecord(null);
                    onSelectRecord(rec);
                  }}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Inspect in Registry</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
