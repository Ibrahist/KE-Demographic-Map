"""
KDHS 2022 extraction module for county health and wellbeing indicators.
Extracts:
- Child Stunting (% children under 5 with height-for-age < -2 SD)
- Facility-based Deliveries (% of births in a health facility)
- Skilled Birth Attendance (% of births attended by skilled provider)
- Total Fertility Rate (TFR)
- Teenage Pregnancy Rate (% teenagers who have begun childbearing)
"""
import pymupdf
import re
from typing import Dict, Any
from pipeline.normalize import normalize_county_name, COUNTY_CODE_MAP, COUNTY_DISPLAY_MAP

def clean_row_name(text: str) -> str:
    s = text.replace('’', "'").replace('‘', "'")
    s = s.replace('/', ' ').replace('-', ' ').replace("'", "")
    return re.sub(r'\s+', ' ', s).strip()

def extract_kdhs_indicators(pdf_path: str = "data/raw/kdhs_2022_key_indicators.pdf") -> Dict[int, Dict[str, float]]:
    """
    Extracts county indicators from KDHS 2022 Key Indicators Report (PR143).
    Returns mapping: county_code -> indicator dictionary.
    """
    doc = pymupdf.open(pdf_path)
    indicators: Dict[int, Dict[str, float]] = {c: {} for c in range(1, 48)}
    
    # 1. Table 10C: Maternal Care / Facility Deliveries (Pages 37-38, 0-indexed 36-37)
    for p_no in [36, 37]:
        page = doc[p_no]
        words = page.get_text('words')
        lines: Dict[float, list] = {}
        for w in words:
            if 140 < w[1] < 790: # Table rows
                y_key = round(w[1] / 6.0) * 6.0
                lines.setdefault(y_key, []).append(w)
                
        for y in sorted(lines.keys()):
            row_words = sorted(lines[y], key=lambda x: x[0])
            row_text = " ".join(w[4] for w in row_words)
            cleaned_row = clean_row_name(row_text)
            
            for c_code, c_display in COUNTY_DISPLAY_MAP.items():
                target_name = clean_row_name(c_display)
                pattern = r'\b' + re.escape(target_name) + r'\b'
                m = re.search(pattern, cleaned_row, re.IGNORECASE)
                if m and m.start() < 30:
                    nums = re.findall(r'\b\d+(?:\.\d+)?\b', cleaned_row[m.end():])
                    # 1: ANC skilled, 2: ANC 4+, 3: Iron, 4: Tetanus, 5: N,
                    # 6: Skilled delivery (%), 7: Facility delivery (%)
                    if len(nums) >= 7:
                        try:
                            skilled_deliv = float(nums[5])
                            facility_deliv = float(nums[6])
                            indicators[c_code]['skilled_birth_pct'] = skilled_deliv
                            indicators[c_code]['facility_births_pct'] = facility_deliv
                        except ValueError:
                            pass
                    break

    # 2. Table 14C: Child Nutritional Status / Stunting (Pages 54-55, 0-indexed 53-54)
    for p_no in [53, 54]:
        page = doc[p_no]
        words = page.get_text('words')
        lines = {}
        for w in words:
            if 140 < w[1] < 790:
                y_key = round(w[1] / 6.0) * 6.0
                lines.setdefault(y_key, []).append(w)
                
        for y in sorted(lines.keys()):
            row_words = sorted(lines[y], key=lambda x: x[0])
            row_text = " ".join(w[4] for w in row_words)
            cleaned_row = clean_row_name(row_text)
            
            for c_code, c_display in COUNTY_DISPLAY_MAP.items():
                target_name = clean_row_name(c_display)
                pattern = r'\b' + re.escape(target_name) + r'\b'
                m = re.search(pattern, cleaned_row, re.IGNORECASE)
                if m and m.start() < 30:
                    nums = re.findall(r'\b\d+(?:\.\d+)?\b', cleaned_row[m.end():])
                    # Height-for-age: 1: Severe stunting (<-3 SD), 2: Stunted (<-2 SD)
                    if len(nums) >= 2:
                        try:
                            stunting_pct = float(nums[1])
                            indicators[c_code]['stunting_pct'] = stunting_pct
                        except ValueError:
                            pass
                    break

    # 3. Table 6C: Teenage Pregnancy (Pages 27-28, 0-indexed 26-27)
    for p_no in [26, 27]:
        page = doc[p_no]
        words = page.get_text('words')
        lines = {}
        for w in words:
            if 140 < w[1] < 790:
                y_key = round(w[1] / 6.0) * 6.0
                lines.setdefault(y_key, []).append(w)
                
        for y in sorted(lines.keys()):
            row_words = sorted(lines[y], key=lambda x: x[0])
            row_text = " ".join(w[4] for w in row_words)
            cleaned_row = clean_row_name(row_text)
            
            for c_code, c_display in COUNTY_DISPLAY_MAP.items():
                target_name = clean_row_name(c_display)
                pattern = r'\b' + re.escape(target_name) + r'\b'
                m = re.search(pattern, cleaned_row, re.IGNORECASE)
                if m and m.start() < 30:
                    nums = re.findall(r'\b\d+(?:\.\d+)?\b', cleaned_row[m.end():])
                    # 1: Live birth, 2: Pregnant first child, 3: Begun childbearing
                    if len(nums) >= 3:
                        try:
                            teenage_preg_pct = float(nums[2])
                            indicators[c_code]['teenage_pregnancy_pct'] = teenage_preg_pct
                        except ValueError:
                            pass
                    break

    # 4. Total Fertility Rate (TFR) by County from DHS API 2022
    DHS_2022_TFR = {
        1: 2.9, 2: 4.2, 3: 3.4, 4: 5.7, 5: 4.6, 6: 3.5, 7: 5.3, 8: 6.8, 9: 7.7,
        10: 5.1, 11: 4.1, 12: 3.1, 13: 2.8, 14: 2.6, 15: 3.9, 16: 3.2, 17: 3.1,
        18: 2.8, 19: 2.8, 20: 2.3, 21: 2.7, 22: 2.6, 23: 5.3, 24: 5.6, 25: 6.3,
        26: 3.9, 27: 3.2, 28: 3.5, 29: 3.4, 30: 3.8, 31: 3.2, 32: 3.4, 33: 4.9,
        34: 3.4, 35: 3.5, 36: 3.6, 37: 3.6, 38: 3.2, 39: 3.9, 40: 3.7, 41: 3.5,
        42: 3.3, 43: 3.7, 44: 4.2, 45: 3.2, 46: 2.9, 47: 2.6,
    }
    
    for c_code, tfr in DHS_2022_TFR.items():
        indicators[c_code]['fertility_rate'] = tfr

    return indicators
