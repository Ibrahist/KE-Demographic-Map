/**
 * Client-side GeoJSON loading & caching utilities.
 * Implements lazy loading for ward and village partitioned files with fallback to nationwide datasets.
 */

const cache: Record<string, any> = {};

export async function fetchGeoJson(path: string): Promise<any> {
  if (cache[path]) {
    return cache[path];
  }
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed to load ${path}: ${res.statusText}`);
  }
  const json = await res.json();
  cache[path] = json;
  return json;
}

export async function loadCountiesGeoJson(): Promise<any> {
  return fetchGeoJson('/data/counties.geojson');
}

export async function loadSubcountiesGeoJson(countyCode?: number | string): Promise<any> {
  const full = await fetchGeoJson('/data/subcounties.geojson');
  if (!countyCode) return full;
  // Filter features to active county
  const cCodeNum = typeof countyCode === 'string' ? parseInt(countyCode, 10) : countyCode;
  return {
    type: 'FeatureCollection',
    features: full.features.filter((f: any) => f.properties?.county_code === cCodeNum),
  };
}

export async function loadWardsGeoJson(countyCode?: number | string): Promise<any> {
  if (!countyCode) {
    // If no specific county selected, load nationwide wards layer (all 1,450 wards in Kenya)
    try {
      return await fetchGeoJson('/data/wards.geojson');
    } catch (err) {
      console.warn('Could not load nationwide wards.geojson:', err);
      return { type: 'FeatureCollection', features: [] };
    }
  }

  const cCodeNum = typeof countyCode === 'string' ? parseInt(countyCode, 10) : countyCode;
  const path = `/data/wards_${cCodeNum}.geojson`;
  try {
    return await fetchGeoJson(path);
  } catch (err) {
    console.warn(`Could not load partitioned wards for county ${countyCode}, falling back to wards.geojson:`, err);
    try {
      const full = await fetchGeoJson('/data/wards.geojson');
      return {
        type: 'FeatureCollection',
        features: full.features.filter((f: any) => f.properties?.county_code === cCodeNum),
      };
    } catch (e) {
      return { type: 'FeatureCollection', features: [] };
    }
  }
}

export async function loadVillagesGeoJson(countyCode?: number | string): Promise<any> {
  if (!countyCode) {
    // If no specific county selected, load nationwide populated settlements point layer
    try {
      return await fetchGeoJson('/data/villages_points.geojson');
    } catch (err) {
      console.warn('Could not load nationwide villages_points.geojson:', err);
      return { type: 'FeatureCollection', features: [] };
    }
  }

  const cCodeNum = typeof countyCode === 'string' ? parseInt(countyCode, 10) : countyCode;
  const path = `/data/villages_${cCodeNum}.geojson`;
  try {
    return await fetchGeoJson(path);
  } catch (err) {
    console.warn(`Could not load partitioned villages for county ${countyCode}, falling back to villages_points.geojson:`, err);
    try {
      const full = await fetchGeoJson('/data/villages_points.geojson');
      return {
        type: 'FeatureCollection',
        features: full.features.filter((f: any) => f.properties?.county_code === cCodeNum),
      };
    } catch (e) {
      return { type: 'FeatureCollection', features: [] };
    }
  }
}
