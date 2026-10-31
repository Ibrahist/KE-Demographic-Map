"""
Main data pipeline entrypoint for Kenya Demographic Map.
Run as: python -m pipeline.run
"""
import os
import shutil
from pipeline.census import load_county_census_data, load_subcounty_census_data
from pipeline.kdhs import extract_kdhs_indicators
from pipeline.facilities import load_health_facilities, load_education_facilities
from pipeline.spatial import (
    process_counties,
    process_subcounties,
    process_wards,
    process_villages,
)
from pipeline.validate import validate_pipeline_results

def run_pipeline():
    print("==================================================")
    print("  KENYA DEMOGRAPHIC MAP DATA PROCESSING PIPELINE  ")
    print("==================================================")
    
    # 1. Load tabular & survey datasets
    print("\n[Step 1/5] Loading 2019 Census County and Sub-County data...")
    county_census = load_county_census_data()
    subcounty_census = load_subcounty_census_data()
    print(f"Loaded {len(county_census)} counties and {len(subcounty_census)} subcounties.")
    
    print("\n[Step 2/5] Extracting KDHS 2022 indicators from PR143 PDF / API...")
    kdhs_data = extract_kdhs_indicators()
    print(f"Extracted health indicators for {len(kdhs_data)} counties.")
    
    print("\n[Step 3/5] Aggregating health & education facilities...")
    health_c, health_sc, health_w = load_health_facilities()
    schools_c, schools_sc = load_education_facilities()
    print(f"Aggregated health facilities ({len(health_c)} counties) & schools ({len(schools_c)} counties).")
    
    # 2. Process spatial layers
    print("\n[Step 4/5] Processing spatial boundaries, computing equal-area metrics, simplifying...")
    out_dir = "data/processed"
    all_unmatched = []
    
    print(" -> Processing Counties (Level 1)...")
    gdf_c, un_c = process_counties(county_census, kdhs_data, health_c, schools_c, out_dir)
    all_unmatched.extend(un_c)
    
    print(" -> Processing Sub-Counties (Level 2)...")
    gdf_sc, un_sc = process_subcounties(subcounty_census, county_census, health_sc, schools_sc, out_dir)
    all_unmatched.extend(un_sc)
    
    print(" -> Processing Wards (Level 3)...")
    gdf_w, un_w = process_wards(health_w, out_dir)
    all_unmatched.extend(un_w)
    
    print(" -> Processing Villages / Settlements (Level 4 points)...")
    gdf_v, un_v = process_villages(out_dir)
    all_unmatched.extend(un_v)
    
    # 3. Copy to public/data for the Next.js web application
    web_data_dir = "public/data"
    os.makedirs(web_data_dir, exist_ok=True)
    print(f"\n[Step 5/5] Deploying processed GeoJSON to {web_data_dir} for web app...")
    
    shutil.copy("data/processed/counties.geojson", os.path.join(web_data_dir, "counties.geojson"))
    shutil.copy("data/processed/subcounties.geojson", os.path.join(web_data_dir, "subcounties.geojson"))
    
    # Copy partitioned files
    by_county_dir = "data/processed/by_county"
    if os.path.exists(by_county_dir):
        for c_code in os.listdir(by_county_dir):
            c_path = os.path.join(by_county_dir, c_code)
            if os.path.isdir(c_path):
                wards_src = os.path.join(c_path, "wards.geojson")
                if os.path.exists(wards_src):
                    shutil.copy(wards_src, os.path.join(web_data_dir, f"wards_{c_code}.geojson"))
                vills_src = os.path.join(c_path, "villages.geojson")
                if os.path.exists(vills_src):
                    shutil.copy(vills_src, os.path.join(web_data_dir, f"villages_{c_code}.geojson"))
                    
    print(f"Copied dataset layers to {web_data_dir}.")
    
    # 4. Run validation checks
    validate_pipeline_results(
        counties_path="data/processed/counties.geojson",
        subcounties_path="data/processed/subcounties.geojson",
        unmatched_records=all_unmatched,
        out_csv="data/unmatched.csv",
    )
    print("\nPIPELINE COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    run_pipeline()

