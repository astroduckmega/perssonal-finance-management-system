import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color = 'brand',
  badge,
}) {
  const colorMap = {
    brand: {
      border: 'hover:border-orange-200',
      iconBg: 'bg-orange-50 text-[#E8450A] border-orange-100',
    },
    emerald: {
      border: 'hover:border-emerald-200',
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    rose: {
      border: 'hover:border-red-200',
      iconBg: 'bg-red-50 text-red-600 border-red-100',
    },
    amber: {
      border: 'hover:border-amber-200',
      iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    cyan: {
      border: 'hover:border-blue-200',
      iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
    },
  };

  const scheme = colorMap[color] || colorMap.brand;

  return (
    <div
      className={`bg-white rounded-2xl p-5 border border-gray-100 shadow-sm transition-all duration-200 ${scheme.border} relative overflow-hidden group`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </span>
        <div className="flex items-center space-x-2">
          {badge && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gray-100 text-gray-700 border border-gray-200">
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

      <div className="text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight mb-1">
        {value}
      </div>

      {(subtitle || trend !== undefined) && (
        <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-gray-100">
          {trend !== undefined ? (
            <div className="flex items-center space-x-1">
              {trend > 0 ? (
                <span className="flex items-center font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                  <TrendingUp className="w-3 h-3 mr-0.5" />+{trend}%
                </span>
              ) : trend < 0 ? (
                <span className="flex items-center font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                  <TrendingDown className="w-3 h-3 mr-0.5" />{trend}%
                </span>
              ) : (
                <span className="flex items-center font-medium text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                  <Minus className="w-3 h-3 mr-0.5" /> 0%
                </span>
              )}
              {trendLabel && <span className="text-gray-400 ml-1">{trendLabel}</span>}
            </div>
          ) : (
            <span className="text-gray-400">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
