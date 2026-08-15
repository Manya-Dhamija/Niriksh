"""
Geospatial helper functions built on Shapely/GeoPandas.

Two responsibilities:
1. Real geometry math (centroid, area, default polygon generation) for
   whatever boundary the user gives us — a demo site or a hand-drawn polygon.
2. For CUSTOM (non-demo) sites, V1 has no live raster/vector data pipeline
   wired up (see .env.example NIRIKSH_ENABLE_LIVE_FETCH). Instead of
   fabricating numbers, we perform an explicit, labeled Inverse-Distance-
   Weighted interpolation from the 5 cached reference sites' real factor
   values. This is a legitimate, common geostatistical technique for a
   coarse pre-feasibility screen — and the API response makes clear this is
   `interpolated_custom_site`, not a direct measurement, at every layer of
   the response.
"""
from __future__ import annotations

import math

import geopandas as gpd
from shapely.geometry import Point, Polygon, shape

from .data_sites import DEMO_SITES

EARTH_RADIUS_KM = 6371.0


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * EARTH_RADIUS_KM * math.asin(math.sqrt(a))


def square_polygon_around(lat: float, lng: float, half_side_km: float) -> Polygon:
    """Build an approximate square GeoJSON-style polygon (WGS84) around a point."""
    dlat = half_side_km / 111.0
    dlng = half_side_km / (111.0 * max(math.cos(math.radians(lat)), 0.1))
    return Polygon([
        (lng - dlng, lat - dlat),
        (lng + dlng, lat - dlat),
        (lng + dlng, lat + dlat),
        (lng - dlng, lat + dlat),
        (lng - dlng, lat - dlat),
    ])


def polygon_from_geojson(coords: list[list[list[float]]]) -> Polygon:
    return shape({"type": "Polygon", "coordinates": coords})


def geometry_stats(poly: Polygon) -> dict:
    """Real area/centroid computation via GeoPandas with an equal-area CRS reprojection."""
    gdf = gpd.GeoDataFrame({"geometry": [poly]}, crs="EPSG:4326")
    # India-centric equal-area projection (World Cylindrical Equal Area) for honest hectare math
    gdf_ea = gdf.to_crs("EPSG:6933")
    area_hectares = float(gdf_ea.area.iloc[0]) / 10_000.0
    centroid = gdf.geometry.iloc[0].centroid
    return {
        "area_hectares": round(area_hectares, 2),
        "centroid_lat": round(centroid.y, 5),
        "centroid_lng": round(centroid.x, 5),
    }


def interpolate_raw_factors(lat: float, lng: float) -> dict:
    """
    Inverse-Distance-Weighted interpolation of the 5 cached reference sites'
    raw factor values, evaluated at an arbitrary (lat, lng). Numeric fields
    are blended by weight = 1/distance^2; categorical fields (land cover,
    flood zone, water stress category, names) are taken from the single
    nearest reference site, since categories can't be numerically blended.
    """
    distances = []
    for site_id, site in DEMO_SITES.items():
        d = haversine_km(lat, lng, site["lat"], site["lng"])
        distances.append((max(d, 1e-3), site))
    distances.sort(key=lambda x: x[0])

    nearest_d, nearest_site = distances[0]
    weights = [(1.0 / (d ** 2), site) for d, site in distances]
    total_w = sum(w for w, _ in weights)

    numeric_keys = [
        "ghi_kwh_m2_day", "dni_kwh_m2_day", "elevation_m", "avg_slope_percent",
        "distance_to_paved_road_km", "distance_to_substation_km",
        "nearest_protected_area_km", "avg_summer_max_temp_c",
        "extreme_heat_days_above_40c", "annual_rainfall_mm", "groundwater_depth_m",
    ]
    categorical_keys = [
        "land_cover", "land_cover_conflict", "substation_name", "flood_zone",
        "flood_basis", "nearest_protected_area_name", "water_stress_category",
    ]

    blended = {}
    for key in numeric_keys:
        blended[key] = sum(w * site["raw"][key] for w, site in weights) / total_w
    for key in categorical_keys:
        blended[key] = nearest_site["raw"][key]

    return blended, nearest_site["name"], round(nearest_d, 1)
