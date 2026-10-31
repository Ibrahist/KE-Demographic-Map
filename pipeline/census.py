"""
KNBS 2019 Population and Housing Census processing module.
Extracts and computes demographic, age-structure, urban/rural, and socio-economic indicators
at County and Sub-County levels.
"""
import pandas as pd
import pyreadr
from typing import Dict, Any, Tuple
from pipeline.normalize import normalize_county_name, normalize_subcounty_name, get_county_code, COUNTY_DISPLAY_MAP

def load_county_census_data() -> Dict[int, Dict[str, Any]]:
    """
    Loads and merges all 2019 Census indicators for the 47 counties.
    """
    county_data: Dict[int, Dict[str, Any]] = {c: {"county_code": c, "name": COUNTY_DISPLAY_MAP[c]} for c in range(1, 48)}
    
    # 1. 2019 Census County Baseline Table (Total Pop, Sex, HH, 2009 Pop, Growth)
    df_base = pd.read_csv("data/raw/2019_census_county.csv")
    for _, row in df_base.iterrows():
        c_name = str(row['County'])
        c_code = get_county_code(c_name)
        if c_code:
            def clean_num(val):
                if pd.isna(val): return 0.0
                s = str(val).replace(',', '').strip()
                try: return float(s)
                except ValueError: return 0.0
                
            pop_19 = clean_num(row.get('Total_Population19'))
            pop_male = clean_num(row.get('Male populatio 2019'))
            pop_female = clean_num(row.get('Female population 2019'))
            hh = clean_num(row.get('Households'))
            avg_hh = clean_num(row.get('Av_HH_Size'))
            land_area = clean_num(row.get('LandArea'))
            density = clean_num(row.get('Population Density'))
            pop_09 = clean_num(row.get('Population in 2009'))
            
            growth_pct = round(((pop_19 - pop_09) / pop_09 * 100), 2) if pop_09 > 0 else 0.0
            sex_ratio = round((pop_male / pop_female * 100), 2) if pop_female > 0 else 100.0
            
            county_data[c_code].update({
                "pop_total": int(pop_19),
                "pop_male": int(pop_male),
                "pop_female": int(pop_female),
                "sex_ratio": sex_ratio,
                "households": int(hh),
                "avg_hh_size": avg_hh,
                "land_area_census": land_area,
                "pop_density_census": density,
                "pop_2009": int(pop_09),
                "growth_rate": growth_pct,
            })

    # 2. 5-Year Age Groups from OCHA COD-PS (ken_admpop_adm1_2019.csv)
    # Computes % under 15 and % 65+
    try:
        df_age = pd.read_csv("data/raw/ken_admpop_adm1_2019.csv")
        for _, row in df_age.iterrows():
            c_name = str(row.get('ADM1_NAME', ''))
            c_code = get_county_code(c_name)
            if c_code:
                tot = float(row.get('T_TL', 0))
                if tot > 0:
                    under_15 = float(row.get('T_00_04', 0)) + float(row.get('T_05_09', 0)) + float(row.get('T_10_14', 0))
                    # 65+ sum
                    above_65_cols = ['T_65_69', 'T_70_74', 'T_75_79', 'T_80_84', 'T_85_89', 'T_90_94', 'T_95_99', 'T_100Plus']
                    above_65 = sum(float(row.get(col, 0)) for col in above_65_cols)
                    
                    county_data[c_code].update({
                        "pct_under_15": round(under_15 / tot * 100, 2),
                        "pct_above_65": round(above_65 / tot * 100, 2),
                    })
    except Exception as e:
        print("Warning reading age groups:", e)

    # 3. Urban vs Rural Population Shares (V2_T2.2, V2_T2.2a, V2_T2.2b)
    try:
        df_tot = list(pyreadr.read_r("data/raw/V2_T2.2.rda").values())[0]
        df_rur = list(pyreadr.read_r("data/raw/V2_T2.2a.rda").values())[0]
        df_urb = list(pyreadr.read_r("data/raw/V2_T2.2b.rda").values())[0]
        
        urb_map = {}
        for _, r in df_urb.iterrows():
            code = get_county_code(str(r['County']))
            if code:
                urb_map[code] = float(r.get('Sex_Total', 0))
                
        for _, r in df_tot.iterrows():
            code = get_county_code(str(r['County']))
            if code:
                tot_p = float(r.get('Sex_Total', 0))
                urb_p = urb_map.get(code, 0.0)
                if tot_p > 0:
                    u_share = round(urb_p / tot_p * 100, 2)
                    r_share = round((100.0 - u_share), 2)
                    county_data[code].update({
                        "urban_share": u_share,
                        "rural_share": r_share,
                    })
    except Exception as e:
        print("Warning reading urban/rural shares:", e)

    # 4. Volume IV Socio-Economic Tables
    # 4.1 Lighting / Electricity Access (V4_T2.19)
    try:
        df_light = list(pyreadr.read_r("data/raw/V4_T2.19.rda").values())[0]
        df_light_c = df_light[df_light['AdminArea'] == 'County']
        for _, r in df_light_c.iterrows():
            code = get_county_code(str(r['County']))
            if code:
                county_data[code]['electricity_access_pct'] = round(float(r.get('MainsElectricity', 0)), 2)
                county_data[code]['solar_access_pct'] = round(float(r.get('Solar', 0)), 2)
    except Exception as e:
        print("Warning reading V4_T2.19:", e)

    # 4.2 Drinking Water / Improved Water (V4_T2.15)
    try:
        df_water = list(pyreadr.read_r("data/raw/V4_T2.15.rda").values())[0]
        df_water_c = df_water[df_water['AdminArea'] == 'County']
        improved_cols = [
            'ProtectedSpring', 'ProtectedWell', 'Borehole/TubeWell',
            'Pipedintodwelling', 'Pipedtoyard/Plot', 'Bottledwater',
            'Rain/Harvestedwater', 'Publictap/Standpipe'
        ]
        for _, r in df_water_c.iterrows():
            code = get_county_code(str(r['County']))
            if code:
                imp_sum = sum(float(r.get(c, 0)) for c in improved_cols)
                county_data[code]['improved_water_pct'] = round(imp_sum, 2)
    except Exception as e:
        print("Warning reading V4_T2.15:", e)

    # 4.3 Human Waste Disposal / Improved Sanitation (V4_T2.16)
    try:
        df_san = list(pyreadr.read_r("data/raw/V4_T2.16.rda").values())[0]
        df_san_c = df_san[df_san['AdminArea'] == 'County']
        improved_san_cols = [
            'MainSewer', 'SepticTank', 'VipLatrine',
            'PitLatrine_Covered', 'BioSepticTank/Biodigester'
        ]
        for _, r in df_san_c.iterrows():
            code = get_county_code(str(r['County']))
            if code:
                imp_san = sum(float(r.get(c, 0)) for c in improved_san_cols)
                county_data[code]['improved_sanitation_pct'] = round(imp_san, 2)
    except Exception as e:
        print("Warning reading V4_T2.16:", e)

    # 4.4 Agriculture / Farming Livelihood (V4_T2.20)
    try:
        df_agri = list(pyreadr.read_r("data/raw/V4_T2.20.rda").values())[0]
        df_agri_c = df_agri[df_agri['AdminArea'] == 'County']
        for _, r in df_agri_c.iterrows():
            code = get_county_code(str(r['County']))
            if code:
                tot_hh = float(r.get('Total', 0))
                farming_hh = float(r.get('Farming', 0))
                if tot_hh > 0:
                    county_data[code]['agriculture_livelihood_pct'] = round(farming_hh / tot_hh * 100, 2)
    except Exception as e:
        print("Warning reading V4_T2.20:", e)

    # 4.5 Internet Usage (V4_T2.33)
    try:
        df_ict = list(pyreadr.read_r("data/raw/V4_T2.33.rda").values())[0]
        df_ict_c = df_ict[df_ict['AdminArea'] == 'County']
        for _, r in df_ict_c.iterrows():
            code = get_county_code(str(r['County']))
            if code:
                county_data[code]['internet_usage_pct'] = round(float(r.get('UoI_Total_Perc', 0)), 2)
    except Exception as e:
        print("Warning reading V4_T2.33:", e)

    # 4.6 School Attendance (V4_T2.2) & Education Completion (V4_T2.5)
    try:
        df_att = list(pyreadr.read_r("data/raw/V4_T2.2.rda").values())[0]
        for _, r in df_att.iterrows():
            if str(r.get('Gender', '')) == 'Total':
                code = get_county_code(str(r.get('SubCounty', '')))
                if code and 'school_attendance_pct' not in county_data[code]:
                    county_data[code]['school_attendance_pct'] = round(float(r.get('StillinSchool_Perc', 0)), 2)
                    
        df_edu = list(pyreadr.read_r("data/raw/V4_T2.5.rda").values())[0]
        for _, r in df_edu.iterrows():
            if str(r.get('Gender', '')) == 'Total':
                code = get_county_code(str(r.get('SubCounty', '')))
                if code and 'literacy_rate_pct' not in county_data[code]:
                    tot_pop = float(r.get('Total', 0))
                    if tot_pop > 0:
                        completed = (
                            float(r.get('Primary', 0)) +
                            float(r.get('Secondary', 0)) +
                            float(r.get('TVET', 0)) +
                            float(r.get('University', 0))
                        )
                        county_data[code]['literacy_rate_pct'] = round(completed / tot_pop * 100, 2)
    except Exception as e:
        print("Warning reading education tables:", e)

    return county_data

def load_subcounty_census_data() -> Dict[str, Dict[str, Any]]:
    """
    Loads Sub-County indicators from 2019 Census datasets.
    Keyed by (county_code, normalized_subcounty_name).
    """
    subcounty_data: Dict[str, Dict[str, Any]] = {}
    
    # 1. Age groups & Pop total by Sub-County from ken_admpop_2019.xlsx
    try:
        xl = pd.ExcelFile("data/raw/ken_admpop_2019.xlsx")
        df_adm2 = xl.parse("ken_admpop_ADM2_2019")
        for _, r in df_adm2.iterrows():
            c_code = get_county_code(str(r['ADM1_NAME']))
            sc_raw = str(r['ADM2_NAME'])
            sc_norm = normalize_subcounty_name(sc_raw)
            key = f"{c_code}_{sc_norm}"
            
            tot = float(r.get('T_TL', 0))
            male = float(r.get('M_TL', 0))
            female = float(r.get('F_TL', 0))
            under_15 = float(r.get('T_00_04', 0)) + float(r.get('T_05_09', 0)) + float(r.get('T_10_14', 0))
            above_65_cols = ['T_65_69', 'T_70_74', 'T_75_79', 'T_80_84', 'T_85_89', 'T_90_94', 'T_95_99', 'T_100Plus']
            above_65 = sum(float(r.get(c, 0)) for c in above_65_cols)
            
            subcounty_data[key] = {
                "county_code": c_code,
                "county_name": COUNTY_DISPLAY_MAP.get(c_code, str(r['ADM1_NAME'])),
                "subcounty_name": sc_raw,
                "pop_total": int(tot),
                "pop_male": int(male),
                "pop_female": int(female),
                "sex_ratio": round(male / female * 100, 2) if female > 0 else 100.0,
                "pct_under_15": round(under_15 / tot * 100, 2) if tot > 0 else 0.0,
                "pct_above_65": round(above_65 / tot * 100, 2) if tot > 0 else 0.0,
            }
    except Exception as e:
        print("Warning loading subcounty age pop:", e)

    # 2. Volume IV Sub-County Data: Electricity, Water, Sanitation, Farming, Internet
    try:
        df_light = list(pyreadr.read_r("data/raw/V4_T2.19.rda").values())[0]
        for _, r in df_light[df_light['AdminArea'] == 'SubCounty'].iterrows():
            c_code = get_county_code(str(r['County']))
            sc_norm = normalize_subcounty_name(str(r['SubCounty']))
            key = f"{c_code}_{sc_norm}"
            if key in subcounty_data:
                subcounty_data[key]['electricity_access_pct'] = round(float(r.get('MainsElectricity', 0)), 2)
                hh_val = r.get('ConventionalHouseholds')
                if pd.notna(hh_val):
                    subcounty_data[key]['households'] = int(float(hh_val))

        df_water = list(pyreadr.read_r("data/raw/V4_T2.15.rda").values())[0]
        improved_cols = [
            'ProtectedSpring', 'ProtectedWell', 'Borehole/TubeWell',
            'Pipedintodwelling', 'Pipedtoyard/Plot', 'Bottledwater',
            'Rain/Harvestedwater', 'Publictap/Standpipe'
        ]
        for _, r in df_water[df_water['AdminArea'] == 'SubCounty'].iterrows():
            c_code = get_county_code(str(r['County']))
            sc_norm = normalize_subcounty_name(str(r['SubCounty']))
            key = f"{c_code}_{sc_norm}"
            if key in subcounty_data:
                imp = sum(float(r.get(c, 0)) for c in improved_cols)
                subcounty_data[key]['improved_water_pct'] = round(imp, 2)

        df_san = list(pyreadr.read_r("data/raw/V4_T2.16.rda").values())[0]
        san_cols = ['MainSewer', 'SepticTank', 'VipLatrine', 'PitLatrine_Covered', 'BioSepticTank/Biodigester']
        for _, r in df_san[df_san['AdminArea'] == 'SubCounty'].iterrows():
            c_code = get_county_code(str(r['County']))
            sc_norm = normalize_subcounty_name(str(r['SubCounty']))
            key = f"{c_code}_{sc_norm}"
            if key in subcounty_data:
                subcounty_data[key]['improved_sanitation_pct'] = round(sum(float(r.get(c, 0)) for c in san_cols), 2)

        df_agri = list(pyreadr.read_r("data/raw/V4_T2.20.rda").values())[0]
        for _, r in df_agri[df_agri['AdminArea'] == 'SubCounty'].iterrows():
            c_code = get_county_code(str(r['County']))
            sc_norm = normalize_subcounty_name(str(r['SubCounty']))
            key = f"{c_code}_{sc_norm}"
            if key in subcounty_data:
                tot_h = float(r.get('Total', 0))
                farm_h = float(r.get('Farming', 0))
                if tot_h > 0:
                    subcounty_data[key]['agriculture_livelihood_pct'] = round(farm_h / tot_h * 100, 2)

        df_ict = list(pyreadr.read_r("data/raw/V4_T2.33.rda").values())[0]
        for _, r in df_ict[df_ict['AdminArea'] == 'SubCounty'].iterrows():
            c_code = get_county_code(str(r['County']))
            sc_norm = normalize_subcounty_name(str(r['SubCounty']))
            key = f"{c_code}_{sc_norm}"
            if key in subcounty_data:
                subcounty_data[key]['internet_usage_pct'] = round(float(r.get('UoI_Total_Perc', 0)), 2)
    except Exception as e:
        print("Warning loading subcounty volume IV tables:", e)

    return subcounty_data
