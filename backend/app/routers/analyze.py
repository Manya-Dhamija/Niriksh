from fastapi import APIRouter, HTTPException

from ..data_sites import DEMO_SITES
from ..geo_utils import (
    geometry_stats,
    interpolate_raw_factors,
    polygon_from_geojson,
    square_polygon_around,
)
from ..map_layers import build_layers
from ..schemas import AnalyzeRequest, DataSource, FeasibilityReport, GenerationEstimate, LatLng
from ..scoring import (
    build_advantages_and_risks,
    compute_factor_scores,
    compute_overall_score,
    estimate_generation,
    recommendation_for,
)

router = APIRouter(prefix="/api", tags=["analyze"])

DATA_SOURCES = [
    DataSource(dataset="Global Solar Atlas", provider="World Bank / ESMAP / Solargis",
               description="Long-term average GHI & DNI irradiance", resolution="~250m, cached climatology",
               access_mode="cached_reference"),
    DataSource(dataset="SRTM / Copernicus GLO-30 DEM", provider="NASA / ESA",
               description="Elevation and slope derivation", resolution="30m",
               access_mode="cached_reference"),
    DataSource(dataset="ESA WorldCover", provider="ESA (Sentinel-2 derived)",
               description="Land use / land cover classification", resolution="10m",
               access_mode="cached_reference"),
    DataSource(dataset="OpenStreetMap", provider="OSM contributors",
               description="Roads and power transmission infrastructure", resolution="vector",
               access_mode="cached_reference"),
    DataSource(dataset="WDPA", provider="UNEP-WCMC / IUCN",
               description="Protected area boundaries for environmental constraint screening",
               resolution="vector", access_mode="cached_reference"),
    DataSource(dataset="CWC Flood Atlas", provider="Central Water Commission, India",
               description="Historical flood exposure zoning", resolution="district/basin level",
               access_mode="cached_reference"),
    DataSource(dataset="IMD Climate Normals (1991-2020)", provider="India Meteorological Department",
               description="Extreme heat day frequency and seasonal max temperature",
               resolution="station-interpolated", access_mode="cached_reference"),
    DataSource(dataset="CGWB Groundwater Assessment", provider="Central Ground Water Board, India",
               description="Water stress category and groundwater depth", resolution="block level",
               access_mode="cached_reference"),
]

ASSUMPTIONS = [
    "V1 uses a cached, source-attributed snapshot of each dataset rather than a live API call — see 'Data sources' for provenance and README for how to wire in live fetches.",
    "Generation estimate is a simplified P50 pre-feasibility figure (Capacity x Annual GHI x Performance Ratio) and excludes tracker gain, tilt optimisation, DC/AC oversizing, and detailed soiling/shading losses.",
    "Grid tie-in line and protected-area buffer shown on the map are illustrative distance indicators, not surveyed routes or boundaries.",
    "Scoring weights are configurable (backend/app/weights.json) and reflect a general-purpose utility-scale screening profile — adjust per your organisation's risk appetite.",
]


def _report_from_raw(
    raw: dict,
    site_name: str,
    state: str,
    centroid_lat: float,
    centroid_lng: float,
    area_hectares: float,
    capacity_mw: float,
    module_technology: str,
    site_polygon,
    data_mode: str,
    data_mode_note: str,
) -> FeasibilityReport:
    factors = compute_factor_scores(raw)
    overall = compute_overall_score(factors)
    recommendation, summary = recommendation_for(overall)
    advantages, risks = build_advantages_and_risks(factors)
    generation = estimate_generation(raw["ghi_kwh_m2_day"], capacity_mw, module_technology)
    layers = build_layers(site_polygon, centroid_lat, centroid_lng, raw, site_name)

    return FeasibilityReport(
        site_name=site_name,
        state=state,
        centroid=LatLng(lat=centroid_lat, lng=centroid_lng),
        area_hectares=area_hectares,
        capacity_mw=capacity_mw,
        module_technology=module_technology,
        overall_score=overall,
        recommendation=recommendation,
        recommendation_summary=summary,
        factors=factors,
        advantages=advantages,
        risks=risks,
        generation_estimate=GenerationEstimate(**generation),
        map_layers=layers,
        data_sources=DATA_SOURCES,
        assumptions=ASSUMPTIONS,
        data_mode=data_mode,
        data_mode_note=data_mode_note,
    )


@router.post("/analyze", response_model=FeasibilityReport)
def analyze(req: AnalyzeRequest):
    if not req.site_id and not req.polygon:
        raise HTTPException(400, "Provide either site_id or a polygon")

    if req.site_id:
        site = DEMO_SITES.get(req.site_id)
        if not site:
            raise HTTPException(404, f"Unknown demo site '{req.site_id}'")
        poly = square_polygon_around(site["lat"], site["lng"], site["polygon_hint_km"])
        stats = geometry_stats(poly)
        return _report_from_raw(
            raw=site["raw"],
            site_name=site["name"],
            state=site["state"],
            centroid_lat=stats["centroid_lat"],
            centroid_lng=stats["centroid_lng"],
            area_hectares=stats["area_hectares"],
            capacity_mw=req.capacity_mw,
            module_technology=req.module_technology,
            site_polygon=poly,
            data_mode="cached_demo_site",
            data_mode_note=(
                f"Using cached reference dataset for {site['name']} ({site['state']}). "
                "All factor values are real, source-attributed regional figures — see Data Sources."
            ),
        )

    # Custom polygon path
    poly = polygon_from_geojson(req.polygon.coordinates)
    if not poly.is_valid or poly.area == 0:
        raise HTTPException(400, "Invalid or degenerate polygon")
    stats = geometry_stats(poly)
    raw, nearest_name, nearest_dist_km = interpolate_raw_factors(
        stats["centroid_lat"], stats["centroid_lng"]
    )
    return _report_from_raw(
        raw=raw,
        site_name="Custom Drawn Site",
        state="—",
        centroid_lat=stats["centroid_lat"],
        centroid_lng=stats["centroid_lng"],
        area_hectares=stats["area_hectares"],
        capacity_mw=req.capacity_mw,
        module_technology=req.module_technology,
        site_polygon=poly,
        data_mode="interpolated_custom_site",
        data_mode_note=(
            f"No cached dataset covers this exact location. Factor values are inverse-"
            f"distance-weighted interpolations from Niriksh's 5 reference sites (nearest: "
            f"{nearest_name}, {nearest_dist_km} km away). Treat this as an indicative "
            "screen only — run a full data pull before committing capital."
        ),
    )
