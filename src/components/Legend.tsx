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
      <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-3.5 shadow-2xl text-xs max-w-xs text-slate-200">
        <h4 className="font-semibold text-white mb-1.5 flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
          Populated Settlements & Villages
        </h4>
        <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
          Points denote cities, towns, villages, and hamlets mapped in OpenStreetMap & KNBS.
        </p>
        <div className="flex items-center gap-3 text-[10px] text-slate-400 pt-1 border-t border-slate-800">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" /> Town / City
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Village / Hamlet
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-3.5 shadow-2xl text-xs max-w-xs text-slate-200 select-none">
      <div className="flex items-start justify-between gap-2 mb-2 pb-1.5 border-b border-slate-800">
        <div>
          <h4 className="font-semibold text-white text-xs">{indicator.name}</h4>
          <span className="text-[10px] text-slate-400">{indicator.unit}</span>
        </div>
        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 text-[10px] border border-slate-700 font-mono">
          {indicator.year}
        </span>
      </div>

      {/* Class breaks swatches */}
      <div className="space-y-1 mb-3">
        {breaks.map((b, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-4 h-3.5 rounded border border-black/30 shrink-0 shadow-sm"
              style={{ backgroundColor: b.color }}
            />
            <span className="text-[11px] text-slate-300 font-mono">{b.label}</span>
          </div>
        ))}

        {/* Missing / No Data Item */}
        <div className="flex items-center gap-2 pt-1">
          <div className="w-4 h-3.5 rounded border border-dashed border-slate-600 bg-slate-800/80 shrink-0" />
          <span className="text-[11px] text-slate-400 italic">No data / Not applicable</span>
        </div>
      </div>

      {/* Citation footer */}
      <div className="text-[10px] text-slate-500 pt-1.5 border-t border-slate-800/80">
        Source: <span className="text-slate-400">{indicator.source}</span>
      </div>
    </div>
  );
};

