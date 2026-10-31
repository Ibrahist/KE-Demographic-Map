# Data Sources and Provenance Documentation

This document records the official public data sources collected and cached in `/data/raw` for the Kenya Demographic Interactive Choropleth Map application. All sources are public, legally reusable, and credited below.

---

## 1. Administrative Boundaries

### 1.1 Kenya Administrative Level 0, 1 (County), and 2 (Sub-County) Boundaries (COD-AB)
- **Publisher / Organization:** United Nations Office for the Coordination of Humanitarian Affairs (OCHA) / Survey of Kenya (SoK) / Independent Electoral and Boundaries Commission (IEBC)
- **Dataset Name:** Kenya - Subnational Administrative Boundaries (COD-AB)
- **Source URL:** [https://data.humdata.org/dataset/cod-ab-ken](https://data.humdata.org/dataset/cod-ab-ken)
- **Publication Date:** 2019-10-31 (Updated 2020)
- **Licence:** Creative Commons Attribution for Intergovernmental Organisations (CC BY-IGO)
- **Raw Files:**
  - `data/raw/ken_admin_boundaries.geojson.zip`
  - `data/raw/cod_ab/ken_admin1.geojson` (47 Counties)
  - `data/raw/cod_ab/ken_admin2.geojson` (290 Sub-Counties / Constituencies)
  - `data/raw/cod_ab/ken_adminlines.geojson`
- **Coverage & Features:** 47 Counties with official PCODEs (`KE001` to `KE047`), 290 Sub-Counties with `adm2_pcode` (`KE027144`, etc.), validated geographic areas, centroids, and parent hierarchy relationships.

### 1.2 Kenya County Electoral Wards (1,450 Wards)
- **Publisher / Organization:** Independent Electoral and Boundaries Commission (IEBC) / Kenya Ministry of Health DHIS2 / Humanitarian Data Exchange (HDX)
- **Dataset Name:** Administrative Wards in Kenya 1450
- **Source URL:** [https://data.humdata.org/dataset/administrative-wards-in-kenya-1450](https://data.humdata.org/dataset/administrative-wards-in-kenya-1450)
- **Publication Date:** 2019 (Topology cleaned)
- **Licence:** Creative Commons Attribution International (CC BY 4.0)
- **Raw Files:**
  - `data/raw/kenya_wards.zip`
  - `data/raw/wards/Kenya_Wards/kenya_wards.shp`
- **Coverage & Features:** 1,450 administrative and electoral wards across all 47 counties, containing county name, sub-county name, ward name, unique ward ID (`uid`), subcounty ID (`scuid`), county ID (`cuid`), and 2009 census baseline population (`pop2009`).

### 1.3 geoBoundaries Kenya Boundaries (ADM0, ADM1, ADM2, ADM3)
- **Publisher / Organization:** William & Mary geoBoundaries Open Database
- **Dataset Name:** geoBoundaries Kenya (gbOpen)
- **Source URL:** [https://www.geoboundaries.org/](https://www.geoboundaries.org/) / [https://github.com/wmgeolab/geoBoundaries](https://github.com/wmgeolab/geoBoundaries)
- **Publication Date:** 2021
- **Licence:** Open Data Commons Open Database License (ODbL) / CC BY 4.0
- **Raw Files:**
  - `data/raw/gb_adm1.geojson` (County Level)
  - `data/raw/gb_adm2.geojson` (Sub-County Level)
  - `data/raw/gb_adm3.geojson` (Ward Level - 1,452 units)
- **Coverage & Features:** Topological boundary fallback and reference geometry validation.

### 1.4 OpenStreetMap Populated Places & Villages (Point Locations)
- **Publisher / Organization:** Humanitarian OpenStreetMap Team (HOTOSM) / OpenStreetMap Contributors
- **Dataset Name:** Populated Places of Kenya
- **Source URL:** [https://data.humdata.org/dataset/hotosm_ken_populated_places](https://data.humdata.org/dataset/hotosm_ken_populated_places)
- **Publication Date:** Continuous updates (Exported 2024)
- **Licence:** Open Database License (ODbL)
- **Raw Files:**
  - `data/raw/hotosm_ken_populated_places.zip`
  - `data/raw/osm_places/populated_places.geojson`
- **Coverage & Features:** 34,033 real point locations in Kenya (8,706 villages, 1,085 hamlets, 415 towns, 16 cities), with coordinates, place classification (`village`, `town`, `hamlet`), and pre-tagged administrative county (`adm1_name`, `adm1_pcode`) and sub-county (`adm2_name`, `adm2_pcode`). No artificial polygons are fabricated at the village level; point geometries are preserved as required.

---

## 2. Demographic & Census Data

### 2.1 2019 Kenya Population and Housing Census (KNBS) - Volumes I, II, III & IV
- **Publisher / Organization:** Kenya National Bureau of Statistics (KNBS), Republic of Kenya
- **Repository / Package:** `rKenyaCensus` (transcribed from official KNBS Census Reports Vol I-IV by Shelmith Kariuki) & OCHA COD-PS
- **Source URLs:**
  - Official KNBS Portal: [https://www.knbs.or.ke/](https://www.knbs.or.ke/)
  - rKenyaCensus Package: [https://github.com/Shelmith-Kariuki/rKenyaCensus](https://github.com/Shelmith-Kariuki/rKenyaCensus)
  - OCHA Kenya Subnational Population Statistics (COD-PS): [https://data.humdata.org/dataset/cod-ps-ken](https://data.humdata.org/dataset/cod-ps-ken)
  - HDX Population Report: [https://data.humdata.org/dataset/kenya-population-per-county-from-census-report-2019](https://data.humdata.org/dataset/kenya-population-per-county-from-census-report-2019)
- **Publication Date:** November 2019 / February 2020
- **Licence:** Government of Kenya Open Data Policy / Creative Commons Attribution (CC BY 4.0 / CC BY-IGO)
- **Raw Files:**
  - `data/raw/2019_census_county.csv` (County totals, sex, households, density, land area, 2009 pop, pop change)
  - `data/raw/2019_census_subcounty.xlsx` (Sub-county demographic distributions)
  - `data/raw/ken_admpop_2019.xlsx` & `ken_admpop_adm1_2019.csv` (Official 5-year age groups: 0-4, 5-9, ..., 80+ by sex)
  - `data/raw/V2_T2.2.rda`, `V2_T2.2a.rda`, `V2_T2.2b.rda` (Total, Rural, and Urban populations by county)
  - `data/raw/V4_T2.2.rda` (School Attendance by county & sub-county)
  - `data/raw/V4_T2.5.rda` (Educational Attainment & Literacy by county & sub-county)
  - `data/raw/V4_T2.15.rda` (Main Source of Drinking Water by county & sub-county)
  - `data/raw/V4_T2.16.rda` (Human Waste Disposal / Sanitation by county & sub-county)
  - `data/raw/V4_T2.19.rda` (Main Type of Lighting Fuel / Electricity Access by county & sub-county)
  - `data/raw/V4_T2.20.rda` (Households practicing Farming / Agriculture by county & sub-county)
  - `data/raw/V4_T2.33.rda` (Internet & Computer usage by county & sub-county)
- **Coverage & Features:**
  - Total Population, Male, Female, Sex Ratio
  - Age structure (% children <15, % elderly 65+, dependency ratio)
  - Average Household Size, Total Households
  - Population Growth Rate (2009–2019 intercensal growth)
  - Urbanization (urban vs rural population share)
  - Socio-economic amenities: Mains electricity %, Improved water source %, Improved sanitation %, Main livelihood agriculture %

---

## 3. Health & Wellbeing Data

### 3.1 2022 Kenya Demographic and Health Survey (KDHS)
- **Publisher / Organization:** Kenya National Bureau of Statistics (KNBS), Ministry of Health (MoH), and ICF (The DHS Program)
- **Report Title:** Kenya Demographic and Health Survey 2022 - Key Indicators Report (PR143) / Final Report (FR380)
- **Source URL:** [https://dhsprogram.com/pubs/pdf/PR143/PR143.pdf](https://dhsprogram.com/pubs/pdf/PR143/PR143.pdf) & DHS Program REST API (`https://api.dhsprogram.com/rest/dhs/data?countryIds=KE&surveyIds=KE2022DHS`)
- **Publication Date:** January 2023
- **Licence:** Publicly released survey report; DHS open data policy
- **Raw Files:**
  - `data/raw/kdhs_2022_key_indicators.pdf`
- **Coverage & Features:**
  - Child nutrition: Stunting prevalence (% height-for-age < -2 SD) across 47 counties (Table 14C)
  - Maternal health: Facility-based delivery rate (% births in health facilities) across 47 counties (Table 10C)
  - Skilled birth attendance rate (% births attended by skilled provider)
  - Total Fertility Rate (TFR) and Teenage Pregnancy Rate (Table 6C)
  - Full vaccination coverage rate (Table 11C)

### 3.2 Kenya Master Health Facility List (KMHFL)
- **Publisher / Organization:** Ministry of Health (MoH), Government of Kenya
- **Dataset Name:** Health facilities in Kenya
- **Source URL:** [http://kmhfl.health.go.ke/](http://kmhfl.health.go.ke/) / [https://data.humdata.org/dataset/kenya-health-facilities-in-kenya](https://data.humdata.org/dataset/kenya-health-facilities-in-kenya)
- **Publication Date:** 2017 (Updated regularly via KMHFL API)
- **Licence:** Creative Commons Attribution International (CC BY 4.0)
- **Raw Files:**
  - `data/raw/kenya_health_facilities.xlsx`
- **Coverage & Features:** 8,932 accredited health facilities across Kenya, tagged with County, Sub-County, Ward, Facility Type (Dispensary, Health Centre, Hospital), Ownership (Public, Faith-Based, Private), and bed capacity. Allows calculating Health Facilities per 10,000 population at County, Sub-County, and Ward levels.

---

## 4. Education & Infrastructure Data

### 4.1 Kenya Education Facilities
- **Publisher / Organization:** Humanitarian OpenStreetMap Team (HOTOSM) & Ministry of Education (MOE Kenya Open Data)
- **Dataset Name:** Education Facilities of Kenya
- **Source URL:** [https://data.humdata.org/dataset/hotosm_ken_education_facilities](https://data.humdata.org/dataset/hotosm_ken_education_facilities)
- **Publication Date:** 2024
- **Licence:** Open Database License (ODbL)
- **Raw Files:**
  - `data/raw/hotosm_ken_education_facilities.zip`
  - `data/raw/osm_education/education_facilities.geojson`
- **Coverage & Features:** 14,881 geocoded schools and educational institutions across Kenya, tagged with administrative county and sub-county attributes. Enables computing School Density per 1,000 children (<15 years) per county and sub-county.

---

## Summary of Administrative Level Coverage

| Admin Level | Name | Boundary Source | Feature Count | Available Demographic & Survey Indicators |
|---|---|---|---|---|
| **Level 1** | **County** | OCHA COD-AB `ken_admin1.geojson` | 47 | All 18 indicators: Population, Density, Sex Ratio, % <15, % 65+, HH Size, 2009-19 Growth Rate, Urban Share, Stunting %, Facility Deliveries %, TFR, Health Facilities / 10k, Schools / 1k children, Literacy %, School Attendance %, Electricity Access %, Improved Water %, Improved Sanitation %, Agriculture Share % |
| **Level 2** | **Sub-County** | OCHA COD-AB `ken_admin2.geojson` | 290 | Population, Density, Sex Ratio, % <15, % 65+, HH Size, Households, Health Facilities / 10k, Schools / 1k children, Electricity Access %, Improved Water %, Improved Sanitation %, Agriculture Share %, School Attendance %, Literacy % |
| **Level 3** | **Ward** | IEBC `Kenya_Wards.shp` | 1,450 | Population, Area, Density, 2009 Baseline Population, Health Facility Count / Density |
| **Level 4** | **Village / Sub-Location** | HOTOSM `populated_places.geojson` | 34,033 (8,706 villages) | Real point locations, place classification (`village`, `hamlet`, `town`), parent hierarchy (County & Sub-County links) |

