import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

export const ConfidenceBadge = ({ score, showIcon = true, size = 'md' }) => {
  const num = typeof score === 'number' ? score : parseFloat(score) || 0;

  let bg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let label = 'Very High';
  let Icon = ShieldCheck;

  if (num < 70) {
    bg = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    label = 'Low Confidence';
    Icon = ShieldAlert;
  } else if (num < 85) {
    bg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    label = 'Moderate';
    Icon = AlertTriangle;
  } else if (num < 95) {
    bg = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    label = 'High';
    Icon = ShieldCheck;
  }

  const sizeClasses = size === 'sm' 
    ? 'text-xs px-2 py-0.5' 
    : size === 'lg' 
      ? 'text-sm px-3 py-1.5 font-semibold' 
      : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-mono ${bg} ${sizeClasses}`}>
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{num.toFixed(1)}%</span>
      {size === 'lg' && <span className="opacity-75 font-sans">({label})</span>}
    </span>
  );
};
