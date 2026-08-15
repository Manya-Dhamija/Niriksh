export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <div className="app-header__mark" aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <circle cx="13" cy="13" r="11.5" stroke="var(--accent-primary)" strokeWidth="1.2" opacity="0.5" />
            <circle cx="13" cy="13" r="7.5" stroke="var(--accent-primary)" strokeWidth="1" opacity="0.35" />
            <circle cx="13" cy="13" r="3" fill="var(--accent-primary)" />
            <line x1="13" y1="0.5" x2="13" y2="4" stroke="var(--accent-primary)" strokeWidth="1" opacity="0.6" />
          </svg>
        </div>
        <div>
          <div className="app-header__title">NIRIKSH</div>
          <div className="eyebrow">planetary intelligence · renewable siting</div>
        </div>
      </div>
      <div className="app-header__meta">
        <a className="app-header__back" href="../index.html">&larr; Back to Niriksh</a>
        <span className="app-header__badge">V1 · Utility-Scale Solar · India</span>
      </div>
    </header>
  );
}
