'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  FileDown,
  FileSpreadsheet,
  FileText,
  Map as MapIcon,
  Search,
  Users,
  MapPin,
  Building2,
  Check,
  Loader2,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  exportSingleAreaCsv,
  exportSingleAreaPdf,
  exportSingleAreaGeoJson,
} from '@/utils/exportUtils';
import {
  loadCountiesGeoJson,
  loadSubcountiesGeoJson,
  loadWardsGeoJson,
  loadVillagesGeoJson,
} from '@/utils/geojsonLoader';
import { AdminLevel } from '@/types/indicators';

interface ExportAreaModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFeature?: any | null;
  currentLevel?: AdminLevel;
  currentCountyCode?: number;
}

export const ExportAreaModal: React.FC<ExportAreaModalProps> = ({
  isOpen,
  onClose,
  currentFeature,
  currentLevel,
  currentCountyCode,
}) => {
  const [selectedLevel, setSelectedLevel] = useState<AdminLevel>('county');
  const [allCounties, setAllCounties] = useState<any[]>([]);
  const [allSubcounties, setAllSubcounties] = useState<any[]>([]);
  const [countyWards, setCountyWards] = useState<any[]>([]);
  const [countyVillages, setCountyVillages] = useState<any[]>([]);

  // Selection states
  const [selectedCountyCode, setSelectedCountyCode] = useState<number>(currentCountyCode || 47); // Default to Nairobi (47) or active
  const [selectedFeature, setSelectedFeature] = useState<any | null>(currentFeature || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingLayer, setLoadingLayer] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  // 1. Initial load of counties and subcounties
  useEffect(() => {
    async function loadInitial() {
      try {
        const countiesData = await loadCountiesGeoJson();
        const subcountiesData = await loadSubcountiesGeoJson();
        setAllCounties(countiesData?.features || []);
        setAllSubcounties(subcountiesData?.features || []);

        if (currentFeature) {
          setSelectedFeature(currentFeature);
          if (currentFeature.properties?.level) {
            setSelectedLevel(currentFeature.properties.level.toLowerCase() as AdminLevel);
          }
          if (currentFeature.properties?.county_code) {
            setSelectedCountyCode(currentFeature.properties.county_code);
          }
        } else if (countiesData?.features?.length > 0) {
          // Default to Nairobi County (47) or first county
          const nairobi = countiesData.features.find((f: any) => f.properties?.code === 47);
          setSelectedFeature(nairobi || countiesData.features[0]);
        }
      } catch (err) {
        console.error('Error loading initial export data:', err);
      }
    }
    if (isOpen) {
      loadInitial();
    }
  }, [isOpen, currentFeature]);

  // 2. Load Wards or Villages when level or county changes
  useEffect(() => {
    async function loadCountySubdivisions() {
      if (!selectedCountyCode) return;
      if (selectedLevel === 'ward') {
        setLoadingLayer(true);
        try {
          const wards = await loadWardsGeoJson(selectedCountyCode);
          setCountyWards(wards?.features || []);
          if (wards?.features?.length > 0 && selectedFeature?.properties?.level !== 'Ward') {
            setSelectedFeature(wards.features[0]);
          }
        } catch (err) {
          console.error('Error loading wards for export:', err);
        } finally {
          setLoadingLayer(false);
        }
      } else if (selectedLevel === 'village') {
        setLoadingLayer(true);
        try {
          const villages = await loadVillagesGeoJson(selectedCountyCode);
          setCountyVillages(villages?.features || []);
          if (villages?.features?.length > 0 && selectedFeature?.properties?.level !== 'Village') {
            setSelectedFeature(villages.features[0]);
          }
        } catch (err) {
          console.error('Error loading villages for export:', err);
        } finally {
          setLoadingLayer(false);
        }
      }
    }

    if (isOpen && (selectedLevel === 'ward' || selectedLevel === 'village')) {
      loadCountySubdivisions();
    }
  }, [selectedLevel, selectedCountyCode, isOpen]);

  // Current active features available for selection
  const availableFeatures = useMemo(() => {
    if (selectedLevel === 'county') {
      return allCounties;
    } else if (selectedLevel === 'subcounty') {
      return allSubcounties.filter((f) => !selectedCountyCode || f.properties?.county_code === selectedCountyCode);
    } else if (selectedLevel === 'ward') {
      return countyWards;
    } else if (selectedLevel === 'village') {
      return countyVillages;
    }
    return [];
  }, [selectedLevel, allCounties, allSubcounties, countyWards, countyVillages, selectedCountyCode]);

  // Filtered search list
  const filteredList = useMemo(() => {
    if (!searchQuery.trim()) return availableFeatures.slice(0, 50);
    const q = searchQuery.toLowerCase().trim();
    return availableFeatures
      .filter((f) => {
        const name = (f.properties?.name || '').toLowerCase();
        const pCounty = (f.properties?.county_name || '').toLowerCase();
        const pSub = (f.properties?.subcounty_name || '').toLowerCase();
        return name.includes(q) || pCounty.includes(q) || pSub.includes(q);
      })
      .slice(0, 50);
  }, [availableFeatures, searchQuery]);

  // Switch level handler
  const handleSelectLevel = (lvl: AdminLevel) => {
    setSelectedLevel(lvl);
    setSearchQuery('');
    if (lvl === 'county' && allCounties.length > 0) {
      const match = allCounties.find((c) => c.properties?.code === selectedCountyCode) || allCounties[0];
      setSelectedFeature(match);
    } else if (lvl === 'subcounty' && allSubcounties.length > 0) {
      const filtered = allSubcounties.filter((sc) => sc.properties?.county_code === selectedCountyCode);
      setSelectedFeature(filtered[0] || allSubcounties[0]);
    }
  };

  // Export handlers with notification feedback
  const handleExport = (type: 'csv' | 'pdf' | 'geojson') => {
    if (!selectedFeature) return;
    try {
      if (type === 'csv') {
        exportSingleAreaCsv(selectedFeature);
        setDownloadSuccess('CSV Downloaded!');
      } else if (type === 'pdf') {
        exportSingleAreaPdf(selectedFeature);
        setDownloadSuccess('PDF Factsheet Generated!');
      } else if (type === 'geojson') {
        exportSingleAreaGeoJson(selectedFeature);
        setDownloadSuccess('GeoJSON Downloaded!');
      }
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  if (!isOpen) return null;

  const p = selectedFeature?.properties || {};
  const areaName = p.name || 'Selected Area';
  const areaLevel = p.level || selectedLevel.toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl bg-white dark:bg-[#0f172a] border border-neutral-200 dark:border-[#3e3e3e] shadow-2xl text-neutral-900 dark:text-neutral-100 overflow-hidden transition-colors">
        {/* Header */}
        <div className="p-5 md:p-6 border-b border-neutral-200 dark:border-[#3e3e3e] bg-neutral-50 dark:bg-[#020617] flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 border border-red-500/20 text-[#ef4444] flex items-center justify-center shadow-md shadow-red-500/10">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">
                  Export Individual Area Data
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-[#ef4444] border border-red-500/20">
                  CSV • PDF • GeoJSON
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Download demographic indicators, census stats, and geometries for any County, Sub-County, Ward, or Village.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Switcher Tabs */}
        <div className="px-6 pt-4 pb-2 bg-white dark:bg-[#0f172a] border-b border-neutral-200 dark:border-[#3e3e3e]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#ef4444]" /> Select Administrative Level:
            </span>
            {currentFeature && (
              <button
                onClick={() => {
                  setSelectedFeature(currentFeature);
                  if (currentFeature.properties?.level) {
                    setSelectedLevel(currentFeature.properties.level.toLowerCase() as AdminLevel);
                  }
                }}
                className="text-[11px] font-semibold text-[#ef4444] hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" /> Use Active Map Selection ({currentFeature.properties?.name})
              </button>
            )}
          </div>

          <div className="grid grid-cols-4 gap-1.5 p-1 bg-neutral-100 dark:bg-[#1e2939] rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs">
            {(
              [
                { id: 'county', label: 'County', count: '47' },
                { id: 'subcounty', label: 'Sub-County', count: '290' },
                { id: 'ward', label: 'Ward', count: '1,450' },
                { id: 'village', label: 'Village', count: 'Points' },
              ] as const
            ).map((lvl) => {
              const isActive = selectedLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => handleSelectLevel(lvl.id)}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isActive
                      ? 'bg-[#ef4444] text-white shadow-md shadow-red-500/25'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800'
                  }`}
                >
                  <span>{lvl.label}</span>
                  <span className={`text-[10px] font-normal ${isActive ? 'text-red-100' : 'text-neutral-400'}`}>
                    ({lvl.count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Body: Area Selection & Preview */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Step 1: Area Picker & Search */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              {/* County Scope Dropdown if Subcounty, Ward or Village */}
              {selectedLevel !== 'county' && (
                <div className="sm:w-1/3 relative">
                  <select
                    value={selectedCountyCode}
                    onChange={(e) => {
                      const cCode = parseInt(e.target.value, 10);
                      setSelectedCountyCode(cCode);
                    }}
                    className="w-full pl-3 pr-8 py-2 rounded-xl bg-neutral-50 dark:bg-[#1e2939] border border-neutral-200 dark:border-[#3e3e3e] text-xs font-semibold text-neutral-800 dark:text-neutral-100 focus:outline-none focus:border-[#ef4444] appearance-none cursor-pointer"
                  >
                    {allCounties.map((c) => (
                      <option key={c.properties?.code} value={c.properties?.code}>
                        {c.properties?.name} County
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                </div>
              )}

              {/* Search Autocomplete Filter */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${selectedLevel} by name...`}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-50 dark:bg-[#1e2939] border border-neutral-200 dark:border-[#3e3e3e] text-xs font-medium text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:border-[#ef4444] focus:ring-2 focus:ring-red-500/20"
                />
              </div>
            </div>

            {/* Quick List of Matches */}
            <div className="border border-neutral-200 dark:border-[#3e3e3e] rounded-2xl bg-neutral-50/50 dark:bg-[#1e2939]/30 p-2 max-h-36 overflow-y-auto">
              {loadingLayer ? (
                <div className="py-6 flex items-center justify-center gap-2 text-xs text-neutral-500">
                  <Loader2 className="w-4 h-4 animate-spin text-[#ef4444]" />
                  <span>Loading {selectedLevel} layer...</span>
                </div>
              ) : filteredList.length === 0 ? (
                <div className="py-4 text-center text-xs text-neutral-400">
                  No matching {selectedLevel}s found. Try another search.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {filteredList.map((f: any, idx: number) => {
                    const isSelected = selectedFeature?.properties?.name === f.properties?.name;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedFeature(f)}
                        className={`px-3 py-2 text-left rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-[#ef4444] text-white shadow-sm'
                            : 'bg-white dark:bg-[#1e2939] text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-700/60'
                        }`}
                      >
                        <span className="truncate">{f.properties?.name || 'Unit'}</span>
                        {f.properties?.pop_total && (
                          <span className={`text-[10px] ml-1 font-mono shrink-0 ${isSelected ? 'text-red-100' : 'text-neutral-400'}`}>
                            {f.properties.pop_total.toLocaleString()}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Selected Area Profile Preview */}
          {selectedFeature && (
            <div className="card p-4 bg-white dark:bg-[#1e2939] rounded-2xl border border-neutral-200 dark:border-[#3e3e3e] shadow-sm space-y-3">
              <div className="flex items-start justify-between gap-3 pb-2 border-b border-neutral-200 dark:border-neutral-700/60">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500/10 text-[#ef4444] border border-red-500/20">
                      {areaLevel}
                    </span>
                    {p.code && (
                      <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                        Code: {p.code}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-neutral-900 dark:text-white tracking-tight">
                    {areaName}
                  </h3>
                  {(p.county_name || p.subcounty_name) && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {p.subcounty_name ? `${p.subcounty_name} Sub-County, ` : ''}
                      {p.county_name ? `${p.county_name} County` : ''}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-bold">
                    Geometry
                  </span>
                  <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    {selectedFeature.geometry?.type || 'Vector Feature'}
                  </span>
                </div>
              </div>

              {/* KPI Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#ef4444]" /> Population
                  </span>
                  <p className="font-extrabold text-neutral-900 dark:text-white mt-0.5">
                    {p.pop_total != null ? p.pop_total.toLocaleString() : 'N/A'}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-500" /> Area
                  </span>
                  <p className="font-extrabold text-neutral-900 dark:text-white mt-0.5">
                    {p.area_sqkm != null ? `${p.area_sqkm.toLocaleString()} km²` : 'N/A'}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold">
                    Density
                  </span>
                  <p className="font-extrabold text-neutral-900 dark:text-white mt-0.5">
                    {p.pop_density != null ? `${p.pop_density.toLocaleString()} /km²` : 'N/A'}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-bold flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-amber-500" /> Households
                  </span>
                  <p className="font-extrabold text-neutral-900 dark:text-white mt-0.5">
                    {p.households != null ? p.households.toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Export Format Action Cards (CSV, PDF, GeoJSON) */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider block">
              Choose Export Format:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* CSV Export Option */}
              <button
                onClick={() => handleExport('csv')}
                className="card p-4 bg-white dark:bg-[#1e2939] hover:border-[#ef4444] rounded-2xl border border-neutral-200 dark:border-[#3e3e3e] text-left transition-all group shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-1">
                    Export as CSV
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug">
                    Full spreadsheet table with all demographic indicators, health, and education stats.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                  <span>Download .csv</span>
                  <span>→</span>
                </div>
              </button>

              {/* PDF Factsheet Export Option */}
              <button
                onClick={() => handleExport('pdf')}
                className="card p-4 bg-white dark:bg-[#1e2939] hover:border-[#ef4444] rounded-2xl border border-neutral-200 dark:border-[#3e3e3e] text-left transition-all group shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 text-[#ef4444] flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-1">
                    PDF Factsheet
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug">
                    Illustrated, print-ready document with Kenya colors banner, KPI cards, and categorized tables.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] font-bold text-[#ef4444] flex items-center justify-between">
                  <span>Download .pdf</span>
                  <span>→</span>
                </div>
              </button>

              {/* GeoJSON Export Option */}
              <button
                onClick={() => handleExport('geojson')}
                className="card p-4 bg-white dark:bg-[#1e2939] hover:border-[#ef4444] rounded-2xl border border-neutral-200 dark:border-[#3e3e3e] text-left transition-all group shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform">
                    <MapIcon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-white mb-1">
                    Export as GeoJSON
                  </h4>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-snug">
                    Standard GIS vector geometry with boundary coordinates and properties for QGIS or ArcGIS.
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 flex items-center justify-between">
                  <span>Download .geojson</span>
                  <span>→</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 md:p-5 border-t border-neutral-200 dark:border-[#3e3e3e] bg-neutral-50 dark:bg-[#020617] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {downloadSuccess ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-500/30 animate-in fade-in">
                <Check className="w-4 h-4" /> {downloadSuccess}
              </span>
            ) : (
              <span className="text-[11px] text-neutral-400 font-medium">
                Official Sources: KNBS Census 2019 / KDHS 2022 / KMHFL / OSM
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="btn btn-sm btn-outline-primary"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

