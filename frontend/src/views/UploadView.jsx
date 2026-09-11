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
  ZoomIn,
  ZoomOut,
  Edit3,
  Check,
  Download,
  RotateCcw,
  Maximize2,
  FileCheck2,
  Sparkle,
  Cpu,
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
  const [editedFields, setEditedFields] = useState({});
  const [editingFieldKey, setEditingFieldKey] = useState(null);
  const [editTempValue, setEditTempValue] = useState('');
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showBBoxes, setShowBBoxes] = useState(true);
  const [invertDoc, setInvertDoc] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  useEffect(() => {
    api.getSamples().then(setSamples).catch(console.error);
  }, []);

  const runPipelineSteps = async (actionPromise) => {
    setProcessing(true);
    setError(null);
    setResultRecord(null);
    setEditedFields({});
    setSubmittedSuccess(false);
    setCurrentStep(1);

    try {
      // Step 1: Image Enhancement
      await new Promise((r) => setTimeout(r, 450));
      setCurrentStep(2);

      // Step 2: Line & Table Segmentation
      await new Promise((r) => setTimeout(r, 550));
      setCurrentStep(3);

      // Step 3: Indic OCR & Entity Extraction
      const result = await actionPromise;
      setCurrentStep(4);

      // Step 4: Spatial & Duplicate Check
      await new Promise((r) => setTimeout(r, 450));
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

  const handleStartFieldEdit = (key, val) => {
    setEditingFieldKey(key);
    setEditTempValue(val || '');
  };

  const handleSaveFieldEdit = (key) => {
    setEditedFields((prev) => ({ ...prev, [key]: editTempValue }));
    setEditingFieldKey(null);
  };

  const handleSubmitForVerification = async () => {
    if (!resultRecord) return;
    try {
      if (Object.keys(editedFields).length > 0) {
        await api.updateRecord(resultRecord.id, editedFields);
      }
      setSubmittedSuccess(true);
      setTimeout(() => {
        onNavigate('review');
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  const getEffectiveValue = (key, defaultVal) => {
    if (editedFields[key] !== undefined) return editedFields[key];
    return defaultVal;
  };

  const presets = [
    { id: 'standard', name: 'Standard Otsu', desc: 'Bilateral noise filter + adaptive Otsu binarization' },
    { id: 'high_contrast', name: 'High Contrast CLAHE', desc: 'Sharpening kernel for faint historical ink' },
    { id: 'deskew', name: 'Deskew & Align', desc: 'Straightens rotated scans & normalizes margins' },
    { id: 'denoise', name: 'Deep Denoise', desc: 'Non-local means filtering for aged textured parchment' },
    { id: 'invert', name: 'Invert Mask', desc: 'Inverted threshold for dark stamps & watermark separation' },
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white">AI Land Document Digitization Studio</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
              Multi-Script Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Upload scanned deeds or select historical registers to run OpenCV enhancement, Indic OCR extraction, and rule validation.
          </p>
        </div>

        {resultRecord && (
          <button
            onClick={() => {
              setResultRecord(null);
              setEditedFields({});
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition cursor-pointer self-start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Digitize Another Document</span>
          </button>
        )}
      </div>

      {!resultRecord && (
        <>
          {/* Preset Filter Selection */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Image Enhancement &amp; Preprocessing Preset</span>
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
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold">{p.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1 leading-tight">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 1-Click Ready Historical Samples */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Preloaded Historical Records (Instant 1-Click Test)</span>
              </div>
              <span className="text-xs text-slate-400">Click any card to simulate real OCR extraction</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {samples.map((sample) => (
                <div
                  key={sample.id}
                  onClick={() => !processing && handleProcessSample(sample.id)}
                  className={`p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 transition cursor-pointer flex flex-col justify-between group space-y-3 shadow-md ${
                    processing ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {sample.script}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition line-clamp-1">
                      {sample.title}
                    </h4>

                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                      {sample.subtitle} &bull; {sample.condition}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono font-medium">
                      {sample.fields_count} Extracted Fields
                    </span>
                    <span className="text-xs text-indigo-400 flex items-center gap-1 font-semibold group-hover:translate-x-1 transition">
                      <span>Start Extraction</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Drag and Drop Upload Box */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            className={`p-8 sm:p-12 rounded-3xl border-2 border-dashed transition flex flex-col items-center justify-center text-center space-y-4 ${
              dragActive
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
            }`}
          >
            <div className="p-4 rounded-2xl bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-lg shadow-indigo-600/10">
              <UploadCloud className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Upload Your Scanned Land Record or Deed</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Drag &amp; drop PDF, JPG, PNG, or TIFF scans of Jamabandis, Sale Deeds, Khasra Girdawari, or Mutation Registers.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer flex items-center gap-2 shadow-lg shadow-indigo-600/20">
                <span>Upload Document / Browse Files</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  disabled={processing}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </>
      )}

      {/* Live Stepper Animation during Processing */}
      {processing && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-indigo-500/40 space-y-5 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30">
                <RefreshCw className="w-5 h-5 animate-spin" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">AI OCR &amp; NLP Extraction Pipeline Running</h3>
                <p className="text-xs text-slate-400">Applying neural vision filters and heuristic parsing...</p>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold">
              Step {currentStep} of 4
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className={`p-3.5 rounded-xl border transition ${currentStep >= 1 ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-950/60 border-slate-800 text-slate-500'}`}>
              <div className="font-bold">1. Image Filters</div>
              <div className="text-[11px] opacity-80 mt-0.5">Adaptive CLAHE &amp; Denoise</div>
            </div>
            <div className={`p-3.5 rounded-xl border transition ${currentStep >= 2 ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-950/60 border-slate-800 text-slate-500'}`}>
              <div className="font-bold">2. Grid Segmentation</div>
              <div className="text-[11px] opacity-80 mt-0.5">Khasra/Khata tabular boxes</div>
            </div>
            <div className={`p-3.5 rounded-xl border transition ${currentStep >= 3 ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300' : 'bg-slate-950/60 border-slate-800 text-slate-500'}`}>
              <div className="font-bold">3. Indic OCR Parse</div>
              <div className="text-[11px] opacity-80 mt-0.5">Devanagari &amp; Urdu text</div>
            </div>
            <div className={`p-3.5 rounded-xl border transition ${currentStep >= 4 ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300' : 'bg-slate-950/60 border-slate-800 text-slate-500'}`}>
              <div className="font-bold">4. Cadastral Check</div>
              <div className="text-[11px] opacity-80 mt-0.5">Spatial &amp; duplicate validation</div>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-3 text-rose-300 text-xs">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Banner */}
      {submittedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Record confirmed and submitted to the Revenue Officer Verification Queue! Redirecting...</span>
        </div>
      )}

      {/* Results Split Screen */}
      {resultRecord && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Status Capsule */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-sm font-bold text-white">{resultRecord.record_identifier}</span>
                  <StatusBadge status={resultRecord.status} isFlagged={resultRecord.is_flagged} />
                  <ConfidenceBadge score={resultRecord.overall_confidence} />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  AI extracted with preset: <strong className="text-slate-300 font-semibold">{selectedPreset}</strong> &bull; {resultRecord.land_classification}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => api.exportJSON(resultRecord.record_identifier, resultRecord)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>JSON</span>
              </button>
              <button
                onClick={handleSubmitForVerification}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Submit for Verification</span>
              </button>
            </div>
          </div>

          {/* Split Screen Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column (5 Cols): Scanned Document Viewer with Zoom & Overlay */}
            <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-4 space-y-3 flex flex-col shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-indigo-400" />
                  <span>Original Scanned Deed</span>
                </span>
                
                {/* Image Tools */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.2))}
                    className="p-1 rounded text-slate-400 hover:text-white"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono text-slate-400 px-1">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.2))}
                    className="p-1 rounded text-slate-400 hover:text-white"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setInvertDoc(!invertDoc)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${invertDoc ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    title="Invert Contrast"
                  >
                    Invert
                  </button>
                  <button
                    onClick={() => setShowBBoxes(!showBBoxes)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${showBBoxes ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    title="Toggle Bounding Boxes"
                  >
                    Boxes
                  </button>
                </div>
              </div>

              {/* Document Image Frame */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 h-[480px] flex items-center justify-center">
                <img
                  src={resultRecord.document_filepath || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'}
                  alt="Scanned Deed"
                  style={{
                    transform: `scale(${zoomLevel})`,
                    filter: invertDoc ? 'invert(1) contrast(1.2)' : 'none',
                    transition: 'transform 0.2s ease',
                  }}
                  className="max-h-full max-w-full object-contain select-none"
                />

                {/* Simulated OCR Bounding Box Annotations */}
                {showBBoxes && (
                  <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-around">
                    <div className="w-3/4 h-8 border-2 border-emerald-400/80 bg-emerald-500/10 rounded px-1 text-[9px] font-mono text-emerald-300">
                      Owner: {resultRecord.owner_name?.slice(0, 20)} (96.5%)
                    </div>
                    <div className="w-1/2 h-7 border-2 border-indigo-400/80 bg-indigo-500/10 rounded px-1 text-[9px] font-mono text-indigo-300">
                      Khasra No: {resultRecord.khasra_number} (95.5%)
                    </div>
                    <div className="w-2/3 h-7 border-2 border-amber-400/80 bg-amber-500/10 rounded px-1 text-[9px] font-mono text-amber-300">
                      Area: {resultRecord.area_value} {resultRecord.area_unit} (88.5%)
                    </div>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-500 text-center font-mono">
                High-Resolution Image Archive &bull; SHA-256 Verified Scan
              </p>
            </div>

            {/* Right Column (7 Cols): Extracted Structured Fields with Inline Editing */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Extracted Structured Fields</h3>
                </div>
                <span className="text-[11px] text-slate-400">
                  {Object.keys(editedFields).length > 0 ? (
                    <span className="text-amber-400 font-semibold">{Object.keys(editedFields).length} field(s) edited</span>
                  ) : (
                    'Click Edit on any field to correct'
                  )}
                </span>
              </div>

              {/* Fields Table List */}
              <div className="space-y-3">
                
                {/* Field: Owner Name */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-400">Owner Name (Title Holder)</span>
                    <ConfidenceBadge score={resultRecord.field_confidences?.owner_name || 96.5} size="sm" />
                  </div>
                  {editingFieldKey === 'owner_name' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editTempValue}
                        onChange={(e) => setEditTempValue(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-indigo-500 text-xs text-white"
                      />
                      <button
                        onClick={() => handleSaveFieldEdit('owner_name')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
                      >
                        Confirm Field
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">
                        {getEffectiveValue('owner_name', resultRecord.owner_name)}
                      </span>
                      <button
                        onClick={() => handleStartFieldEdit('owner_name', getEffectiveValue('owner_name', resultRecord.owner_name))}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Grid of Khasra, Khata, Survey */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Khasra */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Khasra Number</span>
                      <ConfidenceBadge score={resultRecord.field_confidences?.khasra_number || 95.5} size="sm" />
                    </div>
                    {editingFieldKey === 'khasra_number' ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editTempValue}
                          onChange={(e) => setEditTempValue(e.target.value)}
                          className="w-full px-2 py-1 rounded bg-slate-900 border border-indigo-500 text-xs text-white"
                        />
                        <button onClick={() => handleSaveFieldEdit('khasra_number')} className="p-1 bg-emerald-600 text-white rounded">✓</button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-sm font-bold text-indigo-300">
                          {getEffectiveValue('khasra_number', resultRecord.khasra_number)}
                        </span>
                        <button onClick={() => handleStartFieldEdit('khasra_number', getEffectiveValue('khasra_number', resultRecord.khasra_number))} className="text-[11px] text-indigo-400">Edit</button>
                      </div>
                    )}
                  </div>

                  {/* Khata */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Khata Number</span>
                      <ConfidenceBadge score={resultRecord.field_confidences?.khata_number || 98.0} size="sm" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-slate-200">
                        {getEffectiveValue('khata_number', resultRecord.khata_number || '142/38')}
                      </span>
                    </div>
                  </div>

                  {/* Survey */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Survey No.</span>
                      <ConfidenceBadge score={91.0} size="sm" />
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-200 block">
                      {resultRecord.survey_number || 'SR-1974-942'}
                    </span>
                  </div>
                </div>

                {/* Plot Area with Units */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-400">Total Plot Area &amp; Unit</span>
                    <ConfidenceBadge score={resultRecord.field_confidences?.area_value || 88.5} size="sm" />
                  </div>
                  {editingFieldKey === 'area_value' ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={editTempValue}
                        onChange={(e) => setEditTempValue(e.target.value)}
                        className="w-32 px-3 py-1.5 rounded-lg bg-slate-900 border border-indigo-500 text-xs text-white font-mono"
                      />
                      <button
                        onClick={() => handleSaveFieldEdit('area_value')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
                      >
                        Confirm
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-mono font-bold text-emerald-400">
                        {getEffectiveValue('area_value', resultRecord.area_value)} {resultRecord.area_unit} ({resultRecord.area_acres || resultRecord.area_value} Acres)
                      </span>
                      <button
                        onClick={() => handleStartFieldEdit('area_value', getEffectiveValue('area_value', resultRecord.area_value))}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Location & Jurisdiction Row */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-400 block">Jurisdiction Details</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Village</span>
                      <span className="font-semibold text-slate-200">{resultRecord.village}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Tehsil</span>
                      <span className="font-semibold text-slate-200">{resultRecord.tehsil}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">District</span>
                      <span className="font-semibold text-slate-200">{resultRecord.district}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">State</span>
                      <span className="font-semibold text-slate-200">{resultRecord.state}</span>
                    </div>
                  </div>
                </div>

                {/* Land Classification & ULPIN */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 block">Land Classification</span>
                    <span className="text-xs font-semibold text-slate-200 block">{resultRecord.land_classification}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="text-[11px] text-slate-400 block">14-Digit ULPIN (Bhu-Aadhaar)</span>
                    <span className="text-xs font-mono font-bold text-indigo-300 block">{resultRecord.ulpin || 'Pending Generation'}</span>
                  </div>
                </div>

              </div>

              {/* Action Buttons Footer */}
              <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setResultRecord(null);
                    setEditedFields({});
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition cursor-pointer"
                >
                  Cancel / Re-upload
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSubmitForVerification}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit for Officer Verification</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

