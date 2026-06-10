import { useState, useEffect, useRef } from 'react'
import { parseTLE, getSatelliteGeodetic } from '../utils/orbital.js'

export default function SatelliteList({ satellites, selected, onSelect }) {
  const [query, setQuery] = useState('')
  const [geoData, setGeoData] = useState(null)
  const satrecs = useRef({})

  // Pre-parse all TLEs once
  useEffect(() => {
    satellites.forEach(sat => {
      if (!satrecs.current[sat.name]) {
        satrecs.current[sat.name] = parseTLE(sat.tle1, sat.tle2)
      }
    })
  }, [satellites])

  // Update geodetic data for selected satellite
  useEffect(() => {
    if (!selected) { setGeoData(null); return }
    const satrec = satrecs.current[selected]
    if (!satrec) return

    const update = () => {
      const geo = getSatelliteGeodetic(satrec)
      setGeoData(geo)
    }
    update()
    const interval = setInterval(update, 2000)
    return () => clearInterval(interval)
  }, [selected])

  const filtered = satellites.filter(sat =>
    sat.name.toLowerCase().includes(query.toLowerCase()) ||
    sat.type?.toLowerCase().includes(query.toLowerCase()) ||
    sat.agency?.toLowerCase().includes(query.toLowerCase())
  )

  const selectedSat = satellites.find(s => s.name === selected)

  return (
    <div style={styles.sidebar}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>⬡ NIRIKSH</div>
        <div style={styles.subtitle}>Live Satellite Tracker</div>
      </div>

      {/* Search */}
      <div style={styles.searchWrap}>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search satellites..."
          style={styles.search}
        />
      </div>

      {/* Satellite list */}
      <div style={styles.listWrap}>
        <div style={styles.listHeader}>
          {filtered.length} OBJECT{filtered.length !== 1 ? 'S' : ''}
        </div>
        {filtered.map(sat => (
          <button
            key={sat.name}
            style={{
              ...styles.listItem,
              background: selected === sat.name ? 'rgba(0,255,136,0.08)' : 'transparent',
              borderLeft: `3px solid ${selected === sat.name ? sat.color : 'transparent'}`,
            }}
            onClick={() => onSelect(selected === sat.name ? null : sat.name)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ ...styles.dot, background: sat.color }} />
              <div>
                <div style={{ ...styles.satName, color: selected === sat.name ? sat.color : '#e0e8f0' }}>
                  {sat.name}
                </div>
                <div style={styles.satMeta}>{sat.type} · {sat.agency}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Detail panel for selected satellite */}
      {selectedSat && (
        <div style={{ ...styles.detail, borderColor: selectedSat.color + '44' }}>
          <div style={{ ...styles.detailTitle, color: selectedSat.color }}>
            {selectedSat.name}
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>TYPE</span>
            <span style={styles.detailValue}>{selectedSat.type}</span>
          </div>
          <div style={styles.detailRow}>
            <span style={styles.detailLabel}>AGENCY</span>
            <span style={styles.detailValue}>{selectedSat.agency}</span>
          </div>
          {geoData && (
            <>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>LAT</span>
                <span style={styles.detailValue}>{geoData.latitude}°</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>LON</span>
                <span style={styles.detailValue}>{geoData.longitude}°</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>ALT</span>
                <span style={styles.detailValue}>{geoData.altitude} km</span>
              </div>
            </>
          )}
          <div style={styles.liveIndicator}>
            <span style={styles.liveDot} />
            LIVE TRACKING
          </div>
        </div>
      )}

      <div style={styles.footer}>
        TLE data via CelesTrak · SGP4 model
      </div>
    </div>
  )
}

const styles = {
  sidebar: {
    width: '240px',
    minWidth: '240px',
    height: '100vh',
    background: 'rgba(4, 12, 24, 0.95)',
    borderRight: '1px solid #0d2137',
    display: 'flex',
    flexDirection: 'column',
    color: '#e0e8f0',
    fontFamily: "'Courier New', monospace",
    overflow: 'hidden',
    zIndex: 10,
  },
  header: {
    padding: '20px 16px 12px',
    borderBottom: '1px solid #0d2137',
  },
  logo: {
    fontSize: '16px',
    fontWeight: 'bold',
    letterSpacing: '4px',
    color: '#00ff88',
  },
  subtitle: {
    fontSize: '9px',
    letterSpacing: '2px',
    color: '#4a6a8a',
    marginTop: '4px',
  },
  searchWrap: {
    padding: '12px',
    borderBottom: '1px solid #0d2137',
  },
  search: {
    width: '100%',
    background: '#050f1e',
    border: '1px solid #1a3a5c',
    borderRadius: '3px',
    padding: '7px 10px',
    color: '#e0e8f0',
    fontSize: '11px',
    fontFamily: "'Courier New', monospace",
    outline: 'none',
  },
  listWrap: {
    flex: 1,
    overflowY: 'auto',
    padding: '4px 0',
  },
  listHeader: {
    fontSize: '9px',
    letterSpacing: '2px',
    color: '#2a4a6a',
    padding: '8px 16px 4px',
  },
  listItem: {
    width: '100%',
    padding: '10px 14px',
    border: 'none',
    borderLeft: '3px solid transparent',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.15s',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  satName: {
    fontSize: '11px',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
  },
  satMeta: {
    fontSize: '9px',
    color: '#3a5a7a',
    marginTop: '2px',
    letterSpacing: '0.5px',
  },
  detail: {
    margin: '8px 12px',
    padding: '12px',
    border: '1px solid',
    borderRadius: '4px',
    background: 'rgba(0,10,20,0.8)',
  },
  detailTitle: {
    fontSize: '10px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    marginBottom: '10px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '6px',
  },
  detailLabel: {
    fontSize: '9px',
    color: '#3a5a7a',
    letterSpacing: '1px',
  },
  detailValue: {
    fontSize: '10px',
    color: '#b0c8e0',
    fontWeight: 'bold',
  },
  liveIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '9px',
    color: '#00ff88',
    letterSpacing: '1px',
    marginTop: '10px',
  },
  liveDot: {
    display: 'inline-block',
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: '#00ff88',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  footer: {
    padding: '10px 16px',
    fontSize: '8px',
    color: '#1a3a5a',
    letterSpacing: '0.5px',
    borderTop: '1px solid #0d2137',
  },
}
