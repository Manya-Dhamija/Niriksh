import { useEffect, useState } from "react";
import Header from "./components/Header";
import ControlPanel from "./components/ControlPanel";
import MapView from "./components/MapView";
import ScorePanel from "./components/ScorePanel";
import FactorBreakdown from "./components/FactorBreakdown";
import RiskAdvantages from "./components/RiskAdvantages";
import GenerationCard from "./components/GenerationCard";
import SourcesFooter from "./components/SourcesFooter";
import { analyzeSite, fetchDemoSites } from "./api/client";
import type { DemoSiteSummary, FeasibilityReport, GeoJSONPolygon, ModuleTechnology } from "./types";

export default function App() {
  const [sites, setSites] = useState<DemoSiteSummary[]>([]);
  const [mode, setMode] = useState<"demo" | "draw">("demo");
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [drawnPolygon, setDrawnPolygon] = useState<GeoJSONPolygon | null>(null);
  const [capacityMw, setCapacityMw] = useState(250);
  const [moduleTechnology, setModuleTechnology] = useState<ModuleTechnology>("bifacial");
  const [report, setReport] = useState<FeasibilityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sitesError, setSitesError] = useState<string | null>(null);

  useEffect(() => {
    fetchDemoSites()
      .then((s) => {
        setSites(s);
        if (s.length > 0) setSelectedSiteId(s[0].id);
      })
      .catch((e) => setSitesError(String(e.message || e)));
  }, []);

  function handleModeChange(m: "demo" | "draw") {
    setMode(m);
    setReport(null);
    setError(null);
    if (m === "draw") setDrawnPolygon(null);
  }

  function handleSelectSite(id: string) {
    setSelectedSiteId(id);
    setReport(null);
  }

  function handlePolygonDrawn(polygon: GeoJSONPolygon) {
    setDrawnPolygon(polygon);
  }

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    try {
      const req =
        mode === "demo"
          ? { site_id: selectedSiteId!, capacity_mw: capacityMw, module_technology: moduleTechnology }
          : { polygon: drawnPolygon!, capacity_mw: capacityMw, module_technology: moduleTechnology };
      const result = await analyzeSite(req);
      setReport(result);
    } catch (e: any) {
      setError(e.message || "Analysis failed. Is the backend running on port 8000?");
    } finally {
      setLoading(false);
    }
  }

  const canAnalyze = mode === "demo" ? !!selectedSiteId : !!drawnPolygon;
  const selectedSite = sites.find((s) => s.id === selectedSiteId) ?? null;

  return (
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <ControlPanel
          sites={sites}
          mode={mode}
          onModeChange={handleModeChange}
          selectedSiteId={selectedSiteId}
          onSelectSite={handleSelectSite}
          hasDrawnPolygon={!!drawnPolygon}
          capacityMw={capacityMw}
          onCapacityChange={setCapacityMw}
          moduleTechnology={moduleTechnology}
          onModuleTechnologyChange={setModuleTechnology}
          onAnalyze={handleAnalyze}
          canAnalyze={canAnalyze}
          loading={loading}
          error={error || sitesError}
        />
        <section className="app-workspace">
          <MapView
            sites={sites}
            mode={mode}
            selectedSite={mode === "demo" ? selectedSite : null}
            report={report}
            onPolygonDrawn={handlePolygonDrawn}
          />
          {report ? (
            <div className="results-scroll">
              <div className="results-grid">
                <ScorePanel report={report} />
                {report.generation_estimate && <GenerationCard estimate={report.generation_estimate} />}
              </div>
              <FactorBreakdown factors={report.factors} />
              <RiskAdvantages advantages={report.advantages} risks={report.risks} />
              <SourcesFooter report={report} />
            </div>
          ) : (
            <div className="empty-state">
              <div className="eyebrow">awaiting analysis</div>
              <p>
                {mode === "demo"
                  ? "Select a reference site and set project parameters, then run the analysis."
                  : "Draw a site boundary on the map, set project parameters, then run the analysis."}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
