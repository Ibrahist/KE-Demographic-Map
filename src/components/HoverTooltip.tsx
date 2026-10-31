'use client';

import React from 'react';
import { UnitTooltipData } from '@/types/map';
import { Trophy, Users, MapPin, Maximize2 } from 'lucide-react';

interface HoverTooltipProps {
  data: UnitTooltipData | null;
}

export const HoverTooltip: React.FC<HoverTooltipProps> = ({ data }) => {
  if (!data) return null;

  // Offset slightly from cursor and avoid viewport edge
  const style: React.CSSProperties = {
    left: Math.min(data.x + 16, typeof window !== 'undefined' ? window.innerWidth - 290 : 800),
    top: Math.max(data.y - 40, 70),
  };

  return (
    <div
      style={style}
      className="fixed z-40 pointer-events-none w-68 rounded-2xl bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border border-neutral-200 dark:border-[#3e3e3e] shadow-2xl p-4 text-neutral-800 dark:text-neutral-200 text-xs transition-opacity duration-150 animate-in fade-in select-none"
    >
      {/* Header: Name & Level */}
      <div className="flex items-start justify-between gap-2 mb-2 pb-1.5 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h3 className="font-extrabold text-neutral-900 dark:text-white text-sm tracking-tight">{data.name}</h3>
          {(data.parentCounty || data.parentSubcounty) && (
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
              {data.parentSubcounty ? `${data.parentSubcounty}, ` : ''}
              {data.parentCounty ? `${data.parentCounty} County` : ''}
            </p>
          )}
        </div>
        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-500/10 text-[#ef4444] border border-red-500/20 shrink-0">
          {data.level}
        </span>
      </div>

      {/* Main Indicator Metric */}
      <div className="my-2.5 p-2.5 rounded-xl bg-neutral-50 dark:bg-[#1e2939] border border-neutral-200 dark:border-[#3e3e3e]">
        <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider block font-bold">
          {data.indicatorName}
        </span>
        <div className="flex items-baseline justify-between gap-2 mt-1">
          <span className="text-base font-extrabold text-[#ef4444] dark:text-red-400">
            {data.isAvailable ? data.valueStr : 'Data Not Available'}
          </span>
          {data.rank && data.isAvailable && (
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500 dark:text-amber-400">
              <Trophy className="w-3.5 h-3.5" /> {data.rank}
            </span>
          )}
        </div>
      </div>

      {/* General Stats */}
      <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-600 dark:text-neutral-400 pt-1 border-t border-neutral-200 dark:border-neutral-800">
        {data.popTotal != null && (
          <div className="flex items-center gap-1.5 font-medium">
            <Users className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
            <span>{data.popTotal.toLocaleString()}</span>
          </div>
        )}
        {data.areaSqKm != null && (
          <div className="flex items-center gap-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500" />
            <span>{data.areaSqKm.toLocaleString()} km²</span>
          </div>
        )}
      </div>

      {/* Drill-down and export hint */}
      <div className="mt-2.5 text-[10px] text-[#ef4444] font-semibold flex items-center gap-1">
        <Maximize2 className="w-3 h-3" /> Click unit to view profile & export (CSV, PDF, GeoJSON)
      </div>
    </div>
  );
};
