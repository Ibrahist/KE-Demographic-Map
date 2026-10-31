/**
 * Client-side GeoJSON loading & caching utilities.
 * Implements lazy loading for ward and village partitioned files.
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
    // If no specific county, load general subcounties or default
    return { type: 'FeatureCollection', features: [] };
  }
  const cCodeNum = typeof countyCode === 'string' ? parseInt(countyCode, 10) : countyCode;
  const path = `/data/wards_${cCodeNum}.geojson`;
  try {
    return await fetchGeoJson(path);
  } catch (err) {
    console.warn(`Could not load wards for county ${countyCode}:`, err);
    return { type: 'FeatureCollection', features: [] };
  }
}

export async function loadVillagesGeoJson(countyCode?: number | string): Promise<any> {
  if (!countyCode) {
    return { type: 'FeatureCollection', features: [] };
  }
  const cCodeNum = typeof countyCode === 'string' ? parseInt(countyCode, 10) : countyCode;
  const path = `/data/villages_${cCodeNum}.geojson`;
  try {
    return await fetchGeoJson(path);
  } catch (err) {
    console.warn(`Could not load villages for county ${countyCode}:`, err);
    return { type: 'FeatureCollection', features: [] };
  }
}

