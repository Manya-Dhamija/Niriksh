import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet-draw";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { DemoSiteSummary, FeasibilityReport, GeoJSONPolygon } from "../types";

const RATING_COLOR: Record<string, string> = {
  excellent: "#3ddc97",
  good: "#7cd68a",
  moderate: "#f5b942",
  poor: "#ef8a52",
  critical: "#ff5d5d",
};

function siteDivIcon(color: string) {
  return L.divIcon({
    className: "niriksh-marker",
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};box-shadow:0 0 0 4px ${color}33, 0 0 12px ${color}aa;"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function substationDivIcon() {
  return L.divIcon({
    className: "niriksh-marker",
    html: `<div style="width:12px;height:12px;background:#ffb020;transform:rotate(45deg);box-shadow:0 0 10px #ffb02099;"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

interface Props {
  sites: DemoSiteSummary[];
  mode: "demo" | "draw";
  selectedSite: DemoSiteSummary | null;
  report: FeasibilityReport | null;
  onPolygonDrawn: (polygon: GeoJSONPolygon) => void;
}

function DrawLayer({ active, onPolygonDrawn }: { active: boolean; onPolygonDrawn: (p: GeoJSONPolygon) => void }) {
  const map = useMap();
  const drawnItems = useRef<L.FeatureGroup>(new L.FeatureGroup());
  const drawControl = useRef<L.Control.Draw | null>(null);

  useEffect(() => {
    if (!map.hasLayer(drawnItems.current)) {
      map.addLayer(drawnItems.current);
    }
  }, [map]);

  useEffect(() => {
    if (active) {
      drawControl.current = new L.Control.Draw({
        draw: {
          polygon: {
            shapeOptions: { color: "#3ddc97", weight: 2, fillOpacity: 0.12 },
            allowIntersection: false,
            showArea: true,
          },
          polyline: false,
          rectangle: false,
          circle: false,
          circlemarker: false,
          marker: false,
        },
        edit: { featureGroup: drawnItems.current, remove: true },
      });
      map.addControl(drawControl.current);

      const handleCreated = (e: any) => {
        drawnItems.current.clearLayers();
        drawnItems.current.addLayer(e.layer);
        const geojson = e.layer.toGeoJSON();
        onPolygonDrawn(geojson.geometry as GeoJSONPolygon);
      };
      map.on(L.Draw.Event.CREATED, handleCreated);

      return () => {
        map.off(L.Draw.Event.CREATED, handleCreated);
        if (drawControl.current) map.removeControl(drawControl.current);
      };
    } else {
      drawnItems.current.clearLayers();
    }
  }, [active, map, onPolygonDrawn]);

  return null;
}

function ReportLayers({ report }: { report: FeasibilityReport }) {
  const map = useMap();
  const groupRef = useRef<L.LayerGroup>(new L.LayerGroup());

  useEffect(() => {
    const group = groupRef.current;
    group.clearLayers();
    map.addLayer(group);

    for (const layer of report.map_layers) {
      if (layer.kind === "polygon") {
        const gj = L.geoJSON(layer.geojson, {
          style: { color: layer.style.color, weight: layer.style.weight, fillOpacity: layer.style.fillOpacity },
        });
        gj.addTo(group);
      } else if (layer.kind === "marker") {
        const [lng, lat] = layer.geojson.coordinates;
        const icon = layer.style.icon === "substation" ? substationDivIcon() : siteDivIcon(layer.style.color);
        L.marker([lat, lng], { icon }).bindTooltip(layer.label, { direction: "top", offset: [0, -8] }).addTo(group);
      } else if (layer.kind === "line") {
        const coords = layer.geojson.coordinates.map(([lng, lat]: number[]) => [lat, lng]);
        L.polyline(coords, {
          color: layer.style.color,
          weight: layer.style.weight,
          dashArray: layer.style.dashArray,
        }).bindTooltip(layer.label).addTo(group);
      } else if (layer.kind === "circle") {
        const [lng, lat] = layer.geojson.coordinates;
        L.circle([lat, lng], {
          radius: layer.style.radius_km * 1000,
          color: layer.style.color,
          weight: 1,
          fillOpacity: layer.style.fillOpacity,
          dashArray: layer.style.dashArray,
        }).bindTooltip(layer.label).addTo(group);
      }
    }

    const boundaryLayer = report.map_layers.find((l) => l.kind === "polygon");
    if (boundaryLayer) {
      const gj = L.geoJSON(boundaryLayer.geojson);
      const bounds = gj.getBounds();
      if (bounds.isValid()) map.fitBounds(bounds.pad(3.5));
    }

    return () => {
      group.clearLayers();
    };
  }, [report, map]);

  return null;
}

function FlyToSite({ site }: { site: DemoSiteSummary | null }) {
  const map = useMap();
  useEffect(() => {
    if (site) {
      map.flyTo([site.lat, site.lng], 12, { duration: 0.8 });
    }
  }, [site, map]);
  return null;
}

export default function MapView({ mode, selectedSite, report, onPolygonDrawn }: Props) {
  return (
    <div className="map-shell">
      <MapContainer
        center={[22.5, 78.9]}
        zoom={5}
        className="map-container"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <DrawLayer active={mode === "draw" && !report} onPolygonDrawn={onPolygonDrawn} />
        {report ? <ReportLayers report={report} /> : <FlyToSite site={selectedSite} />}
      </MapContainer>
      <div className="map-legend">
        <div className="map-legend__item"><span className="dot" style={{ background: "#3ddc97" }} /> Site boundary</div>
        <div className="map-legend__item"><span className="diamond" style={{ background: "#ffb020" }} /> Substation</div>
        <div className="map-legend__item"><span className="ring" style={{ borderColor: "#ff5d5d" }} /> Protected area buffer</div>
      </div>
    </div>
  );
}
