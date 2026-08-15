export interface DemoSiteSummary {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  description: string;
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface GeoJSONPolygon {
  type: "Polygon";
  coordinates: number[][][];
}

export type ModuleTechnology = "mono_perc" | "bifacial" | "thin_film";

export interface AnalyzeRequest {
  site_id?: string;
  polygon?: GeoJSONPolygon;
  capacity_mw: number;
  module_technology: ModuleTechnology;
}

export type Rating = "excellent" | "good" | "moderate" | "poor" | "critical";

export interface FactorScore {
  key: string;
  label: string;
  score: number;
  weight: number;
  raw_value: number;
  unit: string;
  rating: Rating;
  explanation: string;
  source: string;
}

export interface DataSource {
  dataset: string;
  provider: string;
  description: string;
  resolution: string;
  access_mode: "cached_reference" | "live_api";
}

export interface GenerationEstimate {
  capacity_mw: number;
  performance_ratio: number;
  specific_yield_kwh_per_kwp: number;
  annual_generation_gwh: number;
  annual_generation_basis: string;
}

export interface MapLayer {
  id: string;
  label: string;
  kind: "marker" | "circle" | "polygon" | "line" | "heat_point";
  geojson: any;
  style: Record<string, any>;
}

export type Recommendation =
  | "Highly Suitable"
  | "Suitable"
  | "Moderate"
  | "High Risk"
  | "Not Recommended";

export interface FeasibilityReport {
  site_name: string;
  state: string;
  centroid: LatLng;
  area_hectares: number;
  capacity_mw: number;
  module_technology: string;

  overall_score: number;
  recommendation: Recommendation;
  recommendation_summary: string;

  factors: FactorScore[];
  advantages: string[];
  risks: string[];

  generation_estimate: GenerationEstimate | null;
  map_layers: MapLayer[];
  data_sources: DataSource[];
  assumptions: string[];

  data_mode: "cached_demo_site" | "interpolated_custom_site";
  data_mode_note: string;
}
