"""
Facility aggregation module:
- KMHFL health facilities per County, Sub-County, and Ward
- HOTOSM education facilities per County and Sub-County
Computes density rates (facilities per 10,000 people; schools per 1,000 children under 15).
"""
import pandas as pd
import json
from collections import Counter
from typing import Dict, Any, Tuple
from pipeline.normalize import normalize_county_name, normalize_subcounty_name, get_county_code

def load_health_facilities() -> Tuple[Dict[int, int], Dict[str, int], Dict[str, int]]:
    """
    Returns:
    - county_health: mapping of county_code -> facility count
    - subcounty_health: mapping of (county_code, normalized_subcounty) -> facility count
    - ward_health: mapping of normalized_ward_name -> facility count
    """
    county_health: Counter = Counter()
    subcounty_health: Counter = Counter()
    ward_health: Counter = Counter()
    
    try:
        df = pd.read_excel("data/raw/kenya_health_facilities.xlsx")
        for _, r in df.iterrows():
            c_code = get_county_code(str(r.get('County', '')))
            sc_raw = str(r.get('Sub county', ''))
            sc_norm = normalize_subcounty_name(sc_raw)
            ward_raw = str(r.get('Ward', '')).strip().upper()
            
            if c_code:
                county_health[c_code] += 1
                if sc_norm:
                    subcounty_health[f"{c_code}_{sc_norm}"] += 1
                if ward_raw and ward_raw != 'NAN':
                    ward_health[f"{c_code}_{ward_raw}"] += 1
    except Exception as e:
        print("Warning loading health facilities:", e)
        
    return dict(county_health), dict(subcounty_health), dict(ward_health)

def load_education_facilities() -> Tuple[Dict[int, int], Dict[str, int]]:
    """
    Returns:
    - county_schools: mapping of county_code -> school count
    - subcounty_schools: mapping of (county_code, normalized_subcounty) -> school count
    """
    county_schools: Counter = Counter()
    subcounty_schools: Counter = Counter()
    
    try:
        with open("data/raw/osm_education/education_facilities.geojson", "r", encoding="utf-8") as f:
            d = json.load(f)
            
        for feat in d.get('features', []):
            props = feat.get('properties', {})
            c_name = props.get('adm1_name')
            sc_name = props.get('adm2_name')
            
            c_code = get_county_code(c_name)
            if c_code:
                county_schools[c_code] += 1
                if sc_name:
                    sc_norm = normalize_subcounty_name(sc_name)
                    subcounty_schools[f"{c_code}_{sc_norm}"] += 1
    except Exception as e:
        print("Warning loading education facilities:", e)
        
    return dict(county_schools), dict(subcounty_schools)

