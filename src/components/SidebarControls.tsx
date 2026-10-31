'use client';

import React from 'react';
import {
  Layers,
  BarChart3,
  Palette,
  Eye,
  MapPin,
  Info,
  Sliders,
  ChevronDown,
} from 'lucide-react';
import {
  AdminLevel,
  IndicatorDefinition,
  INDICATORS,
  INDICATOR_CATEGORIES,
} from '@/types/indicators';
import { ColorScaleType, ColorPalette, COLOR_PALETTES } from '@/types/map';

interface SidebarControlsProps {
  activeLevel: AdminLevel;
  onChangeLevel: (lvl: AdminLevel) => void;
  activeIndicator: IndicatorDefinition;
  onChangeIndicator: (ind: IndicatorDefinition) => void;
  scaleType: ColorScaleType;
  onChangeScaleType: (st: ColorScaleType) => void;
  activePalette: ColorPalette;
  onChangePalette: (pal: ColorPalette) => void;
  opacity: number;
  onChangeOpacity: (op: number) => void;
  mapType: 'dark' | 'light' | 'satellite' | 'terrain';
  onChangeMapType: (mt: 'dark' | 'light' | 'satellite' | 'terrain') => void;
  selectedCountyName?: string;
  totalFeaturesCount: number;
}

export const SidebarControls: React.FC<SidebarControlsProps> = ({
  activeLevel,
  onChangeLevel,
  activeIndicator,
  onChangeIndicator,
  scaleType,
  onChangeScaleType,
  activePalette,
  onChangePalette,
  opacity,
  onChangeOpacity,
  mapType,
  onChangeMapType,
  selectedCountyName,
  totalFeaturesCount,
}) => {
  return (
    <aside className="w-80 md:w-96 bg-slate-900 border-r border-slate-800 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto text-slate-200 select-none shadow-xl z-20">
      {/* 1. Administrative Level Selector */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center justify-between mb-2.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            Administrative Hierarchy
          </label>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            {totalFeaturesCount} Units
          </span>
        </div>

        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
          {(
            [
              { id: 'county', label: 'County', count: '47' },
              { id: 'subcounty', label: 'Sub-County', count: '290' },
              { id: 'ward', label: 'Ward', count: '1,450' },
              { id: 'village', label: 'Village', count: 'Points' },
            ] as const
          ).map((lvl) => {
            const isActive = activeLevel === lvl.id;
            return (
              <button
                key={lvl.id}
                onClick={() => onChangeLevel(lvl.id)}
                className={`flex flex-col items-center justify-center py-2 px-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{lvl.label}</span>
                <span className={`text-[10px] ${isActive ? 'text-emerald-100' : 'text-slate-500'}`}>
                  {lvl.count}
                </span>
              </button>
            );
          })}
        </div>

        {selectedCountyName && activeLevel !== 'county' && (
          <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-700/30 text-[11px] text-emerald-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span>Scoped to: <strong>{selectedCountyName}</strong></span>
          </div>
        )}
      </div>

      {/* 2. Demographic Indicator Selector */}
      <div className="p-4 border-b border-slate-800/80 flex-1">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider mb-2.5">
          <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
          Demographic Indicator
        </label>

        {activeLevel === 'village' ? (
          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/60 text-xs text-slate-300 space-y-1.5">
            <p className="font-semibold text-amber-300 flex items-center gap-1.5">
              <Info className="w-4 h-4 shrink-0" /> Point Locations
            </p>
            <p className="text-[11px] text-slate-400">
              Villages and settlements represent populated place point coordinates (OSM/GeoNames). Choropleth polygons are available at County, Sub-County, and Ward levels.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <select
                value={activeIndicator.id}
                onChange={(e) => {
                  const found = INDICATORS.find((i) => i.id === e.target.value);
                  if (found) onChangeIndicator(found);
                }}
                className="w-full pl-3 pr-8 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer appearance-none font-medium"
              >
                {INDICATOR_CATEGORIES.map((cat) => {
                  const catIndicators = INDICATORS.filter((ind) => ind.category === cat.id);
                  return (
                    <optgroup key={cat.id} label={`-- ${cat.label} --`}>
                      {catIndicators.map((ind) => {
                        const isAvail = ind.availableLevels.includes(activeLevel);
                        return (
                          <option
                            key={ind.id}
                            value={ind.id}
                            disabled={!isAvail}
                            className={isAvail ? 'text-white' : 'text-slate-500 bg-slate-900'}
                          >
                            {ind.name} {!isAvail ? '(Not available at this level)' : ''}
                          </option>
                        );
                      })}
                    </optgroup>
                  );
                })}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            {/* Indicator Details Card */}
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-1.5">
                <span>Unit: <strong className="text-slate-200">{activeIndicator.unit}</strong></span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                  {activeIndicator.year}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {activeIndicator.description}
              </p>
              <div className="text-[10px] text-slate-500 pt-0.5">
                Source: {activeIndicator.source}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Choropleth Map Styling & Colour Scales */}
      <div className="p-4 border-b border-slate-800/80 space-y-4">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <Palette className="w-3.5 h-3.5 text-amber-400" />
          Colour Palette & Scale
        </label>

        {/* Palette Selector */}
        <div>
          <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">Palette</span>
          <div className="grid grid-cols-2 gap-1.5">
            {COLOR_PALETTES.map((pal) => {
              const isSelected = activePalette.id === pal.id;
              return (
                <button
                  key={pal.id}
                  onClick={() => onChangePalette(pal)}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-slate-800 shadow-md'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div className="flex h-2.5 rounded overflow-hidden mb-1">
                    {pal.colors.map((c, i) => (
                      <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-300 block truncate">{pal.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Classification Method */}
        <div>
          <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">Class Breaks</span>
          <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
            {(
              [
                { id: 'quantile', label: 'Quantile' },
                { id: 'natural_breaks', label: 'Jenks' },
                { id: 'linear', label: 'Linear' },
              ] as const
            ).map((st) => (
              <button
                key={st.id}
                onClick={() => onChangeScaleType(st.id)}
                className={`py-1.5 px-2 rounded-md font-medium text-[11px] transition-colors ${
                  scaleType === st.id
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Opacity Slider */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
            <span className="flex items-center gap-1 font-medium">
              <Eye className="w-3.5 h-3.5" /> Polygon Opacity
            </span>
            <span className="font-mono text-emerald-400">{Math.round(opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.05"
            value={opacity}
            onChange={(e) => onChangeOpacity(parseFloat(e.target.value))}
            className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* 4. Base Map Style */}
      <div className="p-4 space-y-2">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider mb-1.5">
          <Sliders className="w-3.5 h-3.5 text-purple-400" />
          Base Map Layer
        </label>
        <div className="grid grid-cols-2 gap-1.5 text-xs">
          {(
            [
              { id: 'dark', label: 'Dark Mode' },
              { id: 'light', label: 'Light Mode' },
              { id: 'satellite', label: 'Satellite' },
              { id: 'terrain', label: 'Terrain' },
            ] as const
          ).map((b) => (
            <button
              key={b.id}
              onClick={() => onChangeMapType(b.id)}
              className={`py-1.5 px-2.5 rounded-lg border text-left text-xs transition-colors ${
                mapType === b.id
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300 font-semibold'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};

