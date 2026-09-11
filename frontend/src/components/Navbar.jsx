import React, { useState } from 'react';
import {
  Landmark,
  Bell,
  LayoutDashboard,
  ScanLine,
  FilePlus,
  UserCheck,
  AlertTriangle,
  MapPin,
  History,
  FolderOpen,
  LogOut,
  ChevronDown,
  User,
  ShieldCheck,
  Sparkles,
  Layers,
} from 'lucide-react';
import { ROLES } from '../views/LoginView';

export const Navbar = ({
  currentView,
  onNavigate,
  userProfile,
  onLogout,
  onSwitchRole,
  pendingCount = 0,
  flaggedCount = 0,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const navLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['citizen', 'patwari', 'verifier', 'admin'] },
    { id: 'upload', label: 'Digitize Doc', icon: ScanLine, roles: ['patwari', 'verifier', 'admin'] },
    { id: 'register', label: 'New Record', icon: FilePlus, roles: ['citizen', 'patwari', 'admin'] },
    {
      id: 'review',
      label: 'Verification Queue',
      icon: UserCheck,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      roles: ['verifier', 'patwari', 'admin'],
    },
    {
      id: 'fraud',
      label: 'Fraud & Flags',
      icon: AlertTriangle,
      badge: flaggedCount > 0 ? flaggedCount : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      roles: ['verifier', 'admin'],
    },
    { id: 'records', label: 'Land Records', icon: FolderOpen, roles: ['citizen', 'patwari', 'verifier', 'admin'] },
    { id: 'map', label: 'GIS Map', icon: MapPin, roles: ['citizen', 'patwari', 'verifier', 'admin'] },
    { id: 'audit', label: 'Audit Trail', icon: History, roles: ['verifier', 'admin'] },
  ];

  const currentRole = userProfile?.role || 'admin';
  const visibleLinks = navLinks.filter((link) => link.roles.includes(currentRole));

  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-40">
      {/* Top Banner Bar */}
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo & Brand */}
        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
        >
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 shadow-md shadow-indigo-600/20 text-white group-hover:scale-105 transition">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">Landmark-AI</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30 hidden sm:inline-block">
                DILRMP &bull; GoI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">AI Land Record Digitization &amp; Cadastral Validation</p>
          </div>
        </div>

        {/* Live Engine Status Indicators */}
        <div className="hidden xl:flex items-center gap-3 bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-[11px]">Indic OCR Engine: Online</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono text-[11px]">Cadastral GIS: Active</span>
          </div>
        </div>

        {/* Right Section: Pending Alert & User Profile */}
        <div className="flex items-center gap-3">
          {(pendingCount > 0 || flaggedCount > 0) && (
            <button
              onClick={() => onNavigate(flaggedCount > 0 ? 'fraud' : 'review')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 transition text-xs font-medium cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 animate-bounce" />
              <span className="hidden sm:inline">{pendingCount + flaggedCount} Issues Awaiting Action</span>
              <span className="sm:hidden font-mono font-bold">{pendingCount + flaggedCount}</span>
            </button>
          )}

          {/* User Role Capsule & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 transition cursor-pointer text-left"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 flex items-center justify-center text-xs font-bold">
                {userProfile?.name?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-semibold text-slate-200 leading-none">
                  {userProfile?.name || 'Authorized User'}
                </div>
                <div className="text-[10px] text-indigo-400 mt-0.5 leading-none">
                  {userProfile?.roleTitle || 'District Admin'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-2xl z-50 animate-fade-in space-y-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="text-xs font-bold text-white">{userProfile?.name}</div>
                  <div className="text-[11px] text-indigo-300">{userProfile?.roleTitle}</div>
                  <div className="text-[10px] text-slate-400">{userProfile?.district} &bull; {userProfile?.state}</div>
                  <div className="text-[10px] text-slate-500 font-mono">Ph: +91 {userProfile?.phone}</div>
                </div>

                {/* Role Switcher in Menu */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block px-1">
                    Switch Active Persona:
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {ROLES.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          onSwitchRole(r.id);
                          setProfileDropdownOpen(false);
                        }}
                        className={`p-2 rounded-lg text-left text-xs transition cursor-pointer border ${
                          currentRole === r.id
                            ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 font-semibold'
                            : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-[11px] truncate">{r.title.split('/')[0]}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout &amp; Switch Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Navigation Links Bar (Always Visible) */}
      <nav className="px-4 sm:px-6 bg-slate-950/90 border-t border-slate-800/80 flex items-center gap-1 overflow-x-auto py-1.5 scrollbar-none">
        {visibleLinks.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold border ${
                    isActive ? 'bg-white/20 text-white border-white/30' : item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};

