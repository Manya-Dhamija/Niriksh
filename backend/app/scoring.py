"""
Niriksh V1 scoring engine.

Design principle: the Project Feasibility Score is a WEIGHTED, RULE-BASED
composite of individually-normalized factor scores. There is no black-box
model here — every function below is a documented, deterministic
transformation from a raw physical/geospatial measurement to a 0-100 score.
Weights live in weights.json and can be re-tuned without touching code.

This keeps the score auditable: a developer (or regulator, or lender's
technical advisor) can trace exactly why a site scored the way it did,
which is a hard requirement for anything used in real investment
decisions. Machine learning / climate simulation can be layered in later
(see README > Future Expansion) as ADDITIONAL factors or as a calibration
step on top of this transparent baseline — never as a replacement for it.
"""
from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Callable, NamedTuple

WEIGHTS_PATH = Path(__file__).parent / "weights.json"


def load_weights() -> dict[str, float]:
    data = json.loads(WEIGHTS_PATH.read_text())
    return {k: v for k, v in data.items() if not k.startswith("_")}


def clamp(value: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, value))


def rating_for(score: float) -> str:
    if score >= 85:
        return "excellent"
    if score >= 70:
        return "good"
    if score >= 50:
        return "moderate"
    if score >= 30:
        return "poor"
    return "critical"


class FactorDef(NamedTuple):
    key: str
    label: str
    unit: str
    source: str
    scorer: Callable[[dict], tuple[float, float, str]]  # raw -> (score, raw_value, explanation)


# --------------------------------------------------------------------------
# Individual factor scoring functions
# Each takes the site's `raw` dict and returns (score_0_100, raw_value_shown, explanation)
# --------------------------------------------------------------------------

def score_solar_resource(raw: dict) -> tuple[float, float, str]:
    ghi = raw["ghi_kwh_m2_day"]
    # Linear map across India's realistic GHI range (3.5-6.3 kWh/m2/day)
    score = clamp((ghi - 3.5) / (6.3 - 3.5) * 100)
    explanation = (
        f"Long-term average GHI of {ghi:.2f} kWh/m²/day. India's utility-scale "
        f"sites range roughly 3.5–6.3 kWh/m²/day; this site sits "
        f"{'in the top tier' if ghi >= 5.6 else 'in the mid-to-upper range' if ghi >= 5.0 else 'in the lower range'} "
        "nationally."
    )
    return score, ghi, explanation


def score_terrain(raw: dict) -> tuple[float, float, str]:
    slope = raw["avg_slope_percent"]
    score = clamp(100 - slope * 15)
    explanation = (
        f"Average slope of {slope:.1f}% derived from a 30m DEM. Slopes under ~2% need "
        "minimal grading for fixed-tilt or single-axis tracker rows; above ~5% earthworks "
        "cost rises sharply."
    )
    return score, slope, explanation


LAND_COVER_BASE_SCORE = {
    "barren": 95,
    "desert": 95,
    "scrub": 82,
    "grassland": 80,
    "fallow": 62,
    "wasteland": 90,
    "cropland": 35,
    "forest": 8,
    "wetland": 5,
    "built-up": 0,
}


def _land_cover_base(land_cover: str) -> float:
    lc = land_cover.lower()
    for key, val in LAND_COVER_BASE_SCORE.items():
        if key in lc:
            return val
    return 55  # unknown / mixed category, conservative middle score


def score_land_use(raw: dict) -> tuple[float, float, str]:
    base = _land_cover_base(raw["land_cover"])
    conflict = raw.get("land_cover_conflict", "")
    penalty = 25 if "high" in conflict.lower() else 10 if "moderate" in conflict.lower() else 0
    score = clamp(base - penalty)
    explanation = (
        f"Classified as '{raw['land_cover']}' (ESA WorldCover-style land cover). "
        f"Land-use conflict assessment: {conflict or 'not flagged'}."
    )
    return score, base - penalty, explanation


def score_road_access(raw: dict) -> tuple[float, float, str]:
    d = raw["distance_to_paved_road_km"]
    score = clamp(100 - d * 8)
    explanation = (
        f"Nearest paved road is {d:.1f} km away (OpenStreetMap). Shorter distances reduce "
        "construction logistics cost and heavy-transport lead time for modules/trackers."
    )
    return score, d, explanation


def score_grid_proximity(raw: dict) -> tuple[float, float, str]:
    d = raw["distance_to_substation_km"]
    score = clamp(100 - d * 6)
    sub = raw.get("substation_name", "nearest substation")
    explanation = (
        f"{d:.1f} km to {sub}. Interconnection cost scales roughly linearly with transmission "
        "line length; distances beyond ~15 km typically require a dedicated pooling "
        "substation and materially change project economics."
    )
    return score, d, explanation


def score_environmental_constraints(raw: dict) -> tuple[float, float, str]:
    d = raw["nearest_protected_area_km"]
    score = clamp(d * 2.5)
    name = raw.get("nearest_protected_area_name", "nearest protected area")
    explanation = (
        f"{d:.0f} km from {name} (WDPA protected-area boundary). Closer proximity raises "
        "the likelihood of wildlife clearance, EIA scrutiny, or buffer-zone restrictions."
    )
    return score, d, explanation


FLOOD_SCORE = {"low": 95, "moderate": 55, "high": 15}


def score_flood_exposure(raw: dict) -> tuple[float, float, str]:
    zone = raw["flood_zone"]
    score = FLOOD_SCORE.get(zone, 50)
    explanation = f"Flood exposure classified '{zone}'. Basis: {raw.get('flood_basis', 'regional flood atlas review')}."
    return score, score, explanation


def score_extreme_heat(raw: dict) -> tuple[float, float, str]:
    days = raw["extreme_heat_days_above_40c"]
    score = clamp(100 - days * 0.6)
    explanation = (
        f"~{days} days/year above 40°C (IMD climate normals). Elevated module temperatures "
        "reduce output via the PV temperature coefficient (typically -0.3 to -0.4%/°C above "
        "25°C) and increase thermal stress on inverters and cabling."
    )
    return score, days, explanation


WATER_STRESS_BASE = {
    "safe": 90,
    "semi-critical": 65,
    "critical": 40,
    "over-exploited": 25,
}


def score_water_availability(raw: dict) -> tuple[float, float, str]:
    category = raw["water_stress_category"].lower()
    base = 50
    for key, val in WATER_STRESS_BASE.items():
        if key in category:
            base = val
            break
    depth = raw.get("groundwater_depth_m", 30)
    depth_penalty = clamp(depth / 3, 0, 20)
    score = clamp(base - depth_penalty)
    explanation = (
        f"CGWB category: {raw['water_stress_category']}; groundwater depth ~{depth:.0f} m. "
        "Utility-scale solar has low operational water demand (panel washing, minimal "
        "landscaping) but constrained water still affects construction and O&M logistics."
    )
    return score, depth, explanation


FACTOR_DEFINITIONS: list[FactorDef] = [
    FactorDef("solar_resource", "Solar Resource (GHI)", "kWh/m²/day",
              "Global Solar Atlas (long-term climatology)", score_solar_resource),
    FactorDef("terrain", "Terrain: Elevation & Slope", "% avg slope",
              "SRTM 30m / Copernicus GLO-30 DEM", score_terrain),
    FactorDef("land_use", "Land Use / Land Cover", "category",
              "ESA WorldCover (Sentinel-2 derived)", score_land_use),
    FactorDef("road_access", "Road Accessibility", "km to paved road",
              "OpenStreetMap", score_road_access),
    FactorDef("grid_proximity", "Transmission / Substation Proximity", "km to substation",
              "OpenStreetMap power infrastructure + CEA/POSOCO public maps", score_grid_proximity),
    FactorDef("environmental_constraints", "Environmental Constraints", "km to protected area",
              "WDPA (World Database on Protected Areas)", score_environmental_constraints),
    FactorDef("flood_exposure", "Flood Exposure", "risk class",
              "India CWC Flood Atlas / historical monsoon records", score_flood_exposure),
    FactorDef("extreme_heat", "Extreme Heat / Climate Risk", "days/yr > 40°C",
              "IMD climate normals (1991-2020)", score_extreme_heat),
    FactorDef("water_availability", "Water Availability", "stress category",
              "CGWB groundwater assessment", score_water_availability),
]


def compute_factor_scores(raw: dict) -> list[dict]:
    weights = load_weights()
    results = []
    for fdef in FACTOR_DEFINITIONS:
        score, raw_value, explanation = fdef.scorer(raw)
        results.append({
            "key": fdef.key,
            "label": fdef.label,
            "score": round(score, 1),
            "weight": weights[fdef.key],
            "raw_value": raw_value,
            "unit": fdef.unit,
            "rating": rating_for(score),
            "explanation": explanation,
            "source": fdef.source,
        })
    return results


def compute_overall_score(factors: list[dict]) -> float:
    total = sum(f["score"] * f["weight"] for f in factors)
    return round(clamp(total), 1)


def recommendation_for(score: float) -> tuple[str, str]:
    if score >= 85:
        return "Highly Suitable", (
            "Strong performance across nearly all factors. This site is a strong candidate "
            "for advancing to detailed technical due diligence (ground survey, geotechnical, "
            "grid connectivity study)."
        )
    if score >= 70:
        return "Suitable", (
            "Favorable overall profile with one or more factors needing closer review before "
            "committing capital. Recommended for shortlisting alongside a targeted risk "
            "mitigation review of the lower-scoring factors below."
        )
    if score >= 55:
        return "Moderate", (
            "Mixed profile. Viable in principle but likely to face elevated cost or approval "
            "friction on specific factors. Warrants a comparative screen against alternative "
            "sites before further investment."
        )
    if score >= 40:
        return "High Risk", (
            "Multiple constraining factors. Proceeding would likely require significant "
            "mitigation spend (e.g. long transmission tie-in, environmental clearance, "
            "earthworks) that should be quantified before any commitment."
        )
    return "Not Recommended", (
        "Fundamental constraints across several factors make this site a poor candidate for "
        "utility-scale solar in its current form. Recommend screening alternative sites."
    )


def build_advantages_and_risks(factors: list[dict]) -> tuple[list[str], list[str]]:
    advantages, risks = [], []
    for f in factors:
        line = f"{f['label']}: {f['explanation']}"
        if f["rating"] in ("excellent", "good"):
            advantages.append(line)
        elif f["rating"] in ("poor", "critical"):
            risks.append(line)
    return advantages, risks


# --------------------------------------------------------------------------
# Generation estimate — simplified, transparent P50-style pre-feasibility yield
# --------------------------------------------------------------------------

PERFORMANCE_RATIO_BY_TECH = {
    "mono_perc": 0.80,
    "bifacial": 0.82,
    "thin_film": 0.78,
}


def estimate_generation(ghi_kwh_m2_day: float, capacity_mw: float, module_technology: str) -> dict:
    pr = PERFORMANCE_RATIO_BY_TECH.get(module_technology, 0.80)
    annual_ghi_kwh_m2 = ghi_kwh_m2_day * 365
    specific_yield = annual_ghi_kwh_m2 * pr  # kWh per kWp per year
    capacity_kwp = capacity_mw * 1000
    annual_kwh = capacity_kwp * specific_yield
    annual_gwh = annual_kwh / 1_000_000
    return {
        "capacity_mw": capacity_mw,
        "performance_ratio": pr,
        "specific_yield_kwh_per_kwp": round(specific_yield, 1),
        "annual_generation_gwh": round(annual_gwh, 2),
        "annual_generation_basis": (
            f"Simplified P50 estimate: Annual Energy = Capacity(kWp) x Annual GHI(kWh/m²) x "
            f"Performance Ratio ({pr}). Ignores DC/AC oversizing, tracker gain, tilt "
            "optimisation, soiling schedule and inter-row shading — refine with PVsyst/SAM "
            "for a bankable yield estimate."
        ),
    }
