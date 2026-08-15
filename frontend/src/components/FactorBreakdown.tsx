import type { FactorScore } from "../types";

export default function FactorBreakdown({ factors }: { factors: FactorScore[] }) {
  return (
    <div className="factor-breakdown panel">
      <div className="section-heading">
        <h3>Factor Breakdown</h3>
        <span className="eyebrow">weighted composite methodology</span>
      </div>
      <div className="factor-list">
        {factors.map((f) => (
          <div key={f.key} className="factor-row">
            <div className="factor-row__head">
              <span className="factor-row__label">{f.label}</span>
              <span className={`factor-row__score mono rating-${f.rating}`}>
                {f.score.toFixed(1)}
              </span>
            </div>
            <div className="factor-row__bar-track">
              <div
                className={`factor-row__bar-fill bg-rating-${f.rating}`}
                style={{ width: `${f.score}%` }}
              />
            </div>
            <div className="factor-row__foot">
              <span className="mono">{typeof f.raw_value === "number" ? f.raw_value.toFixed(1) : f.raw_value} {f.unit}</span>
              <span className="factor-row__weight">weight {(f.weight * 100).toFixed(0)}%</span>
            </div>
            <p className="factor-row__explain">{f.explanation}</p>
            <div className="factor-row__source eyebrow">source · {f.source}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
