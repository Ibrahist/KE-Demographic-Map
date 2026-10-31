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
    left: Math.min(data.x + 16, typeof window !== 'undefined' ? window.innerWidth - 280 : 800),
    top: Math.max(data.y - 40, 70),
  };

  return (
    <div
      style={style}
      className="fixed z-40 pointer-events-none w-64 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700/80 shadow-2xl p-3 text-slate-200 text-xs transition-opacity duration-150 animate-in fade-in"
    >
      {/* Header: Name & Level */}
      <div className="flex items-start justify-between gap-1.5 mb-1.5 pb-1 border-b border-slate-800">
        <div>
          <h3 className="font-bold text-white text-sm tracking-tight">{data.name}</h3>
          {(data.parentCounty || data.parentSubcounty) && (
            <p className="text-[10px] text-slate-400">
              {data.parentSubcounty ? `${data.parentSubcounty}, ` : ''}
              {data.parentCounty ? `${data.parentCounty} County` : ''}
            </p>
          )}
        </div>
        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
          {data.level}
        </span>
      </div>

      {/* Main Indicator Metric */}
      <div className="my-2 p-2 rounded-lg bg-slate-950/70 border border-slate-800">
        <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
          {data.indicatorName}
        </span>
        <div className="flex items-baseline justify-between gap-2 mt-0.5">
          <span className="text-base font-extrabold text-white">
            {data.isAvailable ? data.valueStr : 'Data Not Available'}
          </span>
          {data.rank && data.isAvailable && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
              <Trophy className="w-3 h-3" /> {data.rank}
            </span>
          )}
        </div>
      </div>

      {/* General Stats */}
      <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-400 pt-1 border-t border-slate-800">
        {data.popTotal != null && (
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-slate-500" />
            <span>{data.popTotal.toLocaleString()}</span>
          </div>
        )}
        {data.areaSqKm != null && (
          <div className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-500" />
            <span>{data.areaSqKm.toLocaleString()} km²</span>
          </div>
        )}
      </div>

      {/* Drill-down and export hint */}
      <div className="mt-2 text-[10px] text-emerald-400 font-medium flex items-center gap-1">
        <Maximize2 className="w-2.5 h-2.5" /> Click unit to view profile & export (CSV, PDF, GeoJSON)
      </div>
    </div>
  );
};

