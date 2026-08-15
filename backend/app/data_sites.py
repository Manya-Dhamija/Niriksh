"""
Cached reference dataset for Niriksh V1 demo sites.

WHY CACHED DATA
----------------
V1 ships as a self-contained prototype that works with zero API keys and
zero external network access. Rather than fabricate numbers, every value
below is a representative snapshot compiled from the *type* of publicly
available dataset that would back it in production:

  - GHI / DNI (solar resource)      -> Global Solar Atlas (long-term avg, World Bank/ESMAP + Solargis)
  - Elevation / slope                -> SRTM 30m / Copernicus GLO-30 DEM
  - Land cover                       -> ESA WorldCover 10m (Sentinel-2 derived)
  - Roads                            -> OpenStreetMap
  - Substations / transmission       -> OpenStreetMap `power=substation` / `power=line` tags,
                                         cross-checked against POSOCO/CEA public transmission maps
  - Protected areas                  -> WDPA (World Database on Protected Areas)
  - Flood exposure                   -> India CWC Flood Atlas / historical monsoon flood records
  - Extreme heat                     -> IMD climate normals (1991-2020)
  - Water stress                     -> CGWB (Central Ground Water Board) categorisation

These five sites are real, publicly known utility-scale solar locations in
India. Numeric values are representative long-term climatological / geospatial
figures for each region at the resolution a pre-feasibility screen needs, NOT
a live pull for a specific date. This is stated explicitly in the API
response (`data_mode` + `data_sources`) and in the UI, so a developer never
mistakes this for a live measurement. See README "Data sources & limitations".
"""
from __future__ import annotations

DEMO_SITES: dict[str, dict] = {
    "bhadla": {
        "name": "Bhadla Solar Park Region",
        "state": "Rajasthan",
        "lat": 27.5350,
        "lng": 71.9190,
        "description": "Thar desert, Jodhpur district — one of the world's largest solar parks.",
        "polygon_hint_km": 3.0,
        "raw": {
            "ghi_kwh_m2_day": 5.85,
            "dni_kwh_m2_day": 6.35,
            "elevation_m": 222,
            "avg_slope_percent": 0.6,
            "land_cover": "barren / sparse vegetation (desert)",
            "land_cover_conflict": "minimal — low agricultural value, sparse settlement",
            "distance_to_paved_road_km": 4.5,
            "distance_to_substation_km": 2.1,
            "substation_name": "Bhadla 400kV GSS (existing solar park pooling station)",
            "nearest_protected_area_km": 38,
            "nearest_protected_area_name": "Desert National Park (buffer zone)",
            "flood_zone": "low",
            "flood_basis": "arid interior basin, negligible historical monsoon flooding",
            "avg_summer_max_temp_c": 46.5,
            "extreme_heat_days_above_40c": 110,
            "annual_rainfall_mm": 260,
            "groundwater_depth_m": 55,
            "water_stress_category": "over-exploited (CGWB)",
        },
    },
    "charanka": {
        "name": "Charanka Solar Park Region",
        "state": "Gujarat",
        "lat": 23.9000,
        "lng": 71.1900,
        "description": "Patan district, Little Rann of Kutch fringe — established solar park cluster.",
        "polygon_hint_km": 2.5,
        "raw": {
            "ghi_kwh_m2_day": 5.62,
            "dni_kwh_m2_day": 5.9,
            "elevation_m": 152,
            "avg_slope_percent": 0.8,
            "land_cover": "grassland / scrub, seasonal salt-affected land",
            "land_cover_conflict": "low — semi-arid grazing land, limited cropping",
            "distance_to_paved_road_km": 3.8,
            "distance_to_substation_km": 3.0,
            "substation_name": "Charanka 220kV Solar Park Substation",
            "nearest_protected_area_km": 22,
            "nearest_protected_area_name": "Nalsarovar Bird Sanctuary (approx. distance)",
            "flood_zone": "low",
            "flood_basis": "elevated plain above Rann seasonal inundation line",
            "avg_summer_max_temp_c": 42.0,
            "extreme_heat_days_above_40c": 75,
            "annual_rainfall_mm": 490,
            "groundwater_depth_m": 38,
            "water_stress_category": "semi-critical (CGWB)",
        },
    },
    "pavagada": {
        "name": "Pavagada Solar Park Region",
        "state": "Karnataka",
        "lat": 14.1000,
        "lng": 77.2800,
        "description": "Tumkur district, Deccan plateau — 2,050 MW park on leased farmland.",
        "polygon_hint_km": 2.5,
        "raw": {
            "ghi_kwh_m2_day": 5.55,
            "dni_kwh_m2_day": 5.7,
            "elevation_m": 652,
            "avg_slope_percent": 2.1,
            "land_cover": "dry scrubland / fallow agricultural (leased)",
            "land_cover_conflict": "moderate — drought-prone farmland leased from ~2,300 farmers",
            "distance_to_paved_road_km": 2.6,
            "distance_to_substation_km": 3.4,
            "substation_name": "Pavagada Pooling Sub-station (KPTCL 220kV)",
            "nearest_protected_area_km": 14,
            "nearest_protected_area_name": "Jayamangali Blackbuck Conservation Reserve",
            "flood_zone": "low",
            "flood_basis": "plateau drainage, no major river floodplain nearby",
            "avg_summer_max_temp_c": 38.5,
            "extreme_heat_days_above_40c": 18,
            "annual_rainfall_mm": 560,
            "groundwater_depth_m": 24,
            "water_stress_category": "over-exploited (CGWB) — chronic drought-prone taluk",
        },
    },
    "kurnool": {
        "name": "Kurnool Ultra Mega Solar Park Region",
        "state": "Andhra Pradesh",
        "lat": 15.8000,
        "lng": 78.0300,
        "description": "Kurnool district, near Tungabhadra/Krishna basin — 1,000 MW UMSP.",
        "polygon_hint_km": 2.8,
        "raw": {
            "ghi_kwh_m2_day": 5.68,
            "dni_kwh_m2_day": 5.95,
            "elevation_m": 278,
            "avg_slope_percent": 1.4,
            "land_cover": "scrubland / revenue wasteland",
            "land_cover_conflict": "low — designated government wasteland for the UMSP",
            "distance_to_paved_road_km": 5.5,
            "distance_to_substation_km": 4.2,
            "substation_name": "Kurnool UMSP 400kV Pooling Station",
            "nearest_protected_area_km": 28,
            "nearest_protected_area_name": "Rollapadu Wildlife Sanctuary",
            "flood_zone": "moderate",
            "flood_basis": "low-lying tracts near Hundri/Tungabhadra tributaries flood in heavy monsoon years",
            "avg_summer_max_temp_c": 43.0,
            "extreme_heat_days_above_40c": 60,
            "annual_rainfall_mm": 670,
            "groundwater_depth_m": 12,
            "water_stress_category": "semi-critical (CGWB)",
        },
    },
    "khavda": {
        "name": "Khavda Renewable Energy Park Region",
        "state": "Gujarat",
        "lat": 23.9500,
        "lng": 69.5000,
        "description": "Kutch district, Great Rann fringe — world's largest under-construction RE park.",
        "polygon_hint_km": 4.0,
        "raw": {
            "ghi_kwh_m2_day": 5.90,
            "dni_kwh_m2_day": 6.4,
            "elevation_m": 78,
            "avg_slope_percent": 0.4,
            "land_cover": "salt desert fringe / barren land (Rann)",
            "land_cover_conflict": "low population, but culturally significant pastoral (Banni grassland) land nearby",
            "distance_to_paved_road_km": 11.0,
            "distance_to_substation_km": 9.5,
            "substation_name": "Khavda 400/220kV Pooling Station (under phased construction)",
            "nearest_protected_area_km": 9,
            "nearest_protected_area_name": "Kutch Wild Ass Sanctuary",
            "flood_zone": "low",
            "flood_basis": "arid saline desert, seasonal Rann inundation stays well north of site",
            "avg_summer_max_temp_c": 44.0,
            "extreme_heat_days_above_40c": 95,
            "annual_rainfall_mm": 340,
            "groundwater_depth_m": 70,
            "water_stress_category": "over-exploited / saline aquifer (CGWB)",
        },
    },
}
