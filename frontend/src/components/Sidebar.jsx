import React from 'react';
import {
  LayoutDashboard,
  ScanLine,
  UserCheck,
  FolderOpen,
  MapPin,
  FilePlus,
  FileCheck2,
} from 'lucide-react';

export const Sidebar = ({ currentView, onViewChange, pendingCount = 0, flaggedCount = 0 }) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard & Analytics',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'upload',
      label: 'Upload & OCR Studio',
      icon: ScanLine,
      badge: 'AI Pipeline',
    },
    {
      id: 'register',
      label: 'Register Land Record',
      icon: FilePlus,
      badge: 'New Portal',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      id: 'review',
      label: 'Human Review Queue',
      icon: UserCheck,
      badge: pendingCount + flaggedCount > 0 ? `${pendingCount + flaggedCount}` : null,
      badgeColor: flaggedCount > 0 ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
    {
      id: 'records',
      label: 'Land Records Explorer',
      icon: FolderOpen,
      badge: null,
    },
    {
      id: 'map',
      label: 'District Geo-Map',
      icon: MapPin,
      badge: 'GIS',
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/90 p-4 flex flex-col justify-between shrink-0 h-[calc(100vh-4rem)] sticky top-16">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Main Navigation
          </p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                        item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Workflow Info Box */}
        <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-800 text-xs text-slate-400 space-y-2">
          <div className="flex items-center gap-2 text-slate-200 font-semibold">
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            <span>Digitization Flow</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Scanned deed upload &rarr; OpenCV filters &rarr; OCR text parse &rarr; Rule check & duplicate match &rarr; Review or auto-verify.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
        <div className="flex justify-between">
          <span>Target Accuracy</span>
          <span className="text-emerald-400 font-mono font-medium">&ge; 85% Auto</span>
        </div>
        <div className="flex justify-between">
          <span>Backend Database</span>
          <span className="text-slate-300 font-mono">SQLite (Active)</span>
        </div>
      </div>
    </aside>
  );
};
