import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  User,
  CheckCircle2,
  Phone,
  Mail,
  KeyRound,
  ArrowRight,
  Sparkles,
  Building2,
  FileText,
  Lock,
  RefreshCw,
  Award,
  ChevronRight,
  Smartphone,
  Landmark,
  ArrowLeft,
  BadgeCheck,
} from 'lucide-react';

export const ROLES = [
  {
    id: 'citizen',
    label: 'Citizen',
    title: 'Citizen / Land Owner',
    dept: 'Public Citizen Portal',
    badge: 'Citizen Access',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    icon: User,
    color: 'emerald',
    defaultName: 'Rameshwar Sharma',
    defaultEmail: 'rameshwar.sharma@gmail.com',
    defaultPhone: '9829012345',
    description: 'Search land parcels, submit mutation requests, and track Bhu-Aadhaar ULPIN status.',
    allowedViews: ['dashboard', 'records', 'register', 'map'],
  },
  {
    id: 'patwari',
    label: 'Patwari',
    title: 'Patwari / Field Officer',
    dept: 'Revenue Circle & Field Operations',
    badge: 'Circle Staff',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    icon: FileText,
    color: 'indigo',
    defaultName: 'Sunil Sharma',
    defaultEmail: 'sunil.sharma@rajasthan.gov.in',
    defaultPhone: '9414098765',
    description: 'Digitize legacy Jamabandis via AI OCR, perform ground surveys, and register transactions.',
    allowedViews: ['dashboard', 'upload', 'register', 'records', 'review', 'map'],
  },
  {
    id: 'verifier',
    label: 'Verifier',
    title: 'Verifier / Revenue Inspector',
    dept: 'Sub-Division Land Validation Unit',
    badge: 'Verification Officer',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    icon: ShieldCheck,
    color: 'amber',
    defaultName: 'Rajesh Meena',
    defaultEmail: 'rajesh.meena@rajasthan.gov.in',
    defaultPhone: '9166054321',
    description: 'Inspect low-confidence OCR extractions side-by-side with original deeds and approve records.',
    allowedViews: ['review', 'records', 'fraud', 'map', 'audit', 'dashboard'],
  },
  {
    id: 'admin',
    label: 'District Admin',
    title: 'District Admin / Tehsildar',
    dept: 'District Collectorate & Revenue Court',
    badge: 'Full Executive Access',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    icon: Building2,
    color: 'purple',
    defaultName: 'Dr. Arvind Sharma',
    defaultEmail: 'arvind.tehsildar@rajasthan.gov.in',
    defaultPhone: '9876543210',
    description: 'Access complete district analytics, resolve duplicate & fraud flags, GIS map, and audit logs.',
    allowedViews: ['dashboard', 'upload', 'register', 'review', 'fraud', 'records', 'map', 'audit'],
  },
];

export const LoginView = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [selectedRole, setSelectedRole] = useState('admin');
  const [name, setName] = useState('Dr. Arvind Sharma');
  const [email, setEmail] = useState('arvind.tehsildar@rajasthan.gov.in');
  const [phoneNumber, setPhoneNumber] = useState('9876543210');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // When role is changed by user clicking a role button, set suitable defaults if fields match previous defaults
  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setError('');
    const targetRole = ROLES.find((r) => r.id === roleId);
    if (targetRole) {
      setName(targetRole.defaultName);
      setEmail(targetRole.defaultEmail);
      setPhoneNumber(targetRole.defaultPhone);
    }
  };

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  const validateForm = () => {
    if (!name.trim() || name.trim().length < 2) {
      setError('Please enter your full name (at least 2 characters)');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError('Please enter a valid email address (e.g. yourname@domain.com)');
      return false;
    }
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile phone number');
      return false;
    }
    return true;
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setError('');
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      setTimer(60);
      setOtp('849201'); // Pre-filled OTP for fast evaluation
    }, 600);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Please enter the 6-digit OTP code');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const activeRoleObj = ROLES.find((r) => r.id === selectedRole) || ROLES[3];
      const userProfile = {
        role: selectedRole,
        roleTitle: activeRoleObj.title,
        dept: activeRoleObj.dept,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phoneNumber.replace(/\D/g, ''),
        district: 'Jaipur Central Division',
        state: 'Rajasthan',
        loginTime: new Date().toISOString(),
        authMode,
      };
      onLoginSuccess(userProfile);
    }, 500);
  };

  const handleQuickDemoLogin = (roleId) => {
    const r = ROLES.find((item) => item.id === roleId) || ROLES[3];
    setSelectedRole(roleId);
    setName(r.defaultName);
    setEmail(r.defaultEmail);
    setPhoneNumber(r.defaultPhone);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const userProfile = {
        role: roleId,
        roleTitle: r.title,
        dept: r.dept,
        name: r.defaultName,
        email: r.defaultEmail,
        phone: r.defaultPhone,
        district: 'Jaipur Central Division',
        state: 'Rajasthan',
        loginTime: new Date().toISOString(),
        authMode: 'login',
      };
      onLoginSuccess(userProfile);
    }, 350);
  };

  const activeRoleData = ROLES.find((r) => r.id === selectedRole) || ROLES[3];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/70 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 shadow-md shadow-indigo-600/25 text-white flex items-center justify-center">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white tracking-tight">Landmark-AI</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
                Govt of India &bull; DILRMP
              </span>
            </div>
            <p className="text-xs text-slate-400">National AI Land Records Digitization &amp; Validation Platform</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700/60 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            256-bit NIC e-Gov Security Standard
          </span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 z-10">
        <div className="max-w-xl w-full bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 backdrop-blur-sm">
          
          {/* Card Top: Mode Switcher & Title */}
          <div className="space-y-3 text-center">
            <div className="inline-flex p-1 rounded-xl bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setOtpSent(false);
                  setError('');
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In to Portal
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setOtpSent(false);
                  setError('');
                }}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                New User Registration
              </button>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {authMode === 'login' ? 'Access Landmark-AI Portal' : 'Register for Landmark-AI'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your verified credentials to access authorized land records and AI validation tools.
              </p>
            </div>
          </div>

          {/* Section 1: Role Selection as SMALL BUTTONS */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <BadgeCheck className="w-3.5 h-3.5 text-indigo-400" />
                Select Operating Role:
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {activeRoleData.title}
              </span>
            </label>

            {/* Small Compact Pill Buttons Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const isSelected = selectedRole === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleRoleSelect(r.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20 ring-1 ring-indigo-400/30'
                        : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{r.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Compact Selected Role Information Banner */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="truncate">
                Dept: <strong className="text-slate-200">{activeRoleData.dept}</strong>
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${activeRoleData.badgeColor} shrink-0 ml-2`}>
                {activeRoleData.badge}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: User Details Form (Name, Email, Mobile) */}
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              {/* Full Name Input (Required) */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Full Name <span className="text-rose-400">*</span>
                  </span>
                  <span className="text-[10px] text-slate-500">As per official ID</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Email Address Input (Required) */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    Email Address <span className="text-rose-400">*</span>
                  </span>
                  <span className="text-[10px] text-slate-500">For digital audit reports &amp; OTP</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.gov.in"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Mobile Number Input (Required) */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Mobile Number <span className="text-rose-400">*</span>
                  </span>
                  <span className="text-[10px] text-slate-500">Linked to Aadhaar / NIC</span>
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center gap-1.5 text-slate-400 font-mono text-xs border-r border-slate-800 pr-2.5">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="10-digit mobile number"
                    className="w-full pl-24 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending Verification Code...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed with OTP Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Step 2: OTP Verification Form */
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between text-slate-300 font-medium">
                  <span>Authenticating as: <strong>{name}</strong></span>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-[11px] text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" /> Edit
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Email: <span className="text-slate-300 font-mono">{email}</span> &bull; Mobile: <span className="text-slate-300 font-mono">+91 {phoneNumber}</span>
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Enter 6-Digit OTP Code
                  </label>
                  <span className="text-[10px] text-slate-500">Sent via NIC SMS Gateway</span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-center text-lg tracking-[0.5em] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition"
                  />
                </div>
              </div>

              {/* Demo Auto-Fill Pill */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                <div className="flex items-center gap-2 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Demo OTP: <strong className="font-mono">849201</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => setOtp('849201')}
                  className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-semibold font-mono cursor-pointer transition"
                >
                  Auto-fill
                </button>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>
                  {timer > 0 ? (
                    <>Resend in <strong className="text-slate-300 font-mono">{timer}s</strong></>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-indigo-400 hover:underline cursor-pointer"
                    >
                      Resend OTP now
                    </button>
                  )}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 4}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Verify &amp; Enter Landmark-AI</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo One-Click Access for Evaluators */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold flex items-center gap-1.5 text-slate-300">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>1-Click Hackathon Evaluator Quick Access:</span>
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin')}
                className="px-2.5 py-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-200 hover:bg-purple-500/30 text-[11px] font-medium transition cursor-pointer text-center truncate"
                title="Login as District Admin (Dr. Arvind Sharma)"
              >
                🏛️ Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('verifier')}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-200 hover:bg-amber-500/30 text-[11px] font-medium transition cursor-pointer text-center truncate"
                title="Login as Verifier Inspector (Rajesh Meena)"
              >
                ⚖️ Verifier
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('patwari')}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 hover:bg-indigo-500/30 text-[11px] font-medium transition cursor-pointer text-center truncate"
                title="Login as Patwari Officer (Sunil Sharma)"
              >
                📋 Patwari
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('citizen')}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/30 text-[11px] font-medium transition cursor-pointer text-center truncate"
                title="Login as Citizen (Rameshwar Sharma)"
              >
                👤 Citizen
              </button>
            </div>
          </div>

          {/* Footer Notice */}
          <div className="pt-2 text-[10px] text-slate-500 text-center space-y-0.5">
            <p>Department of Land Resources &bull; Ministry of Rural Development, GoI</p>
            <p className="text-slate-600">Landmark-AI &bull; Unified Cadastral &amp; Indic OCR Verification Engine</p>
          </div>
        </div>
      </main>

      {/* Bottom Tricolor Accent Ribbon */}
      <div className="h-1.5 w-full flex">
        <div className="h-full w-1/3 bg-amber-500" />
        <div className="h-full w-1/3 bg-slate-100" />
        <div className="h-full w-1/3 bg-emerald-600" />
      </div>
    </div>
  );
};
