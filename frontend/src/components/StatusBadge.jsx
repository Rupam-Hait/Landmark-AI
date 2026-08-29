import React from 'react';
import { CheckCircle2, UserCheck, Clock, AlertOctagon, XCircle } from 'lucide-react';

export const StatusBadge = ({ status, isFlagged = false, size = 'md' }) => {
  const s = (status || '').toUpperCase();

  let bg = 'bg-slate-700/50 text-slate-300 border-slate-600';
  let label = status || 'Unknown';
  let Icon = Clock;

  if (s === 'AUTO_VERIFIED') {
    bg = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
    label = 'Auto-Verified';
    Icon = CheckCircle2;
  } else if (s === 'HUMAN_VERIFIED') {
    bg = 'bg-blue-500/15 text-blue-300 border-blue-500/40';
    label = 'Human Verified';
    Icon = UserCheck;
  } else if (s === 'PENDING_REVIEW') {
    bg = 'bg-amber-500/15 text-amber-300 border-amber-500/40';
    label = 'Pending Review';
    Icon = Clock;
  } else if (s === 'FLAGGED') {
    bg = 'bg-rose-500/15 text-rose-300 border-rose-500/40';
    label = 'Flagged Conflict';
    Icon = AlertOctagon;
  } else if (s === 'REJECTED') {
    bg = 'bg-red-950/60 text-red-400 border-red-800';
    label = 'Rejected';
    Icon = XCircle;
  }

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5' 
    : size === 'lg' 
      ? 'text-sm px-3.5 py-1.5 font-semibold' 
      : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${bg} ${sizeClasses}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{label}</span>
      {isFlagged && s !== 'FLAGGED' && (
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" title="Flagged Issues Present" />
      )}
    </span>
  );
};
