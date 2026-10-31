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
    <aside className="w-80 md:w-96 bg-white dark:bg-[#0f172a] border-r border-[#eaeaea] dark:border-[#3e3e3e] flex flex-col h-[calc(100vh-4rem)] overflow-y-auto text-neutral-800 dark:text-neutral-200 select-none shadow-lg z-20 transition-colors">
      {/* 1. Administrative Level Selector */}
      <div className="p-4 border-b border-[#eaeaea] dark:border-[#3e3e3e]">
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 uppercase tracking-wider">
            <Layers className="w-4 h-4 text-[#ef4444]" />
            Administrative Level
          </label>
          <span className="text-[11px] font-bold text-[#ef4444] bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">
            {totalFeaturesCount} Units
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 dark:bg-[#1e2939] rounded-xl border border-neutral-200 dark:border-neutral-800">
          {(
            [
              { id: 'county', label: 'County', count: '47 Units' },
              { id: 'subcounty', label: 'Sub-County', count: '290 Units' },
              { id: 'ward', label: 'Ward', count: '1,450 Units' },
              { id: 'village', label: 'Village', count: 'Point Data' },
            ] as const
          ).map((lvl) => {
            const isActive = activeLevel === lvl.id;
            return (
              <button
                key={lvl.id}
                onClick={() => onChangeLevel(lvl.id)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#ef4444] text-white shadow-md shadow-red-500/25'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
                }`}
              >
                <span>{lvl.label}</span>
                <span className={`text-[10px] font-normal ${isActive ? 'text-red-100' : 'text-neutral-500'}`}>
                  {lvl.count}
                </span>
              </button>
            );
          })}
        </div>

        {selectedCountyName && activeLevel !== 'county' && (
          <div className="mt-3 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-red-700 dark:text-red-300 flex items-center gap-2 font-medium">
            <MapPin className="w-4 h-4 text-[#ef4444] shrink-0" />
            <span>Scoped to: <strong>{selectedCountyName}</strong></span>
          </div>
        )}
      </div>

      {/* 2. Demographic Indicator Selector */}
      <div className="p-4 border-b border-[#eaeaea] dark:border-[#3e3e3e] flex-1">
        <label className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 uppercase tracking-wider mb-3">
          <BarChart3 className="w-4 h-4 text-[#ef4444]" />
          Demographic Indicator
        </label>

        {activeLevel === 'village' ? (
          <div className="p-4 bg-neutral-50 dark:bg-[#1e2939] rounded-xl border border-neutral-200 dark:border-[#3e3e3e] text-xs text-neutral-700 dark:text-neutral-300 space-y-2">
            <p className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Info className="w-4 h-4 shrink-0" /> Populated Settlements
            </p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Villages, towns, and hamlets represent populated place point coordinates (OSM/GeoNames). Interactive choropleth polygons are visualized at County, Sub-County, and Ward levels.
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
                className="w-full pl-3.5 pr-8 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#1e2939] border border-neutral-200 dark:border-[#3e3e3e] text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-[#ef4444] focus:ring-2 focus:ring-red-500/20 cursor-pointer appearance-none font-semibold transition-all"
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
                            className={isAvail ? 'text-neutral-900 dark:text-white font-medium' : 'text-neutral-400 dark:text-neutral-600'}
                          >
                            {ind.name} {!isAvail ? '(Not available at this level)' : ''}
                          </option>
                        );
                      })}
                    </optgroup>
                  );
                })}
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            </div>

            {/* Indicator Details Card */}
            <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#1e2939] border border-neutral-200 dark:border-[#3e3e3e] text-xs space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400 border-b border-neutral-200 dark:border-neutral-700/60 pb-2">
                <span>Unit: <strong className="text-neutral-800 dark:text-neutral-200">{activeIndicator.unit}</strong></span>
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-neutral-800 text-[#ef4444] font-bold text-[10px] border border-neutral-200 dark:border-neutral-700">
                  {activeIndicator.year}
                </span>
              </div>
              <p className="text-[11px] text-neutral-600 dark:text-neutral-300 leading-relaxed font-normal">
                {activeIndicator.description}
              </p>
              <div className="text-[10px] text-neutral-400 dark:text-neutral-500 pt-1 font-medium">
                Source: {activeIndicator.source}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Choropleth Map Styling & Colour Scales */}
      <div className="p-4 border-b border-[#eaeaea] dark:border-[#3e3e3e] space-y-4">
        <label className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 uppercase tracking-wider">
          <Palette className="w-4 h-4 text-[#ef4444]" />
          Colour Palette & Scale
        </label>

        {/* Palette Selector */}
        <div>
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mb-1.5 font-semibold">
            Palette Style
          </span>
          <div className="grid grid-cols-2 gap-2">
            {COLOR_PALETTES.map((pal) => {
              const isSelected = activePalette.id === pal.id;
              return (
                <button
                  key={pal.id}
                  onClick={() => onChangePalette(pal)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-[#ef4444] bg-red-50/50 dark:bg-red-950/20 shadow-sm'
                      : 'border-neutral-200 dark:border-[#3e3e3e] bg-white dark:bg-[#1e2939] hover:border-neutral-300 dark:hover:border-neutral-600'
                  }`}
                >
                  <div className="flex h-3 rounded-md overflow-hidden mb-1.5 shadow-inner">
                    {pal.colors.map((c, i) => (
                      <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <span className="text-[10px] text-neutral-700 dark:text-neutral-300 font-semibold block truncate">
                    {pal.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Classification Method */}
        <div>
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mb-1.5 font-semibold">
            Class Breaks
          </span>
          <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-100 dark:bg-[#1e2939] rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs">
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
                className={`py-1.5 px-2 rounded-lg font-semibold text-[11px] transition-all ${
                  scaleType === st.id
                    ? 'bg-[#ef4444] text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Opacity Slider */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 mb-1.5">
            <span className="flex items-center gap-1 font-semibold">
              <Eye className="w-3.5 h-3.5 text-[#ef4444]" /> Polygon Opacity
            </span>
            <span className="font-mono font-bold text-[#ef4444]">{Math.round(opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.05"
            value={opacity}
            onChange={(e) => onChangeOpacity(parseFloat(e.target.value))}
            className="w-full accent-[#ef4444] h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>
      </div>

      {/* 4. Base Map Style */}
      <div className="p-4 space-y-2">
        <label className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 uppercase tracking-wider mb-2">
          <Sliders className="w-4 h-4 text-[#ef4444]" />
          Base Map Style
        </label>
        <div className="grid grid-cols-2 gap-2 text-xs">
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
              className={`py-2 px-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                mapType === b.id
                  ? 'border-[#ef4444] bg-red-500/10 text-[#ef4444]'
                  : 'border-neutral-200 dark:border-[#3e3e3e] bg-white dark:bg-[#1e2939] text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-700'
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
