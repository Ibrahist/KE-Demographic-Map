"""
Spatial processing module:
- Computes accurate equal-area planar areas (km²) using Africa Albers Equal Area Conic
- Computes derived spatial metrics (pop density, facility densities)
- Simplifies geometries with topology preservation
- Produces processed GeoJSON files and partitions for fast client lazy-loading
- Generates /data/unmatched.csv
"""
import os
import json
import geopandas as gpd
import pandas as pd
from typing import Dict, Any, List
from pipeline.normalize import (
    normalize_county_name,
    normalize_subcounty_name,
    get_county_code,
    get_county_pcode,
    COUNTY_DISPLAY_MAP,
)

AEA_CRS = "+proj=aea +lat_1=20 +lat_2=-23 +lat_0=0 +lon_0=25 +datum=WGS84 +units=m +no_defs"

def process_counties(
    census_data: Dict[int, Dict[str, Any]],
    kdhs_data: Dict[int, Dict[str, Any]],
    health_counts: Dict[int, int],
    school_counts: Dict[int, int],
    out_dir: str = "data/processed",
) -> Tuple[gpd.GeoDataFrame, List[Dict[str, str]]]:
    unmatched: List[Dict[str, str]] = []
    gdf = gpd.read_file("data/raw/cod_ab/ken_admin1.geojson")
    
    # Calculate exact equal-area planar area
    gdf_aea = gdf.to_crs(AEA_CRS)
    gdf['area_sqkm'] = (gdf_aea.geometry.area / 1e6).round(2)
    
    # Simplify geometries (preserving topology)
    # 0.004 degrees is ~400m, keeps boundaries looking crisp while reducing size by ~70%
    gdf['geometry'] = gdf.geometry.simplify(tolerance=0.004, preserve_topology=True)
    
    records = []
    for idx, row in gdf.iterrows():
        raw_name = row['adm1_name']
        c_code = get_county_code(raw_name)
        if not c_code:
            unmatched.append({"level": "County", "name": raw_name, "reason": "No county code match"})
            continue
            
        pcode = get_county_pcode(c_code)
        display_name = COUNTY_DISPLAY_MAP.get(c_code, raw_name)
        c_census = census_data.get(c_code, {})
        c_kdhs = kdhs_data.get(c_code, {})
        
        pop = c_census.get('pop_total', 0)
        area = float(row['area_sqkm'])
        density = round(pop / area, 1) if area > 0 else 0.0
        
        # Health & Schools densities
        h_count = health_counts.get(c_code, 0)
        h_per_10k = round(h_count / pop * 10000, 2) if pop > 0 else 0.0
        
        s_count = school_counts.get(c_code, 0)
        under_15_pop = pop * (c_census.get('pct_under_15', 35.0) / 100.0)
        s_per_1k_kids = round(s_count / under_15_pop * 1000, 2) if under_15_pop > 0 else 0.0
        
        props = {
            "code": c_code,
            "pcode": pcode,
            "name": display_name,
            "level": "County",
            # Population & structure
            "pop_total": pop,
            "pop_male": c_census.get('pop_male', 0),
            "pop_female": c_census.get('pop_female', 0),
            "sex_ratio": c_census.get('sex_ratio', 100.0),
            "area_sqkm": area,
            "pop_density": density,
            "households": c_census.get('households', 0),
            "avg_hh_size": c_census.get('avg_hh_size', 0.0),
            "pct_under_15": c_census.get('pct_under_15', 0.0),
            "pct_above_65": c_census.get('pct_above_65', 0.0),
            # Growth & migration
            "pop_2009": c_census.get('pop_2009', 0),
            "growth_rate": c_census.get('growth_rate', 0.0),
            "urban_share": c_census.get('urban_share', 0.0),
            "rural_share": c_census.get('rural_share', 0.0),
            # Health & wellbeing
            "stunting_pct": c_kdhs.get('stunting_pct', None),
            "facility_births_pct": c_kdhs.get('facility_births_pct', None),
            "skilled_birth_pct": c_kdhs.get('skilled_birth_pct', None),
            "fertility_rate": c_kdhs.get('fertility_rate', None),
            "teenage_pregnancy_pct": c_kdhs.get('teenage_pregnancy_pct', None),
            "health_facilities_count": h_count,
            "health_facilities_per_10k": h_per_10k,
            # Education & economy
            "schools_count": s_count,
            "schools_per_1k_children": s_per_1k_kids,
            "school_attendance_pct": c_census.get('school_attendance_pct', None),
            "literacy_rate_pct": c_census.get('literacy_rate_pct', None),
            "electricity_access_pct": c_census.get('electricity_access_pct', None),
            "solar_access_pct": c_census.get('solar_access_pct', None),
            "improved_water_pct": c_census.get('improved_water_pct', None),
            "improved_sanitation_pct": c_census.get('improved_sanitation_pct', None),
            "agriculture_livelihood_pct": c_census.get('agriculture_livelihood_pct', None),
            "internet_usage_pct": c_census.get('internet_usage_pct', None),
        }
        records.append(props)
        
    out_gdf = gpd.GeoDataFrame(records, geometry=gdf.geometry, crs=gdf.crs)
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, "counties.geojson")
    out_gdf.to_file(out_path, driver="GeoJSON")
    print(f"Generated {out_path} ({len(out_gdf)} counties)")
    return out_gdf, unmatched

def process_subcounties(
    subcounty_census: Dict[str, Dict[str, Any]],
    county_census: Dict[int, Dict[str, Any]],
    health_counts_sc: Dict[str, int],
    school_counts_sc: Dict[str, int],
    out_dir: str = "data/processed",
) -> Tuple[gpd.GeoDataFrame, List[Dict[str, str]]]:
    unmatched: List[Dict[str, str]] = []
    gdf = gpd.read_file("data/raw/cod_ab/ken_admin2.geojson")
    
    gdf_aea = gdf.to_crs(AEA_CRS)
    gdf['area_sqkm'] = (gdf_aea.geometry.area / 1e6).round(2)
    gdf['geometry'] = gdf.geometry.simplify(tolerance=0.003, preserve_topology=True)
    
    records = []
    for idx, row in gdf.iterrows():
        raw_sc = row['adm2_name']
        raw_c = row['adm1_name']
        c_code = get_county_code(raw_c)
        sc_norm = normalize_subcounty_name(raw_sc)
        pcode = row.get('adm2_pcode', '')
        
        # Match subcounty data
        key = f"{c_code}_{sc_norm}"
        sc_data = subcounty_census.get(key)
        if not sc_data:
            # Fuzzy match attempt inside same county
            for k, val in subcounty_census.items():
                if k.startswith(f"{c_code}_") and (sc_norm in k or k.split('_', 1)[1] in sc_norm):
                    sc_data = val
                    break
                    
        if not sc_data:
            unmatched.append({"level": "Sub-County", "name": f"{raw_sc} ({raw_c})", "reason": "No subcounty demographic match"})
            # Fallback to county-proportional estimates or null
            sc_data = {}
            
        pop = sc_data.get('pop_total', 0)
        area = float(row['area_sqkm'])
        density = round(pop / area, 1) if area > 0 and pop > 0 else None
        
        h_count = health_counts_sc.get(key, 0)
        h_per_10k = round(h_count / pop * 10000, 2) if pop > 0 else 0.0
        
        s_count = school_counts_sc.get(key, 0)
        kids = pop * (sc_data.get('pct_under_15', 38.0) / 100.0)
        s_per_1k = round(s_count / kids * 1000, 2) if kids > 0 else 0.0
        
        props = {
            "code": pcode or f"SC_{idx+1}",
            "pcode": pcode,
            "name": raw_sc,
            "level": "Sub-County",
            "county_code": c_code,
            "county_name": COUNTY_DISPLAY_MAP.get(c_code, raw_c),
            "area_sqkm": area,
            "pop_total": pop,
            "pop_male": sc_data.get('pop_male', None),
            "pop_female": sc_data.get('pop_female', None),
            "sex_ratio": sc_data.get('sex_ratio', None),
            "pop_density": density,
            "households": sc_data.get('households', None),
            "pct_under_15": sc_data.get('pct_under_15', None),
            "pct_above_65": sc_data.get('pct_above_65', None),
            "electricity_access_pct": sc_data.get('electricity_access_pct', None),
            "improved_water_pct": sc_data.get('improved_water_pct', None),
            "improved_sanitation_pct": sc_data.get('improved_sanitation_pct', None),
            "agriculture_livelihood_pct": sc_data.get('agriculture_livelihood_pct', None),
            "internet_usage_pct": sc_data.get('internet_usage_pct', None),
            "health_facilities_count": h_count,
            "health_facilities_per_10k": h_per_10k,
            "schools_count": s_count,
            "schools_per_1k_children": s_per_1k,
        }
        records.append(props)
        
    out_gdf = gpd.GeoDataFrame(records, geometry=gdf.geometry, crs=gdf.crs)
    out_path = os.path.join(out_dir, "subcounties.geojson")
    out_gdf.to_file(out_path, driver="GeoJSON")
    print(f"Generated {out_path} ({len(out_gdf)} sub-counties)")
    return out_gdf, unmatched

def process_wards(
    ward_health: Dict[str, int],
    out_dir: str = "data/processed",
) -> Tuple[gpd.GeoDataFrame, List[Dict[str, str]]]:
    unmatched: List[Dict[str, str]] = []
    shp_path = "data/raw/wards/Kenya_Wards/kenya_wards.shp"
    gdf = gpd.read_file(shp_path)
    
    gdf_aea = gdf.to_crs(AEA_CRS)
    gdf['area_sqkm'] = (gdf_aea.geometry.area / 1e6).round(2)
    gdf['geometry'] = gdf.geometry.simplify(tolerance=0.002, preserve_topology=True)
    
    records = []
    for idx, row in gdf.iterrows():
        raw_ward = str(row.get('ward', ''))
        raw_sc = str(row.get('subcounty', ''))
        raw_c = str(row.get('county', ''))
        c_code = get_county_code(raw_c)
        uid = str(row.get('uid', row.get('gid', idx + 1)))
        
        pop_09 = float(row.get('pop2009', 0))
        area = float(row['area_sqkm'])
        # Baseline density
        density = round(pop_09 / area, 1) if area > 0 and pop_09 > 0 else None
        
        # Health facilities count for ward
        ward_key = f"{c_code}_{raw_ward.strip().upper()}"
        h_count = ward_health.get(ward_key, 0)
        h_per_10k = round(h_count / pop_09 * 10000, 2) if pop_09 > 0 else 0.0
        
        props = {
            "code": uid,
            "name": raw_ward,
            "level": "Ward",
            "county_code": c_code,
            "county_name": COUNTY_DISPLAY_MAP.get(c_code, raw_c),
            "subcounty_name": raw_sc,
            "area_sqkm": area,
            "pop_total": int(pop_09) if pop_09 > 0 else None,
            "pop_2009": int(pop_09) if pop_09 > 0 else None,
            "pop_density": density,
            "health_facilities_count": h_count,
            "health_facilities_per_10k": h_per_10k if pop_09 > 0 else None,
        }
        records.append(props)
        
    out_gdf = gpd.GeoDataFrame(records, geometry=gdf.geometry, crs=gdf.crs)
    out_path = os.path.join(out_dir, "wards.geojson")
    out_gdf.to_file(out_path, driver="GeoJSON")
    print(f"Generated {out_path} ({len(out_gdf)} wards)")
    
    # Partition by county for lazy loading
    by_county_dir = os.path.join(out_dir, "by_county")
    os.makedirs(by_county_dir, exist_ok=True)
    for c_code in range(1, 48):
        c_wards = out_gdf[out_gdf['county_code'] == c_code]
        if not c_wards.empty:
            c_dir = os.path.join(by_county_dir, str(c_code))
            os.makedirs(c_dir, exist_ok=True)
            c_wards.to_file(os.path.join(c_dir, "wards.geojson"), driver="GeoJSON")
            
    return out_gdf, unmatched

def process_villages(
    out_dir: str = "data/processed",
) -> Tuple[gpd.GeoDataFrame, List[Dict[str, str]]]:
    unmatched: List[Dict[str, str]] = []
    path = "data/raw/osm_places/populated_places.geojson"
    gdf_raw = gpd.read_file(path)
    
    # Filter to real settlements (villages, hamlets, towns, isolated dwellings)
    place_types = ['village', 'hamlet', 'town', 'isolated_dwelling', 'city']
    gdf_filtered = gdf_raw[gdf_raw['place'].isin(place_types)].copy()
    if gdf_filtered.empty:
        gdf_filtered = gdf_raw.copy()
        
    # Convert all geometries to exact centroid points
    gdf_filtered['geometry'] = gdf_filtered.geometry.centroid
    
    records = []
    for idx, row in gdf_filtered.iterrows():
        raw_c = str(row.get('adm1_name', ''))
        c_code = get_county_code(raw_c)
        pl_type = str(row.get('place', 'village'))
        name = str(row.get('name') or row.get('name_latin') or 'Unnamed Village')
        
        records.append({
            "code": str(row.get('id', f"V_{idx+1}")),
            "name": name,
            "place_type": pl_type,
            "level": "Village",
            "county_code": c_code,
            "county_name": COUNTY_DISPLAY_MAP.get(c_code, raw_c),
            "subcounty_name": str(row.get('adm2_name', '')),
        })
        
    out_gdf = gpd.GeoDataFrame(records, geometry=gdf_filtered.geometry.values, crs="EPSG:4326")
    out_path = os.path.join(out_dir, "villages_points.geojson")
    out_gdf.to_file(out_path, driver="GeoJSON")
    print(f"Generated {out_path} ({len(out_gdf)} village/settlement points)")
    
    # Also write villages.geojson alias as requested
    out_gdf.to_file(os.path.join(out_dir, "villages.geojson"), driver="GeoJSON")
    
    # Partition by county for fast client lazy loading
    by_county_dir = os.path.join(out_dir, "by_county")
    os.makedirs(by_county_dir, exist_ok=True)
    for c_code in range(1, 48):
        c_villages = out_gdf[out_gdf['county_code'] == c_code]
        if not c_villages.empty:
            c_dir = os.path.join(by_county_dir, str(c_code))
            os.makedirs(c_dir, exist_ok=True)
            c_villages.to_file(os.path.join(c_dir, "villages.geojson"), driver="GeoJSON")
            
    return out_gdf, unmatched
