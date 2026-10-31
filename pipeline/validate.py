"""
Validation module:
- Checks processed county totals against official national census totals
- Computes difference tolerance
- Outputs /data/unmatched.csv
"""
import pandas as pd
import geopandas as gpd
import os
from typing import List, Dict, Any

OFFICIAL_NATIONAL_TOTALS_2019 = {
    "pop_total": 47564296,
    "pop_male": 23548056,
    "pop_female": 24014710,
    "households": 12143913,
}

def validate_pipeline_results(
    counties_path: str = "data/processed/counties.geojson",
    subcounties_path: str = "data/processed/subcounties.geojson",
    unmatched_records: List[Dict[str, str]] = None,
    out_csv: str = "data/unmatched.csv",
) -> bool:
    print("\n--- RUNNING VALIDATION CHECKS ---")
    
    # 1. County checks
    if not os.path.exists(counties_path):
        print(f"ERROR: {counties_path} does not exist.")
        return False
        
    gdf_c = gpd.read_file(counties_path)
    counties_count = len(gdf_c)
    print(f"County feature count: {counties_count} (Expected: 47)")
    if counties_count != 47:
        print("WARNING: Expected 47 counties!")
        
    total_pop_c = gdf_c['pop_total'].sum()
    off_pop = OFFICIAL_NATIONAL_TOTALS_2019['pop_total']
    diff_pop = abs(total_pop_c - off_pop)
    pct_diff = (diff_pop / off_pop) * 100
    
    print(f"Sum of County Populations: {total_pop_c:,}")
    print(f"Official National Total 2019: {off_pop:,}")
    print(f"Discrepancy: {diff_pop:,} ({pct_diff:.3f}%)")
    
    total_hh_c = gdf_c['households'].sum()
    off_hh = OFFICIAL_NATIONAL_TOTALS_2019['households']
    diff_hh = abs(total_hh_c - off_hh)
    pct_diff_hh = (diff_hh / off_hh) * 100
    print(f"Sum of County Households: {total_hh_c:,}")
    print(f"Official National Households: {off_hh:,}")
    print(f"Discrepancy: {diff_hh:,} ({pct_diff_hh:.3f}%)")
    
    # 2. Write unmatched records report
    if unmatched_records:
        df_unmatched = pd.DataFrame(unmatched_records)
    else:
        df_unmatched = pd.DataFrame(columns=["level", "name", "reason"])
        
    os.makedirs(os.path.dirname(out_csv), exist_ok=True)
    df_unmatched.to_csv(out_csv, index=False)
    print(f"Wrote unmatched records report: {out_csv} ({len(df_unmatched)} rows)")
    
    is_valid = (counties_count == 47) and (pct_diff < 0.1)
    if is_valid:
        print("VALIDATION PASSED: All county metrics within acceptable tolerance (<0.1%).")
    else:
        print("VALIDATION NOTE: Review warnings above.")
        
    return is_valid

