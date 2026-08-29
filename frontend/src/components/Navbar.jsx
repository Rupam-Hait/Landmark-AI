import React from 'react';
import { Landmark, Bell } from 'lucide-react';

export const Navbar = ({ pendingCount = 0, flaggedCount = 0, onNavigate }) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/20 text-white">
          <Landmark className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-100 tracking-tight">Landmark AI</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono border border-indigo-500/30">
              v2.4 NLRMP
            </span>
          </div>
          <p className="text-xs text-slate-400">AI-Powered Legacy Land Records Digitization & Verification Platform</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Live Status Indicators */}
        <div className="hidden sm:flex items-center gap-3 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>OCR Engine: Online</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>FastAPI + OpenCV</span>
          </div>
        </div>

        {/* Action Alerts */}
        {(pendingCount > 0 || flaggedCount > 0) && (
          <button
            onClick={() => onNavigate('review')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition text-xs font-medium cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 animate-bounce" />
            <span>{pendingCount + flaggedCount} Awaiting Review</span>
          </button>
        )}

        <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-xs font-semibold text-slate-200 border border-slate-600">
            REV
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-medium text-slate-200">Revenue Officer</div>
            <div className="text-[10px] text-slate-400">Jaipur Central Division</div>
          </div>
        </div>
      </div>
    </header>
  );
};
