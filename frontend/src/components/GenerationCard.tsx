import type { GenerationEstimate } from "../types";

export default function GenerationCard({ estimate }: { estimate: GenerationEstimate }) {
  return (
    <div className="panel generation-card">
      <div className="section-heading">
        <h3>Estimated Annual Generation</h3>
        <span className="eyebrow">simplified P50 pre-feasibility yield</span>
      </div>
      <div className="generation-card__stats">
        <div>
          <div className="generation-card__value mono">{estimate.annual_generation_gwh.toLocaleString()}</div>
          <div className="eyebrow">GWh / year</div>
        </div>
        <div>
          <div className="generation-card__value mono">{estimate.specific_yield_kwh_per_kwp.toLocaleString()}</div>
          <div className="eyebrow">kWh / kWp / year</div>
        </div>
        <div>
          <div className="generation-card__value mono">{estimate.performance_ratio}</div>
          <div className="eyebrow">performance ratio</div>
        </div>
      </div>
      <p className="generation-card__basis">{estimate.annual_generation_basis}</p>
    </div>
  );
}
