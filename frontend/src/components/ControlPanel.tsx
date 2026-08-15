import type { DemoSiteSummary, ModuleTechnology } from "../types";

interface Props {
  sites: DemoSiteSummary[];
  mode: "demo" | "draw";
  onModeChange: (m: "demo" | "draw") => void;
  selectedSiteId: string | null;
  onSelectSite: (id: string) => void;
  hasDrawnPolygon: boolean;
  capacityMw: number;
  onCapacityChange: (v: number) => void;
  moduleTechnology: ModuleTechnology;
  onModuleTechnologyChange: (v: ModuleTechnology) => void;
  onAnalyze: () => void;
  canAnalyze: boolean;
  loading: boolean;
  error: string | null;
}

const TECH_LABELS: Record<ModuleTechnology, string> = {
  mono_perc: "Mono PERC",
  bifacial: "Bifacial",
  thin_film: "Thin Film",
};

export default function ControlPanel(props: Props) {
  const {
    sites, mode, onModeChange, selectedSiteId, onSelectSite, hasDrawnPolygon,
    capacityMw, onCapacityChange, moduleTechnology, onModuleTechnologyChange,
    onAnalyze, canAnalyze, loading, error,
  } = props;

  return (
    <aside className="control-panel panel">
      <div className="control-panel__section">
        <div className="eyebrow" style={{ marginBottom: 10 }}>01 — select site</div>
        <div className="mode-toggle">
          <button
            className={mode === "demo" ? "mode-toggle__btn is-active" : "mode-toggle__btn"}
            onClick={() => onModeChange("demo")}
          >
            Reference Sites
          </button>
          <button
            className={mode === "draw" ? "mode-toggle__btn is-active" : "mode-toggle__btn"}
            onClick={() => onModeChange("draw")}
          >
            Draw Custom Site
          </button>
        </div>

        {mode === "demo" ? (
          <div className="site-list">
            {sites.map((s) => (
              <button
                key={s.id}
                className={s.id === selectedSiteId ? "site-card is-active" : "site-card"}
                onClick={() => onSelectSite(s.id)}
              >
                <div className="site-card__row">
                  <span className="site-card__name">{s.name}</span>
                  <span className="site-card__state">{s.state}</span>
                </div>
                <p className="site-card__desc">{s.description}</p>
                <div className="site-card__coords mono">
                  {s.lat.toFixed(3)}°N, {s.lng.toFixed(3)}°E
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="draw-instructions">
            <p>
              Use the polygon tool on the top-left of the map to trace your candidate site
              boundary. Niriksh will compute area, centroid, and interpolate regional data
              for the location.
            </p>
            <div className={hasDrawnPolygon ? "draw-status is-ready" : "draw-status"}>
              {hasDrawnPolygon ? "✓ Boundary drawn — ready to analyze" : "Awaiting boundary…"}
            </div>
          </div>
        )}
      </div>

      <div className="control-panel__section">
        <div className="eyebrow" style={{ marginBottom: 10 }}>02 — project parameters</div>

        <label className="field-label">
          AC Capacity
          <span className="mono field-value">{capacityMw} MW</span>
        </label>
        <input
          type="range"
          min={5}
          max={1000}
          step={5}
          value={capacityMw}
          onChange={(e) => onCapacityChange(Number(e.target.value))}
          className="slider"
        />
        <input
          type="number"
          min={1}
          max={2000}
          value={capacityMw}
          onChange={(e) => onCapacityChange(Number(e.target.value))}
          className="number-input"
        />

        <label className="field-label" style={{ marginTop: 16 }}>
          Module Technology
        </label>
        <div className="tech-toggle">
          {(Object.keys(TECH_LABELS) as ModuleTechnology[]).map((t) => (
            <button
              key={t}
              className={t === moduleTechnology ? "tech-toggle__btn is-active" : "tech-toggle__btn"}
              onClick={() => onModuleTechnologyChange(t)}
            >
              {TECH_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <div className="control-panel__section control-panel__section--action">
        <button className="analyze-btn" disabled={!canAnalyze || loading} onClick={onAnalyze}>
          {loading ? "Analyzing…" : "Run Feasibility Analysis"}
        </button>
        {error && <div className="error-banner">{error}</div>}
      </div>
    </aside>
  );
}
