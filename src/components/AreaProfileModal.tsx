'use client';

import React from 'react';
import {
  X,
  FileSpreadsheet,
  FileText,
  Map as MapIcon,
  Download,
  Users,
  MapPin,
  Building2,
  Trophy,
  Maximize2,
} from 'lucide-react';
import {
  exportSingleAreaCsv,
  exportSingleAreaGeoJson,
  exportSingleAreaPdf,
} from '@/utils/exportUtils';
import { INDICATORS, INDICATOR_CATEGORIES } from '@/types/indicators';

interface AreaProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: any; // Full GeoJSON feature { properties, geometry }
  rank?: string;
  onDrillDown?: () => void;
  canDrillDown?: boolean;
}

export const AreaProfileModal: React.FC<AreaProfileModalProps> = ({
  isOpen,
  onClose,
  feature,
  rank,
  onDrillDown,
  canDrillDown,
}) => {
  if (!isOpen || !feature) return null;

  const p = feature.properties || {};
  const name = p.name || 'Administrative Unit';
  const level = p.level || 'Area';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-[#0f172a] border border-neutral-200 dark:border-[#3e3e3e] shadow-2xl text-neutral-900 dark:text-neutral-100 overflow-hidden transition-colors">
        {/* Header */}
        <div className="p-6 border-b border-neutral-200 dark:border-[#3e3e3e] bg-neutral-50 dark:bg-[#020617] flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/10 text-[#ef4444] border border-red-500/20">
                {level.toUpperCase()}
              </span>
              {p.code && (
                <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono font-medium">
                  Code: {p.code}
                </span>
              )}
              {rank && (
                <span className="flex items-center gap-1 text-[11px] font-bold text-amber-500 dark:text-amber-400">
                  <Trophy className="w-3.5 h-3.5" /> {rank}
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight">{name}</h2>
            {(p.county_name || p.subcounty_name) && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
                {p.subcounty_name ? `${p.subcounty_name} Sub-County, ` : ''}
                {p.county_name ? `${p.county_name} County` : ''}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OpenGIS Styled Export Action Bar (CSV, PDF Factsheet, GeoJSON) */}
        <div className="px-6 py-3.5 bg-neutral-100/70 dark:bg-[#1e2939]/70 border-b border-neutral-200 dark:border-[#3e3e3e] flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 uppercase tracking-wider">
            <Download className="w-4 h-4 text-[#ef4444]" /> Export Area Profile
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportSingleAreaCsv(feature)}
              className="btn btn-sm btn-outline-primary bg-white dark:bg-[#0f172a] shadow-sm"
              title="Download attributes as CSV spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>CSV</span>
            </button>

            <button
              onClick={() => exportSingleAreaPdf(feature)}
              className="btn btn-sm btn-primary shadow-sm"
              title="Download formatted PDF Factsheet"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF Factsheet</span>
            </button>

            <button
              onClick={() => exportSingleAreaGeoJson(feature)}
              className="btn btn-sm btn-outline-primary bg-white dark:bg-[#0f172a] shadow-sm"
              title="Download as GeoJSON with geometry"
            >
              <MapIcon className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>GeoJSON</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content: KPIs and Detailed Indicators */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#1e2939] border border-neutral-200 dark:border-[#3e3e3e] shadow-sm">
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#ef4444]" /> Population
              </span>
              <p className="text-lg font-black text-neutral-900 dark:text-white mt-1">
                {p.pop_total != null ? p.pop_total.toLocaleString() : 'N/A'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#1e2939] border border-neutral-200 dark:border-[#3e3e3e] shadow-sm">
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-500" /> Area
              </span>
              <p className="text-lg font-black text-neutral-900 dark:text-white mt-1">
                {p.area_sqkm != null ? `${p.area_sqkm.toLocaleString()} km²` : 'N/A'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#1e2939] border border-neutral-200 dark:border-[#3e3e3e] shadow-sm">
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-bold">
                Density
              </span>
              <p className="text-lg font-black text-neutral-900 dark:text-white mt-1">
                {p.pop_density != null ? `${p.pop_density.toLocaleString()} /km²` : 'N/A'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#1e2939] border border-neutral-200 dark:border-[#3e3e3e] shadow-sm">
              <span className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-bold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-500" /> Households
              </span>
              <p className="text-lg font-black text-neutral-900 dark:text-white mt-1">
                {p.households != null ? p.households.toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>

          {/* Categorized Indicators Table */}
          <div className="space-y-4">
            {INDICATOR_CATEGORIES.map((cat) => {
              const catInds = INDICATORS.filter(
                (ind) => ind.category === cat.id && p[ind.id] != null
              );
              if (catInds.length === 0) return null;

              return (
                <div key={cat.id} className="rounded-2xl border border-neutral-200 dark:border-[#3e3e3e] bg-neutral-50/50 dark:bg-[#1e2939]/50 overflow-hidden shadow-sm">
                  <div className="px-4 py-2.5 bg-neutral-100 dark:bg-[#1e2939] border-b border-neutral-200 dark:border-[#3e3e3e] text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                    {cat.label}
                  </div>
                  <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {catInds.map((ind) => {
                      const rawVal = p[ind.id];
                      return (
                        <div
                          key={ind.id}
                          className="px-4 py-3 flex items-center justify-between text-xs hover:bg-white dark:hover:bg-neutral-800/40 transition-colors"
                        >
                          <div>
                            <span className="font-semibold text-neutral-800 dark:text-neutral-200">{ind.name}</span>
                            <span className="text-[10px] text-neutral-400 dark:text-neutral-500 ml-2">
                              {ind.source} ({ind.year})
                            </span>
                          </div>
                          <span className="font-bold text-[#ef4444] dark:text-red-400 font-mono">
                            {ind.formatValue(rawVal)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-neutral-200 dark:border-[#3e3e3e] bg-neutral-50 dark:bg-[#020617] flex items-center justify-between gap-3">
          <div className="text-[11px] text-neutral-500 font-medium">
            Sources: KNBS Census 2019 / KDHS 2022 / KMHFL
          </div>

          <div className="flex items-center gap-2.5">
            {canDrillDown && onDrillDown && (
              <button
                onClick={() => {
                  onDrillDown();
                  onClose();
                }}
                className="btn btn-sm btn-primary"
              >
                <Maximize2 className="w-3.5 h-3.5" /> Drill Down Into {name}
              </button>
            )}

            <button
              onClick={onClose}
              className="btn btn-sm btn-outline-primary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
