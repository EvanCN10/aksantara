'use client';

import React from 'react';

interface SessionMetricCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  badge?: string;
  icon: React.ComponentType<{ className?: string }>;
  highlight?: boolean;
  index?: number;
}

export function SessionMetricCard({
  label,
  value,
  sublabel,
  badge,
  icon: Icon,
  highlight = false,
  index = 0,
}: SessionMetricCardProps) {
  return (
    <div
      style={{ animationDelay: `${index * 65}ms` }}
      className={`relative p-4 sm:p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between animate-in fade-in slide-in-from-bottom-2 fill-mode-both ${
        highlight
          ? 'bg-gradient-to-b from-[#ffd261]/15 via-white/[0.04] to-black/30 border-[#ffd261]/40 shadow-[0_4px_24px_rgba(255,210,97,0.18)]'
          : 'bg-[#0c1a2c]/80 border-white/10 hover:border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.3)]'
      }`}
    >
      {/* Top row: Icon and Optional Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div
          className={`p-2 rounded-xl ${
            highlight
              ? 'bg-[#ffd261]/20 text-[#ffd261] border border-[#ffd261]/30'
              : 'bg-white/5 text-white/70 border border-white/10'
          }`}
        >
          <Icon className="w-4 h-4" />
        </div>

        {badge && (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            {badge}
          </span>
        )}
      </div>

      {/* Main value & label */}
      <div>
        <div
          className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
            highlight ? 'text-[#ffd261]' : 'text-white'
          }`}
        >
          {value}
        </div>
        <div className="text-xs font-medium text-white/70 mt-0.5">{label}</div>
        {sublabel && (
          <div className="text-[11px] text-white/45 mt-1 leading-snug">
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}
