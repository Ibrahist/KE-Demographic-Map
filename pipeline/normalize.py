"""
Normalization utilities for administrative unit names and codes across Kenya datasets.
"""
import re

# Official 47 Kenyan Counties with standard names and official County Codes (1-47)
COUNTY_CODE_MAP = {
    "MOMBASA": 1,
    "KWALE": 2,
    "KILIFI": 3,
    "TANA RIVER": 4,
    "LAMU": 5,
    "TAITA TAVETA": 6,
    "GARISSA": 7,
    "WAJIR": 8,
    "MANDERA": 9,
    "MARSABIT": 10,
    "ISIOLO": 11,
    "MERU": 12,
    "THARAKA NITHI": 13,
    "EMBU": 14,
    "KITUI": 15,
    "MACHAKOS": 16,
    "MAKUENI": 17,
    "NYANDARUA": 18,
    "NYERI": 19,
    "KIRINYAGA": 20,
    "MURANGA": 21,
    "KIAMBU": 22,
    "TURKANA": 23,
    "WEST POKOT": 24,
    "SAMBURU": 25,
    "TRANS NZOIA": 26,
    "UASIN GISHU": 27,
    "ELGEYO MARAKWET": 28,
    "NANDI": 29,
    "BARINGO": 30,
    "LAIKIPIA": 31,
    "NAKURU": 32,
    "NAROK": 33,
    "KAJIADO": 34,
    "KERICHO": 35,
    "BOMET": 36,
    "KAKAMEGA": 37,
    "VIHIGA": 38,
    "BUNGOMA": 39,
    "BUSIA": 40,
    "SIAYA": 41,
    "KISUMU": 42,
    "HOMA BAY": 43,
    "MIGORI": 44,
    "KISII": 45,
    "NYAMIRA": 46,
    "NAIROBI": 47,
}

# Standard display names
COUNTY_DISPLAY_MAP = {
    1: "Mombasa",
    2: "Kwale",
    3: "Kilifi",
    4: "Tana River",
    5: "Lamu",
    6: "Taita Taveta",
    7: "Garissa",
    8: "Wajir",
    9: "Mandera",
    10: "Marsabit",
    11: "Isiolo",
    12: "Meru",
    13: "Tharaka-Nithi",
    14: "Embu",
    15: "Kitui",
    16: "Machakos",
    17: "Makueni",
    18: "Nyandarua",
    19: "Nyeri",
    20: "Kirinyaga",
    21: "Murang'a",
    22: "Kiambu",
    23: "Turkana",
    24: "West Pokot",
    25: "Samburu",
    26: "Trans Nzoia",
    27: "Uasin Gishu",
    28: "Elgeyo-Marakwet",
    29: "Nandi",
    30: "Baringo",
    31: "Laikipia",
    32: "Nakuru",
    33: "Narok",
    34: "Kajiado",
    35: "Kericho",
    36: "Bomet",
    37: "Kakamega",
    38: "Vihiga",
    39: "Bungoma",
    40: "Busia",
    41: "Siaya",
    42: "Kisumu",
    43: "Homa Bay",
    44: "Migori",
    45: "Kisii",
    46: "Nyamira",
    47: "Nairobi",
}

def normalize_county_name(name: str) -> str:
    """Normalize county name to match standard key."""
    if not name or not isinstance(name, str):
        return ""
    s = name.strip().upper()
    s = s.replace('/', ' ').replace('-', ' ').replace("'", "").replace('`', '')
    s = re.sub(r'\s+', ' ', s).strip()
    
    # Common variations and suffixes
    if "NAIROBI" in s:
        return "NAIROBI"
    if "THARAKA" in s:
        return "THARAKA NITHI"
    if "ELGEYO" in s or "MARAKWET" in s or "KEIYO" in s:
        return "ELGEYO MARAKWET"
    if "TAITA" in s or "TAVETA" in s:
        return "TAITA TAVETA"
    if "MURANG" in s:
        return "MURANGA"
    if "TRANS" in s and "NZOIA" in s:
        return "TRANS NZOIA"
    if "WEST" in s and "POKOT" in s:
        return "WEST POKOT"
    if "HOMA" in s and "BAY" in s:
        return "HOMA BAY"
    if "UASIN" in s and "GISHU" in s:
        return "UASIN GISHU"
    if "TANA" in s and "RIVER" in s:
        return "TANA RIVER"
        
    return s

def get_county_code(name: str) -> int:
    """Return official county code (1-47) or 0 if unmatched."""
    norm = normalize_county_name(name)
    return COUNTY_CODE_MAP.get(norm, 0)

def get_county_pcode(code: int) -> str:
    """Return OCHA COD-AB format PCODE (KE001 to KE047)."""
    return f"KE{code:03d}"

def normalize_subcounty_name(name: str) -> str:
    """Normalize sub-county name for robust matching."""
    if not name or not isinstance(name, str):
        return ""
    s = name.strip().upper()
    s = s.replace('/', ' ').replace('-', ' ').replace("'", "").replace('`', '')
    s = re.sub(r'\b(SUB[\s\-]*COUNTY|CONSTITUENCY|DISTRICT)\b', '', s)
    s = re.sub(r'\b(EAST|WEST|NORTH|SOUTH|CENTRAL|TOWNSHIP|URBAN|RURAL)\b', r'\1', s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s

