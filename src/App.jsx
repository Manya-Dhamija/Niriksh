import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Earth from './components/Earth.jsx'
import SatellitePoint from './components/SatellitePoint.jsx'
import SatelliteList from './components/SatelliteList.jsx'
import Stars from './components/Stars.jsx'
import { satellites } from './tleData.js'

export default function App() {
  const [selected, setSelected] = useState(null)

  return (
    <div style={styles.app}>
      {/* Sidebar */}
      <SatelliteList
        satellites={satellites}
        selected={selected}
        onSelect={setSelected}
      />

      {/* 3D Canvas */}
      <div style={styles.canvasWrap}>
        <Canvas
          camera={{ position: [0, 0, 3.5], fov: 50, near: 0.01, far: 200 }}
          gl={{ antialias: true, alpha: false }}
          style={{ background: '#000812' }}
        >
          {/* Lighting */}
          <ambientLight intensity={0.15} />
          <pointLight position={[8, 5, 5]} intensity={1.2} color="#fff5e0" />
          <pointLight position={[-8, -5, -5]} intensity={0.1} color="#1a4a8a" />

          {/* Scene */}
          <Stars />
          <Earth />

          {/* Satellites */}
          {satellites.map(sat => (
            <SatellitePoint
              key={sat.name}
              tle1={sat.tle1}
              tle2={sat.tle2}
              color={sat.color}
              name={sat.name}
              isSelected={selected === sat.name}
              onClick={() => setSelected(prev => prev === sat.name ? null : sat.name)}
            />
          ))}

          <OrbitControls
            enablePan={false}
            enableZoom={true}
            zoomSpeed={0.6}
            rotateSpeed={0.5}
            minDistance={1.3}
            maxDistance={10}
          />
        </Canvas>

        {/* Overlay HUD */}
        <div style={styles.hud}>
          <div style={styles.hudItem}>
            <span style={styles.hudDot} />
            {satellites.length} SATELLITES TRACKED
          </div>
          <div style={styles.hudItem}>
            SGP4 · REAL-TIME
          </div>
        </div>

        {/* Controls hint */}
        <div style={styles.controls}>
          DRAG to rotate · SCROLL to zoom · CLICK satellite to track
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #050f1e; }
        ::-webkit-scrollbar-thumb { background: #1a3a5c; border-radius: 2px; }
        input::placeholder { color: #2a4a6a; }
      `}</style>
    </div>
  )
}

const styles = {
  app: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
  },
  canvasWrap: {
    flex: 1,
    position: 'relative',
  },
  hud: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    alignItems: 'flex-end',
    pointerEvents: 'none',
  },
  hudItem: {
    background: 'rgba(4,12,24,0.8)',
    border: '1px solid #0d2137',
    color: '#00ff88',
    padding: '4px 10px',
    fontSize: '10px',
    letterSpacing: '2px',
    fontFamily: "'Courier New', monospace",
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  hudDot: {
    display: 'inline-block',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#00ff88',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  controls: {
    position: 'absolute',
    bottom: '16px',
    right: '16px',
    color: '#1a3a5a',
    fontSize: '9px',
    letterSpacing: '1.5px',
    fontFamily: "'Courier New', monospace",
    pointerEvents: 'none',
  },
}
