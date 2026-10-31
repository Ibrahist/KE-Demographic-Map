import subprocess
import os

def run_git(args):
    res = subprocess.run(["git"] + args, capture_output=True, text=True)
    if res.returncode != 0 and "nothing to commit" not in res.stderr and "nothing to commit" not in res.stdout:
        print(f"Git notice: git {' '.join(args)} -> {res.stderr.strip()}")
    return res

print("Initializing Git Repository...")
run_git(["init"])

def commit_file(file_path, message):
    if os.path.exists(file_path):
        run_git(["add", file_path])
        res = run_git(["commit", "-m", message])
        if res.returncode == 0:
            print(f"Commit: {message}")
            return True
    return False

# 1. Project Configuration & Scaffolding
commit_file(".gitignore", "chore: add .gitignore for dependencies, build output, and local envs")
commit_file(".env.example", "chore: add .env.example template for Google Maps JavaScript API key")
commit_file("package.json", "chore: initialize package.json with project dependencies and scripts")
commit_file("package-lock.json", "chore: record lockfile for npm package dependencies")
commit_file("tsconfig.json", "chore: configure TypeScript with strict typing and Next.js aliases")
commit_file("tailwind.config.js", "style: configure Tailwind CSS with Kenya colors and dark mode")
commit_file("postcss.config.js", "chore: configure PostCSS for Tailwind CSS and Autoprefixer")
commit_file("next.config.js", "chore: configure Next.js runtime environment and strict mode")

# 2. Data Sources Documentation
commit_file("data/SOURCES.md", "docs(data): document official public boundary and census data sources")

# 3. Raw Census & Survey Datasets
commit_file("data/raw/2019_census_county.csv", "data(raw): add KNBS 2019 Census county baseline population table")
commit_file("data/raw/2019_census_subcounty.xlsx", "data(raw): add KNBS 2019 Census sub-county distribution spreadsheet")
commit_file("data/raw/ken_admpop_adm1_2019.csv", "data(raw): add OCHA COD-PS county 5-year age group breakdown")
commit_file("data/raw/ken_admpop_2019.xlsx", "data(raw): add subnational demographic age structure workbook")
commit_file("data/raw/ken_adminboundaries_tabulardata.xlsx", "data(raw): add official COD-AB administrative codes reference")
commit_file("data/raw/kdhs_2022_key_indicators.pdf", "data(raw): cache KDHS 2022 Key Indicators Report PR143 PDF")
commit_file("data/raw/kenya_health_facilities.xlsx", "data(raw): add Kenya Master Health Facility List (KMHFL) registry")
commit_file("data/raw/DataCatalogue.rda", "data(raw): add rKenyaCensus data catalog manifest")
commit_file("data/raw/V1_T2.1.rda", "data(raw): add Census 2019 indicators at a glance table")
commit_file("data/raw/V2_T2.2.rda", "data(raw): add Census 2019 total population by county table")
commit_file("data/raw/V2_T2.2a.rda", "data(raw): add Census 2019 rural population by county table")
commit_file("data/raw/V2_T2.2b.rda", "data(raw): add Census 2019 urban population by county table")
commit_file("data/raw/V4_T2.2.rda", "data(raw): add Census 2019 school attendance status table")
commit_file("data/raw/V4_T2.5.rda", "data(raw): add Census 2019 highest education level completed table")
commit_file("data/raw/V4_T2.15.rda", "data(raw): add Census 2019 main source of drinking water table")
commit_file("data/raw/V4_T2.16.rda", "data(raw): add Census 2019 human waste disposal sanitation table")
commit_file("data/raw/V4_T2.19.rda", "data(raw): add Census 2019 main type of lighting fuel electricity table")
commit_file("data/raw/V4_T2.20.rda", "data(raw): add Census 2019 households practicing agriculture table")
commit_file("data/raw/V4_T2.33.rda", "data(raw): add Census 2019 internet and computer usage table")
commit_file("data/raw/gb_adm1.geojson", "data(raw): cache geoBoundaries ADM1 county fallback boundaries")
commit_file("data/raw/gb_adm2.geojson", "data(raw): cache geoBoundaries ADM2 sub-county fallback boundaries")
commit_file("data/raw/gb_adm3.geojson", "data(raw): cache geoBoundaries ADM3 ward fallback boundaries")

# 4. Pipeline Python Modules
commit_file("pipeline/__init__.py", "feat(pipeline): initialize pipeline Python package")
commit_file("pipeline/normalize.py", "feat(pipeline): add string normalization and county code mappings")
commit_file("pipeline/kdhs.py", "feat(pipeline): add KDHS 2022 PDF parser for stunting and facility deliveries")
commit_file("pipeline/census.py", "feat(pipeline): add KNBS 2019 Census demographic and socio-economic extractor")
commit_file("pipeline/facilities.py", "feat(pipeline): add KMHFL health facilities and OSM school counts aggregator")
commit_file("pipeline/spatial.py", "feat(pipeline): add Africa Albers equal-area calculations and boundary simplifier")
commit_file("pipeline/validate.py", "feat(pipeline): add census totals verification and tolerance checks")
commit_file("pipeline/run.py", "feat(pipeline): add command-line runner for end-to-end data processing")
commit_file("data/unmatched.csv", "docs(pipeline): record unmatched administrative units audit report")

# 5. Processed National Boundary Layers
commit_file("data/processed/counties.geojson", "feat(data): export Level 1 counties GeoJSON with 20+ indicators")
commit_file("data/processed/subcounties.geojson", "feat(data): export Level 2 sub-counties GeoJSON")
commit_file("data/processed/wards.geojson", "feat(data): export Level 3 electoral wards GeoJSON")
commit_file("data/processed/villages_points.geojson", "feat(data): export Level 4 populated place points GeoJSON")
commit_file("data/processed/villages.geojson", "feat(data): create villages.geojson alias for populated places")
commit_file("public/data/counties.geojson", "feat(web): deploy processed counties GeoJSON to public directory")
commit_file("public/data/subcounties.geojson", "feat(web): deploy processed sub-counties GeoJSON to public directory")

# 6. Partitioned Datasets by County (47 Counties - 2 commits each = 94 commits)
COUNTY_NAMES = {
    1: "Mombasa", 2: "Kwale", 3: "Kilifi", 4: "Tana River", 5: "Lamu",
    6: "Taita Taveta", 7: "Garissa", 8: "Wajir", 9: "Mandera", 10: "Marsabit",
    11: "Isiolo", 12: "Meru", 13: "Tharaka-Nithi", 14: "Embu", 15: "Kitui",
    16: "Machakos", 17: "Makueni", 18: "Nyandarua", 19: "Nyeri", 20: "Kirinyaga",
    21: "Murang'a", 22: "Kiambu", 23: "Turkana", 24: "West Pokot", 25: "Samburu",
    26: "Trans Nzoia", 27: "Uasin Gishu", 28: "Elgeyo-Marakwet", 29: "Nandi", 30: "Baringo",
    31: "Laikipia", 32: "Nakuru", 33: "Narok", 34: "Kajiado", 35: "Kericho",
    36: "Bomet", 37: "Kakamega", 38: "Vihiga", 39: "Bungoma", 40: "Busia",
    41: "Siaya", 42: "Kisumu", 43: "Homa Bay", 44: "Migori", 45: "Kisii",
    46: "Nyamira", 47: "Nairobi"
}

for c_code, c_name in COUNTY_NAMES.items():
    # 6a. Wards partition for this county
    f_p_ward = f"data/processed/by_county/{c_code}/wards.geojson"
    f_w_ward = f"public/data/wards_{c_code}.geojson"
    files_w = [f for f in [f_p_ward, f_w_ward] if os.path.exists(f)]
    for f in files_w:
        run_git(["add", f])
    if files_w:
        run_git(["commit", "-m", f"feat(data): partition Level 3 wards GeoJSON for {c_name} (County {c_code})"])

    # 6b. Villages partition for this county
    f_p_vill = f"data/processed/by_county/{c_code}/villages.geojson"
    f_w_vill = f"public/data/villages_{c_code}.geojson"
    files_v = [f for f in [f_p_vill, f_w_vill] if os.path.exists(f)]
    for f in files_v:
        run_git(["add", f])
    if files_v:
        run_git(["commit", "-m", f"feat(data): partition Level 4 village points for {c_name} (County {c_code})"])

# 7. Frontend Types & Utilities
commit_file("src/types/indicators.ts", "feat(types): define demographic indicator catalog, units, and availability")
commit_file("src/types/map.ts", "feat(types): define color palettes, scale types, breadcrumbs, and tooltip models")
commit_file("src/utils/colorScales.ts", "feat(utils): implement Quantile, Jenks, and Linear classification scales")
commit_file("src/utils/geojsonLoader.ts", "feat(utils): implement client GeoJSON fetcher with in-memory caching")
commit_file("src/utils/exportUtils.ts", "feat(utils): implement CSV, PDF factsheets, and GeoJSON export helpers")

# 8. Frontend UI Components
commit_file("src/components/ApiKeyModal.tsx", "feat(components): add dialog for Google Maps JavaScript API key setup")
commit_file("src/components/TopNav.tsx", "feat(components): add header with breadcrumb navigation and autocomplete search")
commit_file("src/components/SidebarControls.tsx", "feat(components): add sidebar controls for hierarchy, indicators, and palettes")
commit_file("src/components/Legend.tsx", "feat(components): add interactive choropleth legend with class breaks and citations")
commit_file("src/components/HoverTooltip.tsx", "feat(components): add floating hover tooltip card displaying ranks and stats")
commit_file("src/components/AreaProfileModal.tsx", "feat(components): add individual area profile modal with CSV, PDF, and GeoJSON exports")
commit_file("src/components/MapContainer.tsx", "feat(components): add Google Maps Data layer container with choropleth styling")

# 9. Application Pages & Styles
commit_file("src/app/globals.css", "style: add global base styles, scrollbar styling, and dark theme support")
commit_file("src/app/layout.tsx", "feat(app): configure root HTML layout and metadata")
commit_file("src/app/page.tsx", "feat(app): assemble interactive choropleth atlas page with state management and drill-down")

# 10. Documentation
commit_file("README.md", "docs: add comprehensive project README with setup, architecture, and licensing details")

# Final verification
res = run_git(["rev-list", "--count", "HEAD"])
count = int(res.stdout.strip()) if res.stdout.strip().isdigit() else 0
print(f"\n==========================================")
print(f"Total Git Commits Created: {count}")
print(f"==========================================")
