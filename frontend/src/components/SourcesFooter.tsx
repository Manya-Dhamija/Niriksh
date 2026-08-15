import type { FeasibilityReport } from "../types";

export default function SourcesFooter({ report }: { report: FeasibilityReport }) {
  return (
    <div className="sources-footer">
      <div
        className={
          report.data_mode === "cached_demo_site"
            ? "data-mode-banner is-cached"
            : "data-mode-banner is-interpolated"
        }
      >
        <span className="eyebrow">
          {report.data_mode === "cached_demo_site" ? "cached reference dataset" : "interpolated estimate"}
        </span>
        <p>{report.data_mode_note}</p>
      </div>

      <div className="panel sources-footer__grid">
        <div>
          <div className="section-heading"><h3>Data Sources</h3></div>
          <table className="sources-table">
            <thead>
              <tr><th>Dataset</th><th>Provider</th><th>Resolution</th></tr>
            </thead>
            <tbody>
              {report.data_sources.map((d) => (
                <tr key={d.dataset}>
                  <td>{d.dataset}</td>
                  <td className="text-muted">{d.provider}</td>
                  <td className="mono text-muted">{d.resolution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <div className="section-heading"><h3>Assumptions & Limitations</h3></div>
          <ul className="assumptions-list">
            {report.assumptions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
