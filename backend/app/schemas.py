"""
Pydantic models defining the Niriksh API contract.

Kept deliberately explicit (rather than loose dicts) so the scoring
methodology and its inputs/outputs are self-documenting and typed
end-to-end between backend and frontend.
"""
from __future__ import annotations

from typing import Literal, Optional
from pydantic import BaseModel, Field


class LatLng(BaseModel):
    lat: float
    lng: float


class GeoJSONPolygon(BaseModel):
    type: Literal["Polygon"] = "Polygon"
    coordinates: list[list[list[float]]]  # GeoJSON ring order: [lng, lat]


class DemoSiteSummary(BaseModel):
    id: str
    name: str
    state: str
    lat: float
    lng: float
    description: str


class AnalyzeRequest(BaseModel):
    site_id: Optional[str] = Field(
        default=None, description="Use one of the predefined demo site IDs"
    )
    polygon: Optional[GeoJSONPolygon] = Field(
        default=None, description="Custom drawn site boundary (GeoJSON Polygon, WGS84)"
    )
    capacity_mw: float = Field(gt=0, le=2000, description="Planned AC capacity in MW")
    module_technology: Literal["mono_perc", "bifacial", "thin_film"] = "bifacial"


class FactorScore(BaseModel):
    key: str
    label: str
    score: float  # 0-100
    weight: float  # 0-1, sums to 1 across all factors
    raw_value: float
    unit: str
    rating: Literal["excellent", "good", "moderate", "poor", "critical"]
    explanation: str
    source: str


class DataSource(BaseModel):
    dataset: str
    provider: str
    description: str
    resolution: str
    access_mode: Literal["cached_reference", "live_api"]


class GenerationEstimate(BaseModel):
    capacity_mw: float
    performance_ratio: float
    specific_yield_kwh_per_kwp: float
    annual_generation_gwh: float
    annual_generation_basis: str


class MapLayer(BaseModel):
    id: str
    label: str
    kind: Literal["marker", "circle", "polygon", "line", "heat_point"]
    geojson: dict
    style: dict


class FeasibilityReport(BaseModel):
    site_name: str
    state: str
    centroid: LatLng
    area_hectares: float
    capacity_mw: float
    module_technology: str

    overall_score: float
    recommendation: Literal[
        "Highly Suitable", "Suitable", "Moderate", "High Risk", "Not Recommended"
    ]
    recommendation_summary: str

    factors: list[FactorScore]
    advantages: list[str]
    risks: list[str]

    generation_estimate: Optional[GenerationEstimate]
    map_layers: list[MapLayer]
    data_sources: list[DataSource]
    assumptions: list[str]

    data_mode: Literal["cached_demo_site", "interpolated_custom_site"]
    data_mode_note: str
