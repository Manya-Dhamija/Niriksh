export default function RiskAdvantages({
  advantages,
  risks,
}: {
  advantages: string[];
  risks: string[];
}) {
  return (
    <div className="risk-advantages">
      <div className="panel risk-advantages__col">
        <div className="section-heading">
          <h3 className="rating-excellent">Key Advantages</h3>
        </div>
        <ul className="risk-advantages__list">
          {advantages.length === 0 && <li className="risk-advantages__empty">No standout advantages identified.</li>}
          {advantages.map((a, i) => {
            const [label, ...rest] = a.split(": ");
            return (
              <li key={i}>
                <span className="risk-advantages__marker rating-excellent">＋</span>
                <span><strong>{label}:</strong> {rest.join(": ")}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="panel risk-advantages__col">
        <div className="section-heading">
          <h3 className="rating-critical">Key Risks</h3>
        </div>
        <ul className="risk-advantages__list">
          {risks.length === 0 && <li className="risk-advantages__empty">No material risk flags identified.</li>}
          {risks.map((r, i) => {
            const [label, ...rest] = r.split(": ");
            return (
              <li key={i}>
                <span className="risk-advantages__marker rating-critical">－</span>
                <span><strong>{label}:</strong> {rest.join(": ")}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
