import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useState } from "react";
import Earth from "./Earth";
import Stars from "./Stars";
import SatellitePoint from "./SatellitePoint";
import SatelliteList from "./SatelliteList";
import { satellites } from "./tleData";

export default function App() {
  const [selected, setSelected] = useState(null);

  return (
    <div style={styles.root}>
      {/* Sidebar */}
      <SatelliteList
        satellites={satellites}
        selected={selected}
        onSelect={setSelected}
      />

      {/* 3D Canvas */}
      <div style={styles.canvasWrap}>
        {/* Top status bar */}
        <div style={styles.topBar}>
          <div style={styles.chips}>
            <span style={styles.chip}>
              <span style={styles.liveDot} />
              <span style={styles.chipLabel}>Tracking</span>
              <span style={styles.chipVal}>{satellites.length}</span>
            </span>
            <span style={styles.chip}>
              <span style={styles.chipLabel}>Model</span>
              <span style={styles.chipVal}>SGP4</span>
            </span>
            <span style={styles.chip}>
              <span style={styles.chipLabel}>Epoch</span>
              <span style={{ ...styles.chipVal, fontFamily: "'JetBrains Mono', monospace" }}>
                {new Date().toUTCString().split(" ")[4]} UTC
              </span>
            </span>
          </div>
          <div style={styles.ctrlGroup}>
            <button style={styles.ctrlBtn} title="Reset view">⟳</button>
            <button style={styles.ctrlBtn} title="Toggle trails">⤑</button>
          </div>
        </div>

        <Canvas camera={{ position: [0, 0, 2.8], fov: 45 }}>
          <ambientLight intensity={0.3} />
          <directionalLight position={[5, 3, 5]} intensity={1.2} />
          <Stars />
          <Earth />
          {satellites.map((sat) => (
            <SatellitePoint
              key={sat.name}
              satellite={sat}
              isSelected={selected?.name === sat.name}
              onClick={() => setSelected(sat)}
            />
          ))}
          <OrbitControls enablePan={false} minDistance={1.5} maxDistance={6} />
        </Canvas>

        {/* Detail panel */}
        {selected && (
          <div style={styles.detailCard}>
            <div style={styles.detailName}>{selected.name}</div>
            <div style={styles.detailType}>
              {selected.type ?? "EARTH ORBIT"} · LIVE
            </div>
            <div style={styles.detailGrid}>
              <div style={styles.statBox}>
                <div style={styles.statLabel}>Latitude</div>
                <div style={styles.statVal}>
                  {selected.lat?.toFixed(2) ?? "—"}°
                </div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statLabel}>Longitude</div>
                <div style={styles.statVal}>
                  {selected.lon?.toFixed(2) ?? "—"}°
                </div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statLabel}>Altitude</div>
                <div style={styles.statVal}>
                  {selected.alt?.toFixed(0) ?? "—"}
                  <span style={styles.unit}> km</span>
                </div>
              </div>
              <div style={styles.statBox}>
                <div style={styles.statLabel}>Velocity</div>
                <div style={styles.statVal}>
                  {selected.vel?.toFixed(2) ?? "—"}
                  <span style={styles.unit}> km/s</span>
                </div>
              </div>
            </div>
            <button
              style={styles.closeBtn}
              onClick={() => setSelected(null)}
            >
              ✕
            </button>
          </div>
        )}

        <div style={styles.hint}>Drag to rotate · Scroll to zoom</div>
      </div>
    </div>
  );
}

const styles = {
  root: {
    display: "flex",
    height: "100vh",
    width: "100vw",
    overflow: "hidden",
    background: "#050A14",
    fontFamily: "'Space Grotesk', sans-serif",
  },
  canvasWrap: {
    flex: 1,
    position: "relative",
    background: "#050A14",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
    pointerEvents: "none",
  },
  chips: {
    display: "flex",
    gap: 8,
    pointerEvents: "auto",
  },
  chip: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(10,22,40,0.85)",
    border: "1px solid #1A2E44",
    borderRadius: 20,
    padding: "5px 14px",
    fontSize: 12,
    backdropFilter: "blur(8px)",
    color: "#8BAAC5",
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#39D353",
    boxShadow: "0 0 5px #39D353",
    display: "inline-block",
  },
  chipLabel: { color: "#4A6880" },
  chipVal: { color: "#00D4FF", fontWeight: 600 },
  ctrlGroup: {
    display: "flex",
    gap: 8,
    pointerEvents: "auto",
  },
  ctrlBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    background: "rgba(10,22,40,0.85)",
    border: "1px solid #1A2E44",
    color: "#8BAAC5",
    fontSize: 16,
    cursor: "pointer",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  detailCard: {
    position: "absolute",
    bottom: 24,
    left: 24,
    background: "rgba(10,22,40,0.92)",
    border: "1px solid rgba(0,212,255,0.3)",
    borderRadius: 14,
    padding: "18px 22px",
    width: 280,
    backdropFilter: "blur(12px)",
    zIndex: 10,
  },
  detailName: {
    fontSize: 16,
    fontWeight: 700,
    color: "#E8F4FF",
    marginBottom: 2,
  },
  detailType: {
    fontSize: 10,
    color: "#00D4FF",
    fontFamily: "'JetBrains Mono', monospace",
    letterSpacing: "0.07em",
    marginBottom: 14,
    textTransform: "uppercase",
  },
  detailGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 8,
  },
  statBox: {
    background: "#0A1628",
    borderRadius: 7,
    padding: "8px 10px",
  },
  statLabel: {
    fontSize: 9,
    color: "#4A6880",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    fontFamily: "'JetBrains Mono', monospace",
    marginBottom: 3,
  },
  statVal: {
    fontSize: 17,
    fontWeight: 600,
    color: "#00D4FF",
    fontFamily: "'JetBrains Mono', monospace",
  },
  unit: {
    fontSize: 11,
    color: "#8BAAC5",
    fontWeight: 400,
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 14,
    background: "none",
    border: "none",
    color: "#4A6880",
    cursor: "pointer",
    fontSize: 14,
  },
  hint: {
    position: "absolute",
    bottom: 20,
    right: 24,
    fontSize: 11,
    color: "#4A6880",
    fontFamily: "'JetBrains Mono', monospace",
    pointerEvents: "none",
  },
};
