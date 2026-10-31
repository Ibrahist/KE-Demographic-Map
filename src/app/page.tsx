'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TopNav } from '@/components/TopNav';
import { SidebarControls } from '@/components/SidebarControls';
import { MapContainer } from '@/components/MapContainer';
import { Legend } from '@/components/Legend';
import { HoverTooltip } from '@/components/HoverTooltip';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { AreaProfileModal } from '@/components/AreaProfileModal';
import { ExportAreaModal } from '@/components/ExportAreaModal';
import { AdminLevel, IndicatorDefinition, INDICATORS } from '@/types/indicators';
import {
  HierarchyBreadcrumb,
  ColorScaleType,
  ColorPalette,
  COLOR_PALETTES,
  UnitTooltipData,
} from '@/types/map';
import { buildLegendBreaks } from '@/utils/colorScales';
import {
  loadCountiesGeoJson,
  loadSubcountiesGeoJson,
  loadWardsGeoJson,
  loadVillagesGeoJson,
} from '@/utils/geojsonLoader';
import { exportDataAsCsv, exportMapAsPng } from '@/utils/exportUtils';
import { Menu, X } from 'lucide-react';

export default function Home() {
  // 1. API Key State
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  useEffect(() => {
    const envKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const storedKey = typeof window !== 'undefined' ? localStorage.getItem('kenya_maps_api_key') : '';
    if (storedKey) {
      setApiKey(storedKey);
    } else if (envKey) {
      setApiKey(envKey);
    }
  }, []);

  const handleSaveApiKey = (newKey: string) => {
    setApiKey(newKey);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kenya_maps_api_key', newKey);
    }
  };

  // 2. Hierarchy & Navigation State
  const [activeLevel, setActiveLevel] = useState<AdminLevel>('county');
  const [selectedCountyCode, setSelectedCountyCode] = useState<number | undefined>(undefined);
  const [selectedCountyName, setSelectedCountyName] = useState<string | undefined>(undefined);
  const [selectedSubcountyName, setSelectedSubcountyName] = useState<string | undefined>(undefined);
  const [selectedBounds, setSelectedBounds] = useState<google.maps.LatLngBounds | null>(null);

  const [breadcrumbs, setBreadcrumbs] = useState<HierarchyBreadcrumb[]>([
    { level: 'national', name: 'Kenya' },
  ]);

  // 3. Indicator & Map Styling State
  const [activeIndicator, setActiveIndicator] = useState<IndicatorDefinition>(INDICATORS[0]);
  const [scaleType, setScaleType] = useState<ColorScaleType>('quantile');
  const [activePalette, setActivePalette] = useState<ColorPalette>(COLOR_PALETTES[0]);
  const [opacity, setOpacity] = useState<number>(0.75);
  const [mapType, setMapType] = useState<'dark' | 'light' | 'satellite' | 'terrain'>('dark');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // 4. Data Layer GeoJSON & Tooltip
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const [hoveredData, setHoveredData] = useState<UnitTooltipData | null>(null);
  const [searchIndex, setSearchIndex] = useState<any[]>([]);

  // 4.1 Selected Feature for Individual Area Profile & Export (CSV, PDF, GeoJSON)
  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);
  const [isAreaProfileOpen, setIsAreaProfileOpen] = useState(false);
  const [isExportAreaModalOpen, setIsExportAreaModalOpen] = useState(false);

  // 5. Load GeoJSON when Level or County changes
  const refreshGeoJson = useCallback(async () => {
    try {
      let data = null;
      if (activeLevel === 'county') {
        data = await loadCountiesGeoJson();
      } else if (activeLevel === 'subcounty') {
        data = await loadSubcountiesGeoJson(selectedCountyCode);
      } else if (activeLevel === 'ward') {
        data = await loadWardsGeoJson(selectedCountyCode);
      } else if (activeLevel === 'village') {
        data = await loadVillagesGeoJson(selectedCountyCode);
      }
      setGeoJsonData(data);
    } catch (err) {
      console.error('Error loading GeoJSON for level:', activeLevel, err);
    }
  }, [activeLevel, selectedCountyCode]);

  useEffect(() => {
    refreshGeoJson();
  }, [refreshGeoJson]);

  // 6. Build global search index once on initial load
  useEffect(() => {
    async function buildIndex() {
      try {
        const counties = await loadCountiesGeoJson();
        const subcounties = await loadSubcountiesGeoJson();
        const indexList: any[] = [];

        counties.features.forEach((f: any) => {
          indexList.push({
            code: f.properties.code,
            name: `${f.properties.name} County`,
            level: 'County',
            countyCode: f.properties.code,
          });
        });

        subcounties.features.forEach((f: any) => {
          indexList.push({
            code: f.properties.code,
            name: f.properties.name,
            level: 'Sub-County',
            countyCode: f.properties.county_code,
            parentName: `${f.properties.county_name} County`,
          });
        });

        setSearchIndex(indexList);
      } catch (err) {
        console.error('Error building search index:', err);
      }
    }
    buildIndex();
  }, []);

  // 7. Calculate Ranks and Legend Breaks for Active Indicator
  const { legendBreaks, ranksMap } = useMemo(() => {
    if (!geoJsonData || !geoJsonData.features) {
      return { legendBreaks: [], ranksMap: {} };
    }

    const values: { code: string; val: number }[] = [];
    geoJsonData.features.forEach((f: any) => {
      const v = f.properties?.[activeIndicator.id];
      if (typeof v === 'number' && !isNaN(v)) {
        values.push({ code: String(f.properties?.code || ''), val: v });
      }
    });

    // Rank units (higher is #1 if higherIsBetter, or standard high-to-low)
    const sorted = [...values].sort((a, b) => b.val - a.val);
    const ranks: Record<string, string> = {};
    const totalCount = sorted.length;

    sorted.forEach((item, idx) => {
      ranks[item.code] = `#${idx + 1} of ${totalCount}`;
    });

    const breaks = buildLegendBreaks(
      values.map((v) => v.val),
      activePalette.colors,
      scaleType,
      activeIndicator.unit
    );

    return { legendBreaks: breaks, ranksMap: ranks };
  }, [geoJsonData, activeIndicator, activePalette, scaleType]);

  // 8. Feature Click Handler (Opens Individual Area Profile & Export Modal)
  const handleFeatureClick = useCallback(
    (feature: any, bounds?: google.maps.LatLngBounds) => {
      if (!feature) return;

      if (bounds) {
        setSelectedBounds(bounds);
      }

      setSelectedFeature(feature);
      setIsAreaProfileOpen(true);
    },
    []
  );

  const handleDrillDownFromModal = useCallback(() => {
    if (!selectedFeature) return;
    const properties = selectedFeature.properties || {};

    if (activeLevel === 'county') {
      const cCode = properties.code;
      const cName = properties.name;
      setSelectedCountyCode(cCode);
      setSelectedCountyName(cName);
      setActiveLevel('subcounty');
      setBreadcrumbs([
        { level: 'national', name: 'Kenya' },
        { level: 'county', code: cCode, name: `${cName} County` },
      ]);
    } else if (activeLevel === 'subcounty') {
      const scName = properties.name;
      setSelectedSubcountyName(scName);
      setActiveLevel('ward');
      setBreadcrumbs((prev) => [
        ...prev.slice(0, 2),
        { level: 'subcounty', name: `${scName} Sub-County` },
      ]);
    } else if (activeLevel === 'ward') {
      setActiveLevel('village');
      setBreadcrumbs((prev) => [
        ...prev.slice(0, 3),
        { level: 'ward', name: `${properties.name} Ward` },
      ]);
    }
  }, [selectedFeature, activeLevel]);

  // 9. Breadcrumb Navigation Handler
  const handleNavigateBreadcrumb = useCallback((index: number) => {
    if (index === 0) {
      // Return to National (Counties)
      setActiveLevel('county');
      setSelectedCountyCode(undefined);
      setSelectedCountyName(undefined);
      setSelectedSubcountyName(undefined);
      setSelectedBounds(null);
      setBreadcrumbs([{ level: 'national', name: 'Kenya' }]);
    } else if (index === 1) {
      // Return to County's Subcounties
      setActiveLevel('subcounty');
      setSelectedSubcountyName(undefined);
      setBreadcrumbs((prev) => prev.slice(0, 2));
    }
  }, []);

  // 10. Search Selection Handler
  const handleSearchSelect = useCallback(
    (item: { code: string | number; name: string; level: string; countyCode?: number; parentName?: string }) => {
      if (item.level === 'County' && item.countyCode) {
        setSelectedCountyCode(item.countyCode);
        setSelectedCountyName(item.name.replace(' County', ''));
        setActiveLevel('subcounty');
        setBreadcrumbs([
          { level: 'national', name: 'Kenya' },
          { level: 'county', code: item.countyCode, name: item.name },
        ]);
      } else if (item.level === 'Sub-County' && item.countyCode) {
        setSelectedCountyCode(item.countyCode);
        setSelectedCountyName(item.parentName?.replace(' County', ''));
        setSelectedSubcountyName(item.name);
        setActiveLevel('ward');
        setBreadcrumbs([
          { level: 'national', name: 'Kenya' },
          { level: 'county', code: item.countyCode, name: item.parentName || 'County' },
          { level: 'subcounty', name: `${item.name} Sub-County` },
        ]);
      }
    },
    []
  );

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${theme === 'dark' ? 'dark bg-[#020617] text-[#d1d5dc]' : 'light bg-[#ffffff] text-[#444444]'}`}>
      {/* Top Header */}
      <TopNav
        breadcrumbs={breadcrumbs}
        onNavigateBreadcrumb={handleNavigateBreadcrumb}
        onSearchSelect={handleSearchSelect}
        searchIndex={searchIndex}
        onExportCsv={() => exportDataAsCsv(geoJsonData?.features || [], activeIndicator, activeLevel)}
        onOpenAreaExportModal={() => setIsExportAreaModalOpen(true)}
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        hasApiKey={!!apiKey}
        theme={theme}
        onToggleTheme={() => {
          const next = theme === 'dark' ? 'light' : 'dark';
          setTheme(next);
          setMapType(next);
        }}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="md:hidden absolute top-3 left-3 z-30 p-2 rounded-xl bg-white dark:bg-[#0f172a] text-neutral-800 dark:text-neutral-100 border border-neutral-200 dark:border-[#3e3e3e] shadow-xl hover:border-[#ef4444] transition-colors"
        >
          {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Sidebar Controls (Responsive drawer on mobile, static on desktop) */}
        <div
          className={`${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 transition-transform duration-200 fixed md:relative z-20 h-full`}
        >
          <SidebarControls
            activeLevel={activeLevel}
            onChangeLevel={(lvl) => {
              setActiveLevel(lvl);
              setIsMobileSidebarOpen(false);
            }}
            activeIndicator={activeIndicator}
            onChangeIndicator={(ind) => setActiveIndicator(ind)}
            scaleType={scaleType}
            onChangeScaleType={setScaleType}
            activePalette={activePalette}
            onChangePalette={setActivePalette}
            opacity={opacity}
            onChangeOpacity={setOpacity}
            mapType={mapType}
            onChangeMapType={setMapType}
            selectedCountyName={selectedCountyName}
            totalFeaturesCount={geoJsonData?.features?.length || 0}
          />
        </div>

        {/* Interactive Map Viewport */}
        <main id="main-map-viewport" className="flex-1 relative flex flex-col h-[calc(100vh-4rem)]">
          <MapContainer
            apiKey={apiKey}
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
            geoJsonData={geoJsonData}
            activeIndicator={activeIndicator}
            legendBreaks={legendBreaks}
            opacity={opacity}
            mapType={mapType}
            activeLevel={activeLevel}
            onFeatureClick={handleFeatureClick}
            onFeatureHover={setHoveredData}
            ranksMap={ranksMap}
            selectedBounds={selectedBounds}
          />

          {/* Choropleth Map Legend (Pinned to Bottom-Right) */}
          <div className="absolute bottom-6 right-6 z-20 pointer-events-auto">
            <Legend
              breaks={legendBreaks}
              indicator={activeIndicator}
              activeLevel={activeLevel}
            />
          </div>

          {/* Interactive Hover Tooltip */}
          <HoverTooltip data={hoveredData} />
        </main>
      </div>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        currentKey={apiKey}
        onSaveKey={handleSaveApiKey}
      />

      {/* Individual Area Profile & Export Modal (CSV, PDF, GeoJSON) */}
      <AreaProfileModal
        isOpen={isAreaProfileOpen}
        onClose={() => setIsAreaProfileOpen(false)}
        feature={selectedFeature}
        rank={selectedFeature ? ranksMap[String(selectedFeature.properties?.code)] : undefined}
        onDrillDown={handleDrillDownFromModal}
        canDrillDown={activeLevel !== 'village'}
      />

      {/* Navbar Area Export Modal (Direct Level & Unit Selection -> CSV, PDF, GeoJSON) */}
      <ExportAreaModal
        isOpen={isExportAreaModalOpen}
        onClose={() => setIsExportAreaModalOpen(false)}
        currentFeature={selectedFeature}
        currentLevel={activeLevel}
        currentCountyCode={selectedCountyCode}
      />
    </div>
  );
}
