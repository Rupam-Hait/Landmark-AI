import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  Sparkles,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Eye,
  ShieldCheck,
  Layers,
  Zap,
} from 'lucide-react';
import { api } from '../api';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { StatusBadge } from '../components/StatusBadge';

export const UploadView = ({ onNavigate, onOpenReview, onSelectRecord }) => {
  const [samples, setSamples] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState('standard');
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0 = idle, 1 = preprocess, 2 = ocr, 3 = parse, 4 = validate, 5 = done
  const [resultRecord, setResultRecord] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    api.getSamples().then(setSamples).catch(console.error);
  }, []);

  const runPipelineSteps = async (actionPromise) => {
    setProcessing(true);
    setError(null);
    setResultRecord(null);
    setCurrentStep(1);

    try {
      // Step 1: Preprocessing
      await new Promise((r) => setTimeout(r, 400));
      setCurrentStep(2);

      // Step 2: OCR
      await new Promise((r) => setTimeout(r, 600));
      setCurrentStep(3);

      // Step 3: Parsing & Validation via backend
      const result = await actionPromise;
      setCurrentStep(4);

      await new Promise((r) => setTimeout(r, 400));
      setCurrentStep(5);
      setResultRecord(result);
    } catch (err) {
      setError(err.message || 'Failed to process document');
      setCurrentStep(0);
    } finally {
      setProcessing(false);
    }
  };

  const handleProcessSample = (sampleId) => {
    runPipelineSteps(api.processSample(sampleId, selectedPreset));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    runPipelineSteps(api.uploadFile(file, selectedPreset));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    runPipelineSteps(api.uploadFile(file, selectedPreset));
  };

  const presets = [
    { id: 'standard', name: 'Standard Otsu', desc: 'Bilateral noise filter + Otsu binarization' },
    { id: 'high_contrast', name: 'High Contrast CLAHE', desc: 'Sharpening kernel + adaptive equalization for faint ink' },
    { id: 'deskew', name: 'Deskew & Align', desc: 'Straightens rotated scans & normalizes margins' },
    { id: 'denoise', name: 'Deep Denoise', desc: 'Non-local means filtering for textured aged parchment' },
    { id: 'invert', name: 'Invert Mask', desc: 'Inverted threshold for dark stamps & watermark separation' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-100">AI Land Document Digitization Studio</h2>
        <p className="text-xs text-slate-400 mt-1">
          Upload scanned deeds or select pre-loaded historical records to run OpenCV pre-processing, OCR extraction, and rule validation.
        </p>
      </div>

      {/* Preset Filter Selection */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <Sliders className="w-4 h-4 text-indigo-400" />
          <span>OpenCV Image Pre-processing Preset</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPreset(p.id)}
              disabled={processing}
              className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                selectedPreset === p.id
                  ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-sm shadow-indigo-500/20'
                  : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <div className="text-xs font-bold">{p.name}</div>
              <div className="text-[10px] text-slate-400 mt-1 leading-tight">{p.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 1-Click Ready Sample Documents Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-100">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Instant Test Scenarios (1-Click Sample Digitization)</span>
          </div>
          <span className="text-xs text-slate-400">Click any card to test the real-time AI pipeline</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {samples.map((sample) => (
            <div
              key={sample.id}
              onClick={() => !processing && handleProcessSample(sample.id)}
              className={`p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/60 transition cursor-pointer flex flex-col justify-between group space-y-4 ${
                processing ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {sample.type}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {sample.district} &bull; {sample.village}
                  </span>
                </div>

                <h4 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition">
                  {sample.title}
                </h4>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {sample.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span
                  className={`text-[10px] font-semibold ${
                    sample.id.includes('duplicate')
                      ? 'text-rose-400'
                      : sample.id.includes('faded')
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {sample.category}
                </span>
                <span className="text-xs text-indigo-400 flex items-center gap-1 font-semibold group-hover:translate-x-1 transition">
                  <span>Run OCR</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Drag and Drop Custom File Upload */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`p-8 rounded-2xl border-2 border-dashed transition flex flex-col items-center justify-center text-center space-y-4 ${
          dragActive
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
        }`}
      >
        <div className="p-4 rounded-2xl bg-indigo-600/10 text-indigo-400 border border-indigo-500/20">
          <UploadCloud className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Upload your own Land Record / Deed Scan</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Drag and drop your scanned Jamabandi, Mutation Form, or Sale Deed image (PNG, JPG, JPEG, TIFF, PDF).
          </p>
        </div>

        <label className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition cursor-pointer flex items-center gap-2">
          <span>Choose Scanned File</span>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            disabled={processing}
            className="hidden"
          />
        </label>
      </div>

      {/* Live Pipeline Stepper Progress */}
      {processing && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-indigo-500/40 space-y-4 animate-pulse">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
            <h3 className="text-sm font-bold text-slate-100">Digitization Pipeline in Progress</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className={`p-3 rounded-xl border ${currentStep >= 1 ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-800/40 border-slate-800 text-slate-500'}`}>
              <div className="font-semibold">1. OpenCV Filters</div>
              <div className="text-[10px] opacity-75">{selectedPreset} enhancement</div>
            </div>
            <div className={`p-3 rounded-xl border ${currentStep >= 2 ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-800/40 border-slate-800 text-slate-500'}`}>
              <div className="font-semibold">2. OCR Stream</div>
              <div className="text-[10px] opacity-75">Tesseract extraction</div>
            </div>
            <div className={`p-3 rounded-xl border ${currentStep >= 3 ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-800/40 border-slate-800 text-slate-500'}`}>
              <div className="font-semibold">3. Heuristic Parser</div>
              <div className="text-[10px] opacity-75">Field & confidence mapping</div>
            </div>
            <div className={`p-3 rounded-xl border ${currentStep >= 4 ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-800/40 border-slate-800 text-slate-500'}`}>
              <div className="font-semibold">4. Rule & Duplicate Check</div>
              <div className="text-[10px] opacity-75">RapidFuzz matching</div>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline Error */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Extraction Result Showcase */}
      {resultRecord && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-700 space-y-6 animate-fade-in shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-100">{resultRecord.record_identifier}</h3>
                  <StatusBadge status={resultRecord.status} isFlagged={resultRecord.is_flagged} />
                  <ConfidenceBadge score={resultRecord.overall_confidence} size="sm" />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Pipeline completed with preset: <span className="font-semibold text-slate-300">{selectedPreset}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onSelectRecord(resultRecord)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Inspect Full Record</span>
              </button>

              {(resultRecord.status === 'PENDING_REVIEW' || resultRecord.status === 'FLAGGED') && (
                <button
                  onClick={() => onOpenReview(resultRecord)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Open in Human Review Workspace</span>
                </button>
              )}
            </div>
          </div>

          {/* Extracted Fields Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
              <span className="text-slate-400">Owner Name:</span>
              <p className="text-sm font-semibold text-slate-100">{resultRecord.owner_name}</p>
              <p className="text-slate-400">{resultRecord.parentage || 'No parentage'}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
              <span className="text-slate-400">Parcel Extent & Identification:</span>
              <p className="text-sm font-mono font-semibold text-indigo-300">
                Khasra #{resultRecord.khasra_number} &bull; Khata {resultRecord.khata_number || 'N/A'}
              </p>
              <p className="text-emerald-400 font-medium">
                {resultRecord.area_value} {resultRecord.area_unit} ({resultRecord.area_acres} Acres)
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1">
              <span className="text-slate-400">Revenue Jurisdiction:</span>
              <p className="text-sm font-semibold text-slate-100">
                {resultRecord.village}, {resultRecord.tehsil}
              </p>
              <p className="text-slate-400">{resultRecord.district} ({resultRecord.state})</p>
            </div>
          </div>

          {/* Validation Notices if any */}
          {resultRecord.validation_issues && resultRecord.validation_issues.length > 0 && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-semibold text-amber-300">
                <AlertTriangle className="w-4 h-4" />
                <span>Validation Alerts Triggered ({resultRecord.validation_issues.length})</span>
              </div>
              {resultRecord.validation_issues.map((v, i) => (
                <div key={i} className="text-amber-200/90 pl-6 list-disc">
                  &bull; {v.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
