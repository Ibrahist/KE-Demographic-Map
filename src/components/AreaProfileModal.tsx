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
  ExternalLink,
  ChevronRight,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {level.toUpperCase()}
              </span>
              {p.code && (
                <span className="text-xs text-slate-400 font-mono">
                  Code: {p.code}
                </span>
              )}
              {rank && (
                <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                  <Trophy className="w-3 h-3" /> {rank}
                </span>
              )}
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">{name}</h2>
            {(p.county_name || p.subcounty_name) && (
              <p className="text-xs text-slate-400 mt-0.5">
                {p.subcounty_name ? `${p.subcounty_name} Sub-County, ` : ''}
                {p.county_name ? `${p.county_name} County` : ''}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Export Action Bar (Key Requirement: CSV, PDF, GeoJSON) */}
        <div className="px-5 py-3.5 bg-slate-800/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Download className="w-3.5 h-3.5 text-emerald-400" /> Export Data For {name}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportSingleAreaCsv(feature)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-emerald-600 text-white text-xs font-semibold border border-slate-700 hover:border-emerald-500 transition-all shadow-md"
              title="Download as CSV spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400 group-hover:text-white" />
              CSV
            </button>

            <button
              onClick={() => exportSingleAreaPdf(feature)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-white text-xs font-semibold border border-slate-700 hover:border-red-500 transition-all shadow-md"
              title="Download as illustrated PDF Factsheet"
            >
              <FileText className="w-3.5 h-3.5 text-red-400" />
              PDF Factsheet
            </button>

            <button
              onClick={() => exportSingleAreaGeoJson(feature)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-cyan-600 text-white text-xs font-semibold border border-slate-700 hover:border-cyan-500 transition-all shadow-md"
              title="Download as standalone GeoJSON feature with geometry"
            >
              <MapIcon className="w-3.5 h-3.5 text-cyan-400" />
              GeoJSON
            </button>
          </div>
        </div>

        {/* Scrollable Content: KPIs and Detailed Indicators */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium flex items-center gap-1">
                <Users className="w-3 h-3 text-emerald-400" /> Population
              </span>
              <p className="text-base font-bold text-white mt-1">
                {p.pop_total != null ? p.pop_total.toLocaleString() : 'N/A'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400" /> Area
              </span>
              <p className="text-base font-bold text-white mt-1">
                {p.area_sqkm != null ? `${p.area_sqkm.toLocaleString()} km²` : 'N/A'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">
                Density
              </span>
              <p className="text-base font-bold text-white mt-1">
                {p.pop_density != null ? `${p.pop_density.toLocaleString()} /km²` : 'N/A'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium flex items-center gap-1">
                <Building2 className="w-3 h-3 text-amber-400" /> Households
              </span>
              <p className="text-base font-bold text-white mt-1">
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
                <div key={cat.id} className="rounded-xl border border-slate-800 bg-slate-950/50 overflow-hidden">
                  <div className="px-3.5 py-2 bg-slate-800/40 border-b border-slate-800/80 text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    {cat.label}
                  </div>
                  <div className="divide-y divide-slate-800/60">
                    {catInds.map((ind) => {
                      const rawVal = p[ind.id];
                      return (
                        <div
                          key={ind.id}
                          className="px-3.5 py-2.5 flex items-center justify-between text-xs hover:bg-slate-800/30 transition-colors"
                        >
                          <div>
                            <span className="font-medium text-slate-200">{ind.name}</span>
                            <span className="text-[10px] text-slate-500 ml-2">
                              {ind.source} ({ind.year})
                            </span>
                          </div>
                          <span className="font-bold text-emerald-400 font-mono">
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
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            Source: KNBS Census 2019 / KDHS 2022 / KMHFL
          </div>

          <div className="flex items-center gap-2">
            {canDrillDown && onDrillDown && (
              <button
                onClick={() => {
                  onDrillDown();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-950/40 transition-all"
              >
                <Maximize2 className="w-3.5 h-3.5" /> Drill Down Into {name}
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

