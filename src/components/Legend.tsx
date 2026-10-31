'use client';

import React from 'react';
import { LegendBreak } from '@/types/map';
import { IndicatorDefinition } from '@/types/indicators';

interface LegendProps {
  breaks: LegendBreak[];
  indicator: IndicatorDefinition;
  activeLevel: string;
}

export const Legend: React.FC<LegendProps> = ({ breaks, indicator, activeLevel }) => {
  if (activeLevel === 'village') {
    return (
      <div className="card bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur border border-neutral-200 dark:border-[#3e3e3e] rounded-2xl p-4 shadow-xl text-xs max-w-xs text-neutral-800 dark:text-neutral-200 transition-colors">
        <h4 className="font-bold text-neutral-900 dark:text-white mb-1.5 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] inline-block shadow-sm" />
          Populated Settlements & Villages
        </h4>
        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed mb-2.5">
          Points denote cities, towns, villages, and hamlets mapped from OpenStreetMap and KNBS.
        </p>
        <div className="flex items-center gap-3 text-[10px] text-neutral-600 dark:text-neutral-400 pt-2 border-t border-neutral-200 dark:border-[#3e3e3e]">
          <span className="flex items-center gap-1.5 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-sm" /> Town / City
          </span>
          <span className="flex items-center gap-1.5 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-sm" /> Village / Hamlet
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur border border-neutral-200 dark:border-[#3e3e3e] rounded-2xl p-4 shadow-xl text-xs max-w-xs text-neutral-800 dark:text-neutral-200 select-none transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2.5 pb-2 border-b border-neutral-200 dark:border-[#3e3e3e]">
        <div>
          <h4 className="font-bold text-neutral-900 dark:text-white text-xs tracking-tight">{indicator.name}</h4>
          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium">{indicator.unit}</span>
        </div>
        <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-[#ef4444] text-[10px] border border-red-500/20 font-bold font-mono">
          {indicator.year}
        </span>
      </div>

      {/* Class breaks swatches */}
      <div className="space-y-1.5 mb-3">
        {breaks.map((b, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div
              className="w-4 h-3.5 rounded-md border border-neutral-300 dark:border-black/40 shrink-0 shadow-sm"
              style={{ backgroundColor: b.color }}
            />
            <span className="text-[11px] text-neutral-700 dark:text-neutral-300 font-mono font-medium">{b.label}</span>
          </div>
        ))}

        {/* Missing / No Data Item */}
        <div className="flex items-center gap-2.5 pt-1">
          <div className="w-4 h-3.5 rounded-md border border-dashed border-neutral-400 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 shrink-0" />
          <span className="text-[11px] text-neutral-400 dark:text-neutral-500 italic">No data / Not applicable</span>
        </div>
      </div>

      {/* Citation footer */}
      <div className="text-[10px] text-neutral-400 dark:text-neutral-500 pt-2 border-t border-neutral-200 dark:border-[#3e3e3e]">
        Source: <span className="text-neutral-600 dark:text-neutral-400 font-medium">{indicator.source}</span>
      </div>
    </div>
  );
};
