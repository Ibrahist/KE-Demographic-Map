'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { UnitTooltipData, LegendBreak } from '@/types/map';
import { IndicatorDefinition } from '@/types/indicators';
import { getColorForValue } from '@/utils/colorScales';
import { Key, AlertCircle, RefreshCw } from 'lucide-react';

interface MapContainerProps {
  apiKey: string;
  onOpenApiKeyModal: () => void;
  geoJsonData: any;
  activeIndicator: IndicatorDefinition;
  legendBreaks: LegendBreak[];
  opacity: number;
  mapType: 'dark' | 'light' | 'satellite' | 'terrain';
  activeLevel: string;
  onFeatureClick: (properties: any, bounds?: google.maps.LatLngBounds) => void;
  onFeatureHover: (data: UnitTooltipData | null | ((prev: UnitTooltipData | null) => UnitTooltipData | null)) => void;
  ranksMap: Record<string, string>;
  selectedBounds?: google.maps.LatLngBounds | null;
}

// Dark Mode Google Maps Styling JSON
const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#181e29' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#181e29' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#748398' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b5563' }, { weight: 1.5 }] },
  { featureType: 'administrative.province', elementType: 'geometry.stroke', stylers: [{ color: '#374151' }, { weight: 0.8 }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d1d5db' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#273142' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1e2533' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#37475c' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#38bdf8' }] },
];

export const MapContainer: React.FC<MapContainerProps> = ({
  apiKey,
  onOpenApiKeyModal,
  geoJsonData,
  activeIndicator,
  legendBreaks,
  opacity,
  mapType,
  activeLevel,
  onFeatureClick,
  onFeatureHover,
  ranksMap,
  selectedBounds,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const dataLayerRef = useRef<google.maps.Data | null>(null);
  const hoveredFeatureRef = useRef<google.maps.Data.Feature | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // 1. Load Google Maps Script
  useEffect(() => {
    if (!apiKey) {
      setLoadError('No Google Maps API Key provided');
      return;
    }

    setLoadError(null);
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      if ((window as any).google?.maps) {
        setScriptLoaded(true);
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setScriptLoaded(true);
    };
    script.onerror = () => {
      setLoadError('Failed to load Google Maps script. Check your API key and network.');
    };
    document.head.appendChild(script);
  }, [apiKey]);

  // 2. Initialize Google Map instance
  useEffect(() => {
    if (!scriptLoaded || !mapRef.current || mapInstanceRef.current) return;

    try {
      // Kenya Center Lat/Lng: ~0.0236, 37.9062
      const map = new google.maps.Map(mapRef.current, {
        center: { lat: 0.35, lng: 37.85 },
        zoom: 6.5,
        minZoom: 5.5,
        maxZoom: 16,
        mapTypeId:
          mapType === 'satellite'
            ? 'satellite'
            : mapType === 'terrain'
            ? 'terrain'
            : 'roadmap',
        styles: mapType === 'dark' ? DARK_MAP_STYLE : [],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_BOTTOM,
        },
      });

      mapInstanceRef.current = map;
      dataLayerRef.current = map.data;
    } catch (err: any) {
      console.error('Error initializing map:', err);
      setLoadError(err.message || 'Error initializing Google Map');
    }
  }, [scriptLoaded, mapType]);

  // 3. Update Map Style when theme/mapType changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (mapType === 'satellite') {
      map.setMapTypeId('satellite');
      map.setOptions({ styles: [] });
    } else if (mapType === 'terrain') {
      map.setMapTypeId('terrain');
      map.setOptions({ styles: [] });
    } else if (mapType === 'dark') {
      map.setMapTypeId('roadmap');
      map.setOptions({ styles: DARK_MAP_STYLE });
    } else {
      map.setMapTypeId('roadmap');
      map.setOptions({ styles: [] });
    }
  }, [mapType]);

  // 4. Load GeoJSON features and configure Data Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    const dataLayer = dataLayerRef.current;
    if (!map || !dataLayer || !geoJsonData) return;

    // Clear existing data layer features
    dataLayer.forEach((f) => dataLayer.remove(f));
    hoveredFeatureRef.current = null;
    onFeatureHover(null);

    try {
      const addedFeatures = dataLayer.addGeoJson(geoJsonData);

      // Fit bounds if no specific county bounds were provided
      if (!selectedBounds && addedFeatures.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        addedFeatures.forEach((feature) => {
          feature.getGeometry()?.forEachLatLng((latLng) => {
            bounds.extend(latLng);
          });
        });
        map.fitBounds(bounds, 30);
      }
    } catch (err) {
      console.error('Error adding GeoJSON to data layer:', err);
    }
  }, [geoJsonData, selectedBounds]);

  // 5. Zoom to selectedBounds if updated
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map && selectedBounds) {
      map.fitBounds(selectedBounds, 40);
    }
  }, [selectedBounds]);

  // 6. Style Data Layer Features (Choropleth logic)
  useEffect(() => {
    const dataLayer = dataLayerRef.current;
    if (!dataLayer) return;

    dataLayer.setStyle((feature) => {
      const isHovered = feature === hoveredFeatureRef.current;
      const geomType = feature.getGeometry()?.getType();

      // Point features (Villages)
      if (geomType === 'Point') {
        const pType = feature.getProperty('place_type');
        const color = pType === 'town' || pType === 'city' ? '#38bdf8' : '#10b981';
        return {
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: isHovered ? 7 : pType === 'town' || pType === 'city' ? 5 : 3.5,
            fillColor: isHovered ? '#facc15' : color,
            fillOpacity: 0.85,
            strokeColor: '#ffffff',
            strokeWeight: isHovered ? 2 : 1,
          },
        };
      }

      // Polygon features (Counties, Sub-Counties, Wards)
      const rawVal = feature.getProperty(activeIndicator.id) as any;
      const isAvail = typeof rawVal === 'number' && !isNaN(rawVal);
      const fillColor = getColorForValue(rawVal, legendBreaks);

      return {
        fillColor: isAvail ? fillColor : '#475569',
        fillOpacity: isHovered ? Math.min(opacity + 0.25, 1.0) : isAvail ? opacity : 0.2,
        strokeColor: isHovered
          ? '#38bdf8'
          : mapType === 'dark'
          ? '#94a3b8'
          : '#334155',
        strokeWeight: isHovered ? 2.5 : activeLevel === 'ward' ? 0.7 : 1.2,
        zIndex: isHovered ? 10 : 1,
      };
    });
  }, [activeIndicator, legendBreaks, opacity, mapType, activeLevel]);

  // 7. Mouse and Click Event Listeners
  useEffect(() => {
    const dataLayer = dataLayerRef.current;
    if (!dataLayer) return;

    const mouseOverListener = dataLayer.addListener('mouseover', (e: google.maps.Data.MouseEvent) => {
      hoveredFeatureRef.current = e.feature;
      dataLayer.revertStyle();
      dataLayer.overrideStyle(e.feature, {
        strokeColor: '#facc15',
        strokeWeight: 2.5,
        zIndex: 20,
      });

      const p = (e.feature as any).g || {};
      const code = e.feature.getProperty('code') || '';
      const rawVal = e.feature.getProperty(activeIndicator.id) as any;
      const isAvail = typeof rawVal === 'number' && !isNaN(rawVal);

      const tooltipData: UnitTooltipData = {
        x: (e.domEvent as MouseEvent).clientX,
        y: (e.domEvent as MouseEvent).clientY,
        name: (e.feature.getProperty('name') as string) || 'Unnamed Unit',
        level: (e.feature.getProperty('level') as string) || activeLevel,
        parentCounty: (e.feature.getProperty('county_name') as string) || undefined,
        parentSubcounty: (e.feature.getProperty('subcounty_name') as string) || undefined,
        indicatorName: activeIndicator.name,
        valueStr: activeIndicator.formatValue(rawVal),
        rawVal: isAvail ? rawVal : null,
        rank: ranksMap[String(code)],
        popTotal: (e.feature.getProperty('pop_total') as number) || undefined,
        areaSqKm: (e.feature.getProperty('area_sqkm') as number) || undefined,
        density: (e.feature.getProperty('pop_density') as number) || undefined,
        isAvailable: isAvail,
      };

      onFeatureHover(tooltipData);
    });

    const mouseMoveListener = dataLayer.addListener('mousemove', (e: google.maps.Data.MouseEvent) => {
      onFeatureHover((prev) =>
        prev
          ? {
              ...prev,
              x: (e.domEvent as MouseEvent).clientX,
              y: (e.domEvent as MouseEvent).clientY,
            }
          : null
      );
    });

    const mouseOutListener = dataLayer.addListener('mouseout', (e: google.maps.Data.MouseEvent) => {
      hoveredFeatureRef.current = null;
      dataLayer.revertStyle();
      onFeatureHover(null);
    });

    const clickListener = dataLayer.addListener('click', (e: google.maps.Data.MouseEvent) => {
      const bounds = new google.maps.LatLngBounds();
      e.feature.getGeometry()?.forEachLatLng((latLng) => {
        bounds.extend(latLng);
      });

      e.feature.toGeoJson((geoJsonFeature) => {
        onFeatureClick(geoJsonFeature, bounds);
      });
    });

    return () => {
      google.maps.event.removeListener(mouseOverListener);
      google.maps.event.removeListener(mouseMoveListener);
      google.maps.event.removeListener(mouseOutListener);
      google.maps.event.removeListener(clickListener);
    };
  }, [activeIndicator, activeLevel, ranksMap, onFeatureClick, onFeatureHover]);

  // If no API key or script failed, render friendly UI fallback
  if (!apiKey || loadError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-950 p-6 text-center text-slate-300">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 shadow-xl">
          <Key className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Google Maps API Key Required</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
          To visualize Kenya's administrative boundaries and choropleth demographics with the Google Maps Data layer, provide your Google Maps JavaScript API key.
        </p>
        <button
          onClick={onOpenApiKeyModal}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-xl shadow-emerald-950/40 transition-all hover:scale-105"
        >
          <Key className="w-4 h-4" /> Enter API Key to Unlock Map
        </button>
      </div>
    );
  }

  return (
    <div className="relative flex-1 w-full h-full overflow-hidden">
      <div id="kenya-map-container" ref={mapRef} className="w-full h-full" />
    </div>
  );
};
