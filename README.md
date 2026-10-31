# Kenya Demographic Atlas & Interactive Choropleth Map

An interactive Google Maps web application visualizing Kenya's 4-tier administrative hierarchy (**County → Sub-County → Ward → Village / Populated Place**) as dynamic choropleths driven by public demographic and survey data.

Built with **Next.js (App Router, TypeScript)**, **Tailwind CSS**, and the **Google Maps JavaScript API Data layer**, powered by an automated Python GIS data pipeline.

---

## Features

- **Multi-Level Administrative Hierarchy**:
  - **Level 1 — Counties (47)**: National overview across all 47 constitutionally established counties.
  - **Level 2 — Sub-Counties (290)**: Administrative constituencies with localized socio-economic indicators.
  - **Level 3 — Wards (1,450)**: County electoral wards with baseline populations and health facility accessibility.
  - **Level 4 — Villages / Populated Places (10,392 points)**: Real OpenStreetMap / KNBS settlement points (villages, hamlets, towns) classified by settlement type.
- **20+ Public Demographic Indicators**:
  - *Population & Structure*: Total population, population density (equal-area planar km²), sex ratio, % children under 15, % elderly 65+, average household size, conventional household count.
  - *Growth & Urbanization*: 2009–2019 population growth rate, urban vs. rural share.
  - *Health & Wellbeing*: Child stunting prevalence (KDHS 2022), facility-based delivery rate, skilled birth attendance rate, total fertility rate (TFR), teenage pregnancy rate, health facility density (per 10,000 population).
  - *Education & Schools*: School attendance rate, education completion rate, school density (per 1,000 children under 15), total school count.
  - *Living Conditions & Economy*: Mains electricity access %, solar power access %, improved drinking water source %, improved sanitation %, farming/agriculture livelihood share %, internet usage rate %.
- **Level-Aware Indicator Filtering**:
  - Non-applicable indicators for a given administrative level are cleanly disabled with an informative `(Not available at this level)` indicator, ensuring users are never presented with fabricated or interpolated data.
- **Choropleth Controls**:
  - Color palettes (Viridis, Plasma, YlGnBu, Blues, Greens, Oranges) designed with color-blind safety.
  - Classification algorithms: Quantile, Natural Breaks (Jenks), and Equal Interval (Linear).
  - Real-time polygon fill opacity slider.
  - Base map styles: Dark Mode, Light Mode, Satellite Imagery, Terrain.
- **Interaction & Navigation**:
  - **Hover Tooltip**: Displays unit name, parent county/sub-county hierarchy, active metric, national/subnational rank (e.g. `#3 of 47`), population, area, and density.
  - **Click-to-Drill-Down**: Clicking a county zooms into its boundary and lazy-loads child sub-counties, wards, or villages.
  - **Interactive Breadcrumb**: `Kenya > [County] > [Sub-County] > [Ward]` with one-click drill-up.
  - **Autocomplete Search**: Instant lookup for any County, Sub-County, or Ward with auto-centering and zoom.
  - **Legend**: Dynamic class break ranges, missing data swatches, and data source citations.
- **Exporting**:
  - **Individual Area Export (CSV, PDF, GeoJSON)**: Click any County, Sub-County, Ward, or Village to view its complete profile and export:
    - **CSV**: Comprehensive tabular profile listing all demographic, health, and economic indicators.
    - **PDF Factsheet**: Illustrated factsheet with Kenya header branding, KPI summary cards (Population, Area, Density, Households), and categorized indicator tables.
    - **GeoJSON**: Standalone GeoJSON file containing the exact polygon boundary or point geometry and all attributes.
  - **Bulk CSV Export**: Downloads a tabular dataset of the current administrative view with all computed metrics and unit codes.
  - **Map PNG Export**: Captures a high-resolution screenshot of the map viewport and legend.

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18+ or v20+ (tested with v25)
- **Python**: 3.10+ (tested with Python 3.14)
- **Google Maps JavaScript API Key**

### 2. Quick Setup

```bash
# Clone or navigate to the repository
cd "d:/KE Demographic Map"

# Install JavaScript dependencies
npm install

# Run the data pipeline (reproduces /data/processed from raw sources)
python -m pipeline.run

# Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Google Maps API Key Configuration

The Google Maps API key is never hard-coded and can be provided in two ways:

### Option A: Environment Variable (Recommended for Production)
1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Edit `.env.local` and paste your key:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...YourKeyHere...
   ```
3. Restart the Next.js server (`npm run dev`).

### Option B: In-App API Key Modal
- If no environment variable is detected, the application provides an **"API Key"** button in the top navigation bar.
- Enter your key directly into the dialog; it is stored safely in your browser's `localStorage` and persists across sessions.

#### How to Obtain a Free Google Maps API Key:
1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Create or select a project.
3. Navigate to **APIs & Services > Library**, search for **Maps JavaScript API**, and click **Enable**.
4. Go to **APIs & Services > Credentials** and click **Create Credentials > API Key**.
5. *(Recommended)* Under **API restrictions**, restrict the key to the **Maps JavaScript API**.

---

## Data Pipeline (`python -m pipeline.run`)

The Python pipeline in `/pipeline` reproduces all processed boundaries and demographics in `/data/processed` and `/public/data`:

```bash
python -m pipeline.run
```

### Pipeline Architecture:
- `pipeline/normalize.py`: Normalizes spelling variants, Swahili/English designations, punctuation, and maps units to official KNBS/IEBC county codes (1–47) and OCHA PCODEs (`KE001`–`KE047`).
- `pipeline/kdhs.py`: Extracts county-level maternal health, child nutrition (stunting), fertility, and teenage pregnancy rates from the 2022 Kenya Demographic and Health Survey (KDHS PR143 Key Indicators Report / DHS REST API).
- `pipeline/census.py`: Processes Volumes I, II, III, and IV of the 2019 Kenya Population and Housing Census, extracting population totals, sex ratios, age group distributions (% <15 and % 65+), household sizes, urbanization shares, and socio-economic amenities (electricity, water, sanitation, agriculture).
- `pipeline/facilities.py`: Aggregates 8,932 accredited health facilities from the Kenya Master Health Facility List (KMHFL) and 14,881 schools from HOTOSM/MOE to compute facility density rates per capita.
- `pipeline/spatial.py`: Projects geometries using **Africa Albers Equal Area Conic** (`+proj=aea +lat_1=20 +lat_2=-23 +lat_0=0 +lon_0=25 +datum=WGS84 +units=m +no_defs`) to calculate true planar surface areas in km², derives accurate population densities, simplifies polygon boundaries with topology preservation, and partitions sub-county and ward files by county for fast client-side lazy loading.
- `pipeline/validate.py`: Verifies county sums against official national census totals, verifies tolerance (<0.1%), and outputs unmatched records to `/data/unmatched.csv`.

---

## Validation Checks & Tolerances

The pipeline executes automated validation checks against official KNBS 2019 Census benchmarks:

| Benchmark Indicator | Official National 2019 Census | Pipeline County Sum | Absolute Discrepancy | Relative Difference | Validation Status |
|---|---|---|---|---|---|
| **Total Population** | 47,564,296 | 47,564,316 | 20 | **0.00004%** | PASSED (<0.1% tolerance) |
| **Conventional Households** | 12,143,913 | 12,143,913 | 0 | **0.000%** | PASSED (Exact match) |
| **County Feature Count** | 47 | 47 | 0 | **0.0%** | PASSED (All 47 counties present) |

*Unmatched boundary and tabular units are logged to [`/data/unmatched.csv`](file:///d:/KE%20Demographic%20Map/data/unmatched.csv) for auditability.*

---

## Data Sources & Licences

Detailed provenance records are documented in [`/data/SOURCES.md`](file:///d:/KE%20Demographic%20Map/data/SOURCES.md):

1. **OCHA COD-AB Kenya (2019/2020)**:
   - Source: [Humanitarian Data Exchange (HDX)](https://data.humdata.org/dataset/cod-ab-ken)
   - Licence: Creative Commons Attribution for Intergovernmental Organisations (CC BY-IGO)
2. **IEBC Electoral Wards (1,450 Wards)**:
   - Source: Independent Electoral and Boundaries Commission (IEBC) / HDX
   - Licence: Creative Commons Attribution International (CC BY 4.0)
3. **OpenStreetMap Populated Places (Villages & Settlements)**:
   - Source: Humanitarian OpenStreetMap Team (HOTOSM) / OSM Contributors
   - Licence: Open Database License (ODbL)
4. **KNBS 2019 Kenya Population and Housing Census (Volumes I–IV)**:
   - Source: Kenya National Bureau of Statistics (KNBS) / `rKenyaCensus`
   - Licence: Government of Kenya Open Data Policy / CC BY 4.0
5. **2022 Kenya Demographic and Health Survey (KDHS)**:
   - Source: KNBS, Ministry of Health, and ICF (The DHS Program)
   - Licence: Open survey dataset / public report
6. **Kenya Master Health Facility List (KMHFL)**:
   - Source: Ministry of Health, Republic of Kenya
   - Licence: CC BY 4.0
7. **Kenya Education Facilities**:
   - Source: HOTOSM / Ministry of Education Open Data
   - Licence: Open Database License (ODbL)

---

## Limitations

1. **Village-Level Polygons**: Official sub-location and village administrative boundaries in Kenya do not exist as legally standardized national polygon shapefiles. In accordance with GIS best practices, point locations (`place=village`, `place=hamlet`, `place=town`) with geographical coordinates are used instead of synthetic polygons.
2. **Differing Reference Years**: The Population and Housing Census was conducted in August 2019, while the Kenya Demographic and Health Survey (KDHS) Key Indicators Report was released in 2022/2023, and health/education facility registries reflect 2020–2024 updates. Reference years are clearly indicated in the UI and legend footer.
3. **Administrative Boundary Splits**: Certain sub-counties have experienced administrative subdivisions or naming differences between the 290 parliamentary constituencies (IEBC) and administrative deputy county commissioner sub-counties (KNBS). The pipeline handles these using official PCODE joins and normalized name fallbacks documented in `/data/unmatched.csv`.

