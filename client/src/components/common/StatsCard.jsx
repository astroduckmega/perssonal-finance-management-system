import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend, // percentage number e.g. +12 or -5
  trendLabel,
  color = 'brand', // 'brand', 'emerald', 'rose', 'amber', 'cyan'
  badge,
}) {
  const colorMap = {
    brand: {
      border: 'hover:border-brand-500/40',
      iconBg: 'bg-brand-500/15 text-brand-400 border-brand-500/30',
      glow: 'shadow-glow',
    },
    emerald: {
      border: 'hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      glow: 'shadow-glow-emerald',
    },
    rose: {
      border: 'hover:border-rose-500/40',
      iconBg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      glow: 'shadow-glow-rose',
    },
    amber: {
      border: 'hover:border-amber-500/40',
      iconBg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      glow: 'hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.3)]',
    },
    cyan: {
      border: 'hover:border-cyan-500/40',
      iconBg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
      glow: 'hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.3)]',
    },
  };

  const scheme = colorMap[color] || colorMap.brand;

  return (
    <div
      className={`glass-panel rounded-2xl p-5 border border-slate-800 transition-all duration-300 ${scheme.border} ${scheme.glow} relative overflow-hidden group`}
    >
      {/* Background Accent Subtle Glow */}
      <div className="absolute -right-10 -top-10 w-28 h-28 bg-white/5 rounded-full blur-2xl group-hover:bg-brand-500/10 transition-all duration-500" />

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className="flex items-center space-x-2">
          {badge && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {badge}
            </span>
          )}
          {Icon && (
            <div className={`p-2.5 rounded-xl border ${scheme.iconBg}`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>
      </div>

      <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mb-1">
        {value}
      </div>

      {(subtitle || trend !== undefined) && (
        <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-slate-800/60">
          {trend !== undefined ? (
            <div className="flex items-center space-x-1">
              {trend > 0 ? (
                <span className="flex items-center font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  <TrendingUp className="w-3 h-3 mr-0.5" />+{trend}%
                </span>
              ) : trend < 0 ? (
                <span className="flex items-center font-medium text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                  <TrendingDown className="w-3 h-3 mr-0.5" />{trend}%
                </span>
              ) : (
                <span className="flex items-center font-medium text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                  <Minus className="w-3 h-3 mr-0.5" /> 0%
                </span>
              )}
              {trendLabel && <span className="text-slate-400 ml-1">{trendLabel}</span>}
            </div>
          ) : (
            <span className="text-slate-400">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
