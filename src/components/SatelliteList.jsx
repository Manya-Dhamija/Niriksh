import { useState, useEffect } from "react";

export default function SatelliteList({ satellites, selected, onSelect }) {
  const [query, setQuery] = useState("");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const filtered = satellites.filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  const utc = time.toUTCString().split(" ")[4];

  return (
    <aside style={styles.sidebar}>
      {/* Brand */}
      <div style={styles.brand}>
        <div style={styles.brandIcon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#00D4FF" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
            <path d="M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M2 12h5M17 12h5M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24" />
          </svg>
        </div>
        <div>
          <div style={styles.brandName}>NIRIKSH</div>
          <div style={styles.brandSub}>Live Satellite Tracker</div>
        </div>
        <div style={styles.brandTime}>{utc}</div>
      </div>

      {/* Search */}
      <div style={styles.searchWrap}>
        <div style={styles.searchBox}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#4A6880" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            style={styles.searchInput}
            placeholder="Search satellites..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button style={styles.clearBtn} onClick={() => setQuery("")}>✕</button>
          )}
        </div>
      </div>

      {/* Count row */}
      <div style={styles.countRow}>
        <span>{filtered.length} satellites</span>
        <span style={{ color: "#39D353" }}>● LIVE</span>
      </div>

      {/* List */}
      <div style={styles.list}>
        {filtered.map((sat) => {
          const isActive = selected?.name === sat.name;
          return (
            <div
              key={sat.name}
              style={{
                ...styles.card,
                ...(isActive ? styles.cardActive : {}),
              }}
              onClick={() => onSelect(sat)}
            >
              {isActive && <div style={styles.activeLine} />}
              <div style={styles.cardHeader}>
                <PulseDot active={isActive} />
                <span style={styles.satName}>{sat.name}</span>
                <span style={styles.satId}>{sat.catalogId ?? "—"}</span>
              </div>
              <div style={styles.dataGrid}>
                <DataCell label="LAT" val={sat.lat != null ? sat.lat.toFixed(1) + "°" : "—"} active={isActive} />
                <DataCell label="LON" val={sat.lon != null ? sat.lon.toFixed(1) + "°" : "—"} active={isActive} />
                <DataCell label="ALT" val={sat.alt != null ? (sat.alt < 1000 ? sat.alt + " km" : (sat.alt / 1000).toFixed(0) + "k km") : "—"} active={isActive} />
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={styles.empty}>No satellites match "{query}"</div>
        )}
      </div>
    </aside>
  );
}

function PulseDot({ active }) {
  return (
    <span style={{
      display: "inline-block",
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: "#39D353",
      boxShadow: active ? "0 0 6px #39D353" : "none",
      flexShrink: 0,
    }} />
  );
}

function DataCell({ label, val, active }) {
  return (
    <div style={styles.dataCell}>
      <div style={styles.dataLabel}>{label}</div>
      <div style={{ ...styles.dataVal, color: active ? "#00D4FF" : "#8BAAC5" }}>
        {val}
      </div>
    </div>
  );
}

const styles = {
  sidebar: {
    width: 310,
    minWidth: 310,
    height: "100vh",
    background: "#0A1628",
    borderRight: "1px solid #1A2E44",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    fontFamily: "'Space Grotesk', sans-serif",
  },
  brand: {
    padding: "18px 20px 14px",
    borderBottom: "1px solid #1A2E44",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  brandIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    background: "rgba(0,212,255,0.08)",
    border: "1px solid rgba(0,212,255,0.25)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  brandName: {
    fontSize: 17,
    fontWeight: 700,
    color: "#E8F4FF",
    letterSpacing: "0.06em",
  },
  brandSub: {
    fontSize: 10,
    color: "#4A6880",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.08em",
    marginTop: 1,
    textTransform: "uppercase",
  },
  brandTime: {
    marginLeft: "auto",
    fontSize: 10,
    color: "#00D4FF",
    fontFamily: "'JetBrains Mono', monospace",
  },
  searchWrap: {
    padding: "12px 14px",
    borderBottom: "1px solid #1A2E44",
  },
  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#050A14",
    border: "1px solid #1A2E44",
    borderRadius: 8,
    padding: "8px 12px",
  },
  searchInput: {
    flex: 1,
    background: "none",
    border: "none",
    outline: "none",
    color: "#E8F4FF",
    fontSize: 13,
    fontFamily: "'Space Grotesk', sans-serif",
  },
  clearBtn: {
    background: "none",
    border: "none",
    color: "#4A6880",
    cursor: "pointer",
    fontSize: 11,
    padding: 0,
  },
  countRow: {
    padding: "8px 16px 4px",
    fontSize: 10,
    color: "#4A6880",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    display: "flex",
    justifyContent: "space-between",
  },
  list: {
    flex: 1,
    overflowY: "auto",
    padding: "6px 12px 12px",
    scrollbarWidth: "thin",
    scrollbarColor: "#1A2E44 transparent",
  },
  card: {
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid transparent",
    cursor: "pointer",
    marginBottom: 6,
    position: "relative",
    overflow: "hidden",
    transition: "all 0.15s ease",
  },
  cardActive: {
    background: "#0F1E35",
    border: "1px solid rgba(0,212,255,0.3)",
  },
  activeLine: {
    position: "absolute",
    left: 0,
    top: "20%",
    bottom: "20%",
    width: 2,
    background: "#00D4FF",
    borderRadius: "0 2px 2px 0",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  satName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#E8F4FF",
    flex: 1,
  },
  satId: {
    fontSize: 10,
    color: "#4A6880",
    fontFamily: "'JetBrains Mono', monospace",
  },
  dataGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 5,
  },
  dataCell: {
    background: "#050A14",
    borderRadius: 5,
    padding: "5px 7px",
  },
  dataLabel: {
    fontSize: 9,
    color: "#4A6880",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    fontFamily: "'JetBrains Mono', monospace",
  },
  dataVal: {
    fontSize: 12,
    fontWeight: 500,
    fontFamily: "'JetBrains Mono', monospace",
    marginTop: 2,
  },
  empty: {
    padding: "24px 12px",
    fontSize: 13,
    color: "#4A6880",
    textAlign: "center",
    fontStyle: "italic",
  },
};
