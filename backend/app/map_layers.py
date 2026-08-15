"""
Builds the GeoJSON map layers returned alongside a feasibility report.

Layers are intentionally simple geometric primitives (site polygon, point
markers, radius circles) — enough for a truthful, legible map without
pretending we have full OSM road/substation vector extracts wired up in V1.
"""
from __future__ import annotations

from shapely.geometry import Polygon, mapping

from .geo_utils import square_polygon_around


def build_layers(
    site_polygon: Polygon,
    centroid_lat: float,
    centroid_lng: float,
    raw: dict,
    site_label: str,
) -> list[dict]:
    layers = []

    layers.append({
        "id": "site_boundary",
        "label": "Project Site Boundary",
        "kind": "polygon",
        "geojson": mapping(site_polygon),
        "style": {"color": "#3ddc97", "fillOpacity": 0.15, "weight": 2},
    })

    # Approximate substation marker placed at the stated distance, bearing
    # is illustrative (not surveyed) — labeled clearly in the frontend.
    sub_dist = raw["distance_to_substation_km"]
    sub_lat = centroid_lat + (sub_dist / 111.0) * 0.7
    sub_lng = centroid_lng + (sub_dist / 111.0) * 0.7
    layers.append({
        "id": "substation",
        "label": raw.get("substation_name", "Nearest Substation"),
        "kind": "marker",
        "geojson": mapping(Polygon()) if False else {
            "type": "Point", "coordinates": [sub_lng, sub_lat]
        },
        "style": {"icon": "substation", "color": "#ffb020"},
    })

    layers.append({
        "id": "grid_connection_line",
        "label": f"Illustrative tie-in ({sub_dist:.1f} km)",
        "kind": "line",
        "geojson": {
            "type": "LineString",
            "coordinates": [[centroid_lng, centroid_lat], [sub_lng, sub_lat]],
        },
        "style": {"color": "#ffb020", "dashArray": "4 4", "weight": 2},
    })

    # Protected-area proximity ring (illustrative buffer, not a surveyed boundary)
    pa_dist = raw["nearest_protected_area_km"]
    pa_circle = square_polygon_around(centroid_lat, centroid_lng, pa_dist).buffer(0)
    layers.append({
        "id": "protected_area_buffer",
        "label": f"{raw.get('nearest_protected_area_name', 'Protected area')} — ~{pa_dist:.0f} km radius",
        "kind": "circle",
        "geojson": {"type": "Point", "coordinates": [centroid_lng, centroid_lat]},
        "style": {"radius_km": pa_dist, "color": "#ff5d5d", "fillOpacity": 0.03, "dashArray": "2 6"},
    })

    layers.append({
        "id": "site_centroid",
        "label": site_label,
        "kind": "marker",
        "geojson": {"type": "Point", "coordinates": [centroid_lng, centroid_lat]},
        "style": {"icon": "site", "color": "#3ddc97"},
    })

    return layers
