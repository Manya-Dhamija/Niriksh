import type { FeasibilityReport } from "../types";

const REC_COLOR: Record<string, string> = {
  "Highly Suitable": "var(--signal-excellent)",
  "Suitable": "var(--signal-good)",
  "Moderate": "var(--signal-moderate)",
  "High Risk": "var(--signal-poor)",
  "Not Recommended": "var(--signal-critical)",
};

const SIZE = 176;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ScorePanel({ report }: { report: FeasibilityReport }) {
  const color = REC_COLOR[report.recommendation] ?? "var(--signal-moderate)";
  const offset = CIRCUMFERENCE * (1 - report.overall_score / 100);

  return (
    <div className="score-panel panel">
      <div className="score-panel__gauge">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--border-hairline)"
            strokeWidth={STROKE}
          />
          {/* tick marks */}
          {Array.from({ length: 40 }).map((_, i) => {
            const angle = (i / 40) * 2 * Math.PI;
            const x1 = SIZE / 2 + (RADIUS - STROKE / 2 - 2) * Math.cos(angle);
            const y1 = SIZE / 2 + (RADIUS - STROKE / 2 - 2) * Math.sin(angle);
            const x2 = SIZE / 2 + (RADIUS - STROKE / 2 - 6) * Math.cos(angle);
            const y2 = SIZE / 2 + (RADIUS - STROKE / 2 - 6) * Math.sin(angle);
            return (
              <line
                key={i}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="var(--border-hairline)"
                strokeWidth={1}
              />
            );
          })}
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            style={{
              // @ts-ignore css var
              "--circumference": CIRCUMFERENCE,
              "--target-offset": offset,
              animation: "sweep-in 1.1s cubic-bezier(.16,1,.3,1) forwards",
            }}
          />
        </svg>
        <div className="score-panel__readout">
          <div className="score-panel__value mono">{report.overall_score.toFixed(1)}</div>
          <div className="eyebrow">/ 100</div>
        </div>
      </div>

      <div className="score-panel__verdict">
        <span className="recommendation-badge" style={{ borderColor: color, color }}>
          {report.recommendation}
        </span>
        <p>{report.recommendation_summary}</p>
      </div>

      <div className="score-panel__meta">
        <div>
          <div className="eyebrow">Site</div>
          <div>{report.site_name}{report.state !== "—" ? `, ${report.state}` : ""}</div>
        </div>
        <div>
          <div className="eyebrow">Area</div>
          <div className="mono">{report.area_hectares.toLocaleString()} ha</div>
        </div>
        <div>
          <div className="eyebrow">Capacity</div>
          <div className="mono">{report.capacity_mw} MW AC</div>
        </div>
        <div>
          <div className="eyebrow">Centroid</div>
          <div className="mono">{report.centroid.lat.toFixed(4)}, {report.centroid.lng.toFixed(4)}</div>
        </div>
      </div>
    </div>
  );
}
