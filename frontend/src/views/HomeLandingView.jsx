import React from 'react';
import {
  FileText,
  ScanLine,
  FilePlus,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  MapPin,
  AlertTriangle,
  Building2,
  TrendingUp,
  Cpu,
  Fingerprint,
  Compass,
  FileCheck2,
} from 'lucide-react';

export const HomeLandingView = ({ onNavigate, userProfile }) => {
  return (
    <div className="space-y-12 animate-fade-in pb-16">
      
      {/* Top DILRMP Mission Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 border border-slate-800 text-xs sm:text-sm text-slate-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 shrink-0">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-white tracking-tight">National Land Records Modernization Mission</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                Targeting the Last 1% Legacy Gap
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              DILRMP and state portals have digitized ~99% of clean, printed records. <strong>Landmark-AI</strong> targets the critical remaining gap — legacy handwritten registers, cross-validation, duplicate detection, and seamless new registration — so digitization stays accurate and complete going forward.
            </p>
          </div>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 font-mono text-slate-300">
            Logged in: <strong className="text-indigo-400">{userProfile?.roleTitle || 'User'}</strong>
          </span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 p-8 sm:p-12 overflow-hidden shadow-2xl">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>AI-Powered Indic OCR &bull; Cadastral GIS &bull; Anti-Fraud Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Digitize India's Land Records <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
              with High-Precision AI
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            Transform centuries-old handwritten Jamabandis, Urdu/Devanagari Dakhil Kharij registers, and colonial cadastral maps into legally validated, spatially linked digital records with confidence scoring and automated duplicate detection.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigate('upload')}
              className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold flex items-center gap-2.5 shadow-xl shadow-indigo-600/25 transition cursor-pointer"
            >
              <ScanLine className="w-4 h-4" />
              <span>Digitize a Document</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('register')}
              className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center gap-2.5 shadow-xl shadow-emerald-600/25 transition cursor-pointer"
            >
              <FilePlus className="w-4 h-4" />
              <span>Register New Land Record</span>
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium flex items-center gap-2 transition cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span>View Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Documents Processed</span>
            <FileCheck2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">1,428,920+</div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <span>&uarr; 14.2%</span>
            <span className="text-slate-400">across 412 tehsils</span>
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Avg. AI Accuracy</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono tracking-tight">94.8%</div>
          <p className="text-[11px] text-slate-400">
            Multi-engine Indic OCR benchmark
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>States Onboarded</span>
            <Building2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white font-mono tracking-tight">28 States &amp; UTs</div>
          <p className="text-[11px] text-slate-400">
            Unified ULPIN Bhu-Aadhaar schema
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Duplicates Prevented</span>
            <ShieldCheck className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-rose-400 font-mono tracking-tight">14,210</div>
          <p className="text-[11px] text-slate-400">
            Encroachments &amp; duplicate claims halted
          </p>
        </div>
      </div>

      {/* 3-Step Interactive Process */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold">
            <span>Standard Operating Procedure</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How Landmark-AI Digitizes In 3 Seamless Steps
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            From brittle parchment registers to cryptographically signed, spatially mapped digital cadastral titles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 relative group hover:border-indigo-500/50 transition">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold font-mono text-base">
              01
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">Upload &amp; Filter Preprocessing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Feed scanned PDFs or phone photos. OpenCV filters apply adaptive CLAHE contrast, bilateral de-noising, and deskewing to restore faded 1950-80s ink.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2 text-xs text-indigo-400 font-medium">
              <span>Standard Otsu &bull; High CLAHE &bull; Denoise</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 relative group hover:border-indigo-500/50 transition">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold font-mono text-base">
              02
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">AI Multi-Engine OCR &amp; NLP Parsing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tesseract and transformer models parse handwritten Devanagari, Urdu, and English tabular grids into structured JSON with per-field confidence scoring.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2 text-xs text-indigo-400 font-medium">
              <span>Khasra &bull; Khata &bull; Area &bull; Owner Name</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 relative group hover:border-indigo-500/50 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold font-mono text-base">
              03
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">Officer Review &amp; Cadastral GIS Link</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Low-confidence items are reviewed side-by-side by Patwari/Verifier, cross-matched against GIS cadastral map boundaries, and assigned a 14-digit ULPIN.
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <span>Bhu-Aadhaar &bull; Cadastral Spatial Link &bull; SDM Sign</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white">Platform Innovations &bull; SIH Prototype</h3>
            <p className="text-xs text-slate-400 mt-1">Built to meet Ministry of Electronics &amp; IT and DILRMP interoperability specs</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('map')}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-2 transition cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>Explore Cadastral GIS</span>
            </button>
            <button
              onClick={() => onNavigate('fraud')}
              className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-xs font-semibold text-rose-300 border border-rose-500/30 flex items-center gap-2 transition cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Fraud Detection Engine</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
              <ScanLine className="w-4 h-4" />
              <span>Handwritten Indic OCR</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Specialized preprocessing kernels for Modi script, Shikasta Urdu, and Devanagari cursive cursive registers.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
              <Fingerprint className="w-4 h-4" />
              <span>14-Digit ULPIN Generation</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Automatic Unique Land Parcel Identification Number (Bhu-Aadhaar) calculated from geo-coordinates &amp; Khasra.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
              <MapPin className="w-4 h-4" />
              <span>Spatial Boundary Matching</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Instant cross-check between textual deed area (e.g. 4.85 Acres) and cadastral GIS shapefile polygon area.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Multi-Claim Conflict Alert</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Flags potential fraud when the same Khasra is registered twice under different seller deeds without mutation trail.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
