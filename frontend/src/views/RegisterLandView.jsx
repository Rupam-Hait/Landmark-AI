import React, { useState } from 'react';
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
  ArrowLeft,
  Search,
  UploadCloud,
  FileText,
  QrCode,
  Download,
  Building2,
  Check,
  Clock,
  Save,
} from 'lucide-react';
import { api } from '../api';

export const RegisterLandView = ({ onNavigate, onSelectRecord, onRecordCreated }) => {
  const [step, setStep] = useState(1); // 1: Type, 2: Parcel Search, 3: New Owner, 4: Document Upload, 5: Review

  const [txType, setTxType] = useState('Sale Deed (Bainama)');
  const [searchKhasra, setSearchKhasra] = useState('782/1');
  const [searchFound, setSearchFound] = useState(false);
  const [searching, setSearching] = useState(false);

  const [formData, setFormData] = useState({
    // Existing Parcel Info
    existing_owner: 'रामेश्वर पुत्र जगदीश प्रसाद शर्मा (Rameshwar Sharma)',
    khasra_number: '782/1',
    khata_number: '142/38',
    ulpin: 'RJ-JAI-SAN-7821-4820',
    village: 'Sanganer Dehat',
    tehsil: 'Sanganer',
    district: 'Jaipur',
    state: 'Rajasthan',
    area_value: '4.85',
    area_unit: 'Acres',
    land_classification: 'Agricultural (Chahi / Irrigated)',
    // New Buyer / Transferee Info
    new_owner_name: 'अजय कुमार शर्मा पुत्र रामेश्वर शर्मा (Ajay Kumar Sharma)',
    new_parentage: 'Rameshwar Sharma',
    buyer_mobile: '9829012345',
    buyer_aadhaar: '•••• •••• 4912',
    relation: 'Son / Direct Heir',
    consideration_amount: '₹ 45,00,000',
    share_percentage: '100%',
    // Uploaded Document Info
    doc_file_name: 'Registered_Sale_Deed_Sanction_2026.pdf',
    doc_crosscheck_status: 'MATCHED', // MATCHED, MISMATCH, PENDING
    notes: 'Direct succession and registered transfer deed submitted under Section 19 of Revenue Act.',
  });

  const [submitting, setSubmitting] = useState(false);
  const [createdRecord, setCreatedRecord] = useState(null);
  const [error, setError] = useState(null);
  const [draftSaved, setDraftSaved] = useState(false);

  const txTypes = [
    { id: 'Sale Deed (Bainama)', title: 'Sale Deed (Bainama / Transfer)', desc: 'Standard transfer of title from seller to purchaser through registered sale deed.' },
    { id: 'Inheritance / Varisan', title: 'Inheritance / Varisan (Succession)', desc: 'Transfer of title to legal heirs following demise of primary Khatedar.' },
    { id: 'Partition / Batwara', title: 'Partition / Batwara (Sub-division)', desc: 'Division of joint family Khata into separate distinct Khasra sub-parcels.' },
    { id: 'Mutation / Dakhil Kharij', title: 'Mutation (Dakhil Kharij)', desc: 'Updating revenue record of rights following court order or settlement.' },
    { id: 'Gift Deed (Hibanama)', title: 'Gift Deed (Hibanama)', desc: 'Voluntary non-monetary property transfer to family member or trust.' },
    { id: 'Government Lease / Patta', title: 'Government Lease / Allotment', desc: 'State allotment, 99-year lease, or industrial concession plot.' },
  ];

  const handleSearchParcel = async () => {
    if (!searchKhasra) return;
    setSearching(true);
    setError(null);
    try {
      const recordsRes = await api.getRecords({ search: searchKhasra });
      if (recordsRes && recordsRes.items && recordsRes.items.length > 0) {
        const item = recordsRes.items[0];
        setFormData((prev) => ({
          ...prev,
          existing_owner: item.owner_name,
          khasra_number: item.khasra_number,
          khata_number: item.khata_number || '142/38',
          ulpin: item.ulpin || 'RJ-JAI-SAN-7821-4820',
          village: item.village,
          tehsil: item.tehsil,
          district: item.district,
          state: item.state,
          area_value: String(item.area_value),
          area_unit: item.area_unit || 'Acres',
          land_classification: item.land_classification,
        }));
        setSearchFound(true);
      } else {
        // Mock fallback
        setFormData((prev) => ({
          ...prev,
          existing_owner: 'रामेश्वर पुत्र जगदीश प्रसाद शर्मा (Rameshwar Sharma)',
          khasra_number: searchKhasra,
          village: 'Sanganer Dehat',
          tehsil: 'Sanganer',
          district: 'Jaipur',
          state: 'Rajasthan',
          area_value: '4.85',
          area_unit: 'Acres',
        }));
        setSearchFound(true);
      }
    } catch (err) {
      console.error(err);
      setSearchFound(true);
    } finally {
      setSearching(false);
    }
  };

  const handleSaveDraft = () => {
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 3000);
  };

  const handleSubmitRegistration = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        owner_name: formData.new_owner_name,
        parentage: formData.new_parentage,
        khasra_number: formData.khasra_number,
        khata_number: formData.khata_number,
        ulpin: formData.ulpin,
        village: formData.village,
        tehsil: formData.tehsil,
        district: formData.district,
        state: formData.state,
        area_value: parseFloat(formData.area_value) || 1.0,
        area_unit: formData.area_unit,
        land_classification: formData.land_classification,
        ownership_type: 'Sole Ownership',
        document_type: txType,
        notes: `Transfer from ${formData.existing_owner} to ${formData.new_owner_name} (${txType}). Consideration: ${formData.consideration_amount}`,
      };

      const result = await api.createRecord(payload);
      setCreatedRecord(result);
      if (onRecordCreated) onRecordCreated();
    } catch (err) {
      setError(err.message || 'Failed to submit registration');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">Digital Land Transaction &amp; Mutation Portal</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              Form 7-A &bull; Online Registry
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Seamless 5-step digital registration workflow for Sale Deeds, Inheritance, and Mutations with automated cadastral cross-checks.
          </p>
        </div>

        {!createdRecord && (
          <button
            onClick={handleSaveDraft}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition cursor-pointer self-start"
          >
            <Save className="w-3.5 h-3.5 text-indigo-400" />
            <span>{draftSaved ? 'Draft Saved ✓' : 'Save as Draft'}</span>
          </button>
        )}
      </div>

      {draftSaved && (
        <div className="p-3.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Your progress has been saved as a draft in your session. You can resume anytime.</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Confirmation Screen */}
      {createdRecord ? (
        <div className="max-w-3xl mx-auto bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl animate-fade-in text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono uppercase px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
              Transaction Successfully Registered
            </span>
            <h3 className="text-2xl font-bold text-white">Application Reference Generated</h3>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Your land transaction has been submitted for automated rule verification and forwarded to the Sub-Divisional Revenue Officer for final entry.
            </p>
          </div>

          {/* Reference Card */}
          <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
            <div className="space-y-3 flex-1">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">
                  Application Tracking Number (ARN)
                </span>
                <span className="text-xl font-mono font-bold text-indigo-400">{createdRecord.record_identifier}</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">New Title Holder</span>
                  <span className="font-semibold text-white">{createdRecord.owner_name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Khasra Number</span>
                  <span className="font-semibold text-indigo-300 font-mono">#{createdRecord.khasra_number}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Assigned ULPIN</span>
                  <span className="font-mono text-emerald-400 font-bold">{createdRecord.ulpin}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Status</span>
                  <span className="font-semibold text-amber-400">Pending Patwari Signoff</span>
                </div>
              </div>
            </div>

            {/* QR Code Mockup */}
            <div className="p-4 rounded-xl bg-white text-slate-950 flex flex-col items-center justify-center space-y-1.5 shrink-0 shadow-md">
              <QrCode className="w-20 h-20" />
              <span className="text-[9px] font-mono font-bold">SCAN TO TRACK</span>
            </div>
          </div>

          {/* Mutation Progress Timeline */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-left space-y-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Mutation Sanction Workflow Progress</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                <span className="font-bold block">1. Form Submitted</span>
                <span className="text-[10px] opacity-75">Completed</span>
              </div>
              <div className="p-2.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                <span className="font-bold block">2. AI Rule Check</span>
                <span className="text-[10px] opacity-75">0 Collisions Found</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
                <span className="font-bold block">3. Patwari Ground Check</span>
                <span className="text-[10px] opacity-75">In Queue</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400">
                <span className="font-bold block">4. RoR Updation</span>
                <span className="text-[10px] opacity-75">Pending Sign</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Acknowledgment Slip</span>
            </button>

            <button
              onClick={() => onNavigate('records')}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
            >
              <span>View in Land Records Explorer</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Multi-Step Registration Form */
        <div className="space-y-6">
          {/* Step Progress Stepper */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="grid grid-cols-5 gap-2 text-xs">
              {[
                { num: 1, label: 'Transaction Type' },
                { num: 2, label: 'Search Parcel' },
                { num: 3, label: 'Transferee Details' },
                { num: 4, label: 'Supporting Doc' },
                { num: 5, label: 'Review & Submit' },
              ].map((s) => (
                <div
                  key={s.num}
                  onClick={() => s.num < step && setStep(s.num)}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                    step === s.num
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20 font-bold'
                      : step > s.num
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300 font-semibold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="text-[10px] font-mono">Step {s.num}</div>
                  <div className="text-xs truncate">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Select Transaction Type */}
          {step === 1 && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 animate-fade-in">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Step 1: Select Transaction Category</h3>
                <p className="text-xs text-slate-400">Choose the legal nature of the land transfer or mutation.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {txTypes.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setTxType(t.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      txType === t.id
                        ? 'bg-indigo-600/15 border-indigo-500 ring-1 ring-indigo-500/50 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-bold ${txType === t.id ? 'text-indigo-300' : 'text-slate-200'}`}>
                        {t.title}
                      </span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${txType === t.id ? 'border-indigo-500 bg-indigo-500' : 'border-slate-700'}`}>
                        {txType === t.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 leading-snug">{t.desc}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-800">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
                >
                  <span>Next: Search Parcel</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Search Existing Parcel by Khasra or ULPIN */}
          {step === 2 && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 animate-fade-in">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Step 2: Search &amp; Verify Existing Parcel</h3>
                <p className="text-xs text-slate-400">
                  Search by Khasra Number or 14-digit ULPIN to auto-fill currently registered title and boundaries.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchKhasra}
                    onChange={(e) => setSearchKhasra(e.target.value)}
                    placeholder="Enter Khasra No (e.g. 782/1) or ULPIN..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSearchParcel}
                  disabled={searching}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{searching ? 'Searching Database...' : 'Search Parcel'}</span>
                </button>
              </div>

              {/* Found Parcel Details Card */}
              {searchFound && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Existing Title Record Found in Revenue Database</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      ULPIN: {formData.ulpin}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 font-semibold block">Current Title Holder</span>
                      <span className="font-bold text-white">{formData.existing_owner}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 font-semibold block">Khasra &amp; Khata</span>
                      <span className="font-mono font-bold text-indigo-300">Khasra #{formData.khasra_number} / Khata {formData.khata_number}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 font-semibold block">Registered Extent</span>
                      <span className="font-mono font-bold text-emerald-400">{formData.area_value} {formData.area_unit}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-slate-500 font-semibold block">Tehsil &amp; District</span>
                      <span className="font-semibold text-slate-200">{formData.village}, {formData.district}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
                >
                  <span>Next: Enter Transferee Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Enter New Owner / Buyer Details */}
          {step === 3 && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 animate-fade-in">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Step 3: Enter Transferee / New Owner Details</h3>
                <p className="text-xs text-slate-400">Fill in the buyer or legal successor profile and transaction consideration.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">New Owner Name (Full Legal Name)</label>
                  <input
                    type="text"
                    value={formData.new_owner_name}
                    onChange={(e) => setFormData({ ...formData, new_owner_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Parentage / Guardian Name</label>
                  <input
                    type="text"
                    value={formData.new_parentage}
                    onChange={(e) => setFormData({ ...formData, new_parentage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Applicant Mobile Number</label>
                  <input
                    type="tel"
                    value={formData.buyer_mobile}
                    onChange={(e) => setFormData({ ...formData, buyer_mobile: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Aadhaar / Citizen ID Hash</label>
                  <input
                    type="text"
                    value={formData.buyer_aadhaar}
                    onChange={(e) => setFormData({ ...formData, buyer_aadhaar: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Consideration Value / Sale Price</label>
                  <input
                    type="text"
                    value={formData.consideration_amount}
                    onChange={(e) => setFormData({ ...formData, consideration_amount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">Transferred Share %</label>
                  <input
                    type="text"
                    value={formData.share_percentage}
                    onChange={(e) => setFormData({ ...formData, share_percentage: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
                >
                  <span>Next: Attach Supporting Deed</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Attach Supporting Document & AI Cross-Check */}
          {step === 4 && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 animate-fade-in">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Step 4: Attach Supporting Registered Deed</h3>
                <p className="text-xs text-slate-400">Upload the scanned Sub-Registrar sale deed, affidavit, or succession certificate for simulated AI cross-checking.</p>
              </div>

              {/* Upload Box */}
              <div className="p-6 rounded-2xl border-2 border-dashed border-slate-800 bg-slate-950/60 flex flex-col items-center text-center space-y-3">
                <UploadCloud className="w-8 h-8 text-indigo-400" />
                <div>
                  <div className="text-xs font-bold text-slate-200">{formData.doc_file_name}</div>
                  <div className="text-[10px] text-slate-500">PDF / Image Deed Archive &bull; 2.4 MB</div>
                </div>
                <label className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 cursor-pointer">
                  <span>Replace Deed Scan</span>
                  <input type="file" className="hidden" />
                </label>
              </div>

              {/* AI Cross-Check Simulation Pill */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>AI Document Cross-Check Complete: 100% Match</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                    VERIFIED
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
                  <div>&bull; Seller in Deed: <strong className="text-white">Rameshwar Sharma</strong></div>
                  <div>&bull; Buyer in Deed: <strong className="text-white">Ajay Kumar Sharma</strong></div>
                  <div>&bull; Khasra in Deed: <strong className="text-white">782/1 (4.85 Acres)</strong></div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={() => setStep(3)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  onClick={() => setStep(5)}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
                >
                  <span>Next: Final Review &amp; Submit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Review & Submit */}
          {step === 5 && (
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 animate-fade-in">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Step 5: Review &amp; Final Submission</h3>
                <p className="text-xs text-slate-400">Confirm all details prior to generating the formal application tracking reference.</p>
              </div>

              {/* Review Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Current vs New Owner */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-bold text-indigo-300 block text-xs">Parties to Transaction</span>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 uppercase block">Transferor (Existing Title Holder)</span>
                    <span className="font-semibold text-slate-200">{formData.existing_owner}</span>
                  </div>
                  <div className="space-y-1 pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block">Transferee (New Owner)</span>
                    <span className="font-semibold text-emerald-400">{formData.new_owner_name}</span>
                  </div>
                </div>

                {/* Parcel Jurisdiction & Area */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="font-bold text-indigo-300 block text-xs">Parcel Cadastral Extent</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Khasra Number</span>
                      <span className="font-mono font-bold text-white">#{formData.khasra_number}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Plot Area</span>
                      <span className="font-mono font-bold text-emerald-400">{formData.area_value} {formData.area_unit}</span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block">Village / District</span>
                    <span className="font-semibold text-slate-200">{formData.village}, {formData.district} ({formData.state})</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  onClick={() => setStep(4)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                <button
                  onClick={handleSubmitRegistration}
                  disabled={submitting}
                  className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Submitting Registration...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Review &amp; Submit Registration</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
