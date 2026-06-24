import { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import Earth from "./components/Earth"
import Stars from "./components/Stars"
import SatelliteList from "./components/SatelliteList"
import SatellitePoint from "./components/SatellitePoint"
import { satellites as tleList } from "./tleData"

export default function App() {
  const [activeTab, setActiveTab] = useState("about")
  const [selected, setSelected] = useState(null)

  return (
    <div style={{ width:"100%", height:"100vh", background:"#050A14", color:"white", fontFamily:"'Space Grotesk', sans-serif" }}>

      {/* NAV BAR */}
      <nav style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"12px 24px", borderBottom:"1px solid #1A2E44",
        position:"fixed", top:0, width:"100%", zIndex:999, background:"#050A14",
        boxSizing:"border-box"
      }}>
        <div style={{ letterSpacing:"4px", fontSize:"18px" }}>
          N<span style={{color:"#00D4FF"}}>I</span>RIKSH
        </div>
        <div style={{ display:"flex", gap:"8px" }}>
          {["about", "simulation"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding:"6px 16px", border:"1px solid",
                borderColor: activeTab===tab ? "#00D4FF" : "#1A2E44",
                background: activeTab===tab ? "rgba(0,212,255,0.1)" : "transparent",
                color: activeTab===tab ? "#00D4FF" : "#4A6880",
                borderRadius:"8px", cursor:"pointer", textTransform:"capitalize",
                fontFamily:"'Space Grotesk', sans-serif", fontSize:"13px"
              }}>
              {tab}
            </button>
          ))}
        </div>
      </nav>

      {/* CONTENT */}
      <div style={{ paddingTop:"56px", height:"calc(100vh - 56px)" }}>
        {activeTab === "about" && <AboutSection onLaunch={() => setActiveTab("simulation")} />}
        {activeTab === "simulation" && <SimulationSection />}
      </div>
    </div>
  )
}

function AboutSection({ onLaunch }) {
  return (
    <div style={{
      maxWidth:"860px", margin:"0 auto", padding:"3rem 2rem",
      color:"white", overflowY:"auto", height:"100%", boxSizing:"border-box"
    }}>

      {/* Hero */}
      <p style={{ letterSpacing:"3px", fontSize:"11px", color:"#00D4FF", marginBottom:"8px" }}>
        ORBITAL INTELLIGENCE PLATFORM
      </p>
      <h1 style={{ fontSize:"36px", fontWeight:600, marginBottom:"1rem", color:"#E8F4FF", lineHeight:1.3 }}>
        Building the Awareness Layer<br />of Earth's Orbit
      </h1>
      <p style={{ color:"#8BAAC5", lineHeight:1.9, marginBottom:"0.75rem", fontSize:"15px" }}>
        Niriksh (Sanskrit: "to observe") is a real-time 3D satellite tracker and orbital intelligence platform.
        Using TLE data and the SGP4 propagation model, it computes the exact position of real satellites
        at any moment and renders them on an interactive 3D globe.
      </p>
      <p style={{ color:"#8BAAC5", lineHeight:1.9, marginBottom:"2rem", fontSize:"15px" }}>
        As thousands of satellites and debris objects continue to populate Earth's orbit, operators face
        growing challenges in tracking objects, assessing risks, and maintaining mission safety.
        Niriksh starts with a simple goal:
      </p>

      {/* Mission quote */}
      <div style={{
        borderLeft:"3px solid #00D4FF", paddingLeft:"1.25rem",
        marginBottom:"2.5rem", color:"#E8F4FF", fontSize:"16px",
        fontStyle:"italic", lineHeight:1.8
      }}>
        "Visualize and understand everything orbiting Earth."
      </div>

      {/* MVP Features */}
      <p style={{ letterSpacing:"2px", fontSize:"11px", color:"#00D4FF", marginBottom:"12px" }}>
        CURRENT SCOPE — MVP
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"12px", marginBottom:"2.5rem" }}>
        {[
          ["🌍", "Interactive 3D Earth", "Rotate, zoom, and explore the globe in real time"],
          ["🛰️", "Live Satellite Tracking", "10 real satellites tracked via SGP4 propagation"],
          ["📡", "TLE Orbit Data", "Public Two-Line Element sets from CelesTrak & Space-Track"],
          ["🔍", "Search & Inspect", "Satellite list with live lat / lon / altitude readout"],
          ["🌠", "Orbit Trail", "Visual trail rendered on selection"],
          ["📊", "Orbital Analytics", "Basic analytics on orbital parameters"],
        ].map(([icon, name, desc]) => (
          <div key={name} style={{
            background:"#0A1628", border:"1px solid #1A2E44",
            borderRadius:"10px", padding:"1rem"
          }}>
            <div style={{ fontSize:"20px", marginBottom:"6px" }}>{icon}</div>
            <div style={{ fontWeight:500, marginBottom:"4px", color:"#E8F4FF", fontSize:"14px" }}>{name}</div>
            <div style={{ fontSize:"12px", color:"#4A6880", lineHeight:1.6 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Roadmap */}
      <p style={{ letterSpacing:"2px", fontSize:"11px", color:"#00D4FF", marginBottom:"12px" }}>
        FUTURE ROADMAP
      </p>
      <div style={{ display:"flex", flexDirection:"column", gap:"10px", marginBottom:"2.5rem" }}>
        {[
          ["Phase 1", "Orbital Visualization", "Visualize real satellites, display orbital paths, search and filtering"],
          ["Phase 2", "Orbital Awareness", "Conjunction detection, congestion analysis, risk heatmaps, debris tracking"],
          ["Phase 3", "Orbital Intelligence", "Collision probability, risk scoring, future orbit forecasting, traffic analysis"],
          ["Phase 4", "Decision Support", "Maneuver recommendations, fuel optimization, mission planning, fleet analytics"],
          ["Phase 5", "Orbital OS", "Autonomous intelligence, multi-satellite coordination, AI-powered decision support"],
        ].map(([phase, title, desc], i) => (
          <div key={phase} style={{
            display:"flex", gap:"16px", alignItems:"flex-start",
            background:"#0A1628", border:"1px solid #1A2E44",
            borderRadius:"10px", padding:"1rem 1.25rem"
          }}>
            <div style={{
              minWidth:"72px", fontSize:"10px", letterSpacing:"1px",
              color: i === 0 ? "#00D4FF" : "#2A4A60",
              paddingTop:"2px"
            }}>
              {phase}
            </div>
            <div>
              <div style={{ fontWeight:500, color: i === 0 ? "#E8F4FF" : "#4A6880", marginBottom:"3px", fontSize:"14px" }}>
                {title}
                {i === 0 && <span style={{
                  marginLeft:"8px", fontSize:"9px", letterSpacing:"1px",
                  color:"#00D4FF", border:"1px solid #00D4FF",
                  borderRadius:"4px", padding:"1px 6px", verticalAlign:"middle"
                }}>ACTIVE</span>}
              </div>
              <div style={{ fontSize:"12px", color:"#2A4A60", lineHeight:1.6 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tech Stack */}
      <p style={{ letterSpacing:"2px", fontSize:"11px", color:"#00D4FF", marginBottom:"12px" }}>
        TECH STACK
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:"10px", marginBottom:"2.5rem" }}>
        {[
          ["React 18","UI framework"],
          ["Three.js","3D engine"],
          ["satellite.js","SGP4 physics"],
          ["Vite","Build tool"],
          ["React Three Fiber","3D renderer"],
          ["GitHub Pages","Deployment"],
        ].map(([name, desc]) => (
          <div key={name} style={{
            background:"#0A1628", border:"1px solid #1A2E44",
            borderRadius:"10px", padding:"0.85rem 1rem"
          }}>
            <div style={{ fontWeight:500, marginBottom:"3px", color:"#E8F4FF", fontSize:"13px" }}>{name}</div>
            <div style={{ fontSize:"11px", color:"#4A6880" }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* Long-term mission */}
      <div style={{
        background:"#0A1628", border:"1px solid #1A2E44",
        borderRadius:"12px", padding:"1.5rem", marginBottom:"2.5rem"
      }}>
        <p style={{ fontSize:"11px", letterSpacing:"2px", color:"#00D4FF", marginBottom:"8px", textTransform:"uppercase" }}>
          Long-Term Mission
        </p>
        <p style={{ color:"#8BAAC5", lineHeight:1.8, fontSize:"14px", fontStyle:"italic" }}>
          "To create a digital twin of Earth's orbital environment that continuously observes, understands,
          predicts, and assists in the safe and efficient operation of satellites in space."
        </p>
      </div>

      {/* CTA */}
      <div style={{ textAlign:"center", paddingBottom:"2rem" }}>
        <button onClick={onLaunch} style={{
          padding:"12px 32px", background:"rgba(0,212,255,0.1)",
          border:"1px solid #00D4FF", color:"#00D4FF",
          borderRadius:"10px", cursor:"pointer", fontSize:"14px",
          fontFamily:"'Space Grotesk', sans-serif", letterSpacing:"2px",
          textTransform:"uppercase"
        }}>
          Launch Simulation →
        </button>
      </div>
    </div>
  )
}

function SimulationSection() {
  const mountRef = (canvas) => {
    if (!canvas || canvas._started) return
    canvas._started = true
    const ctx = canvas.getContext("2d")

    function resize() {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const sats = [
      { name:"ISS",      a:1.06, i:51.6, phase:0,   color:"#00ff88", period:5   },
      { name:"Hubble",   a:1.08, i:28.5, phase:1,   color:"#ff6b35", period:6   },
      { name:"Starlink", a:1.09, i:53.0, phase:2,   color:"#e76f51", period:5.5 },
      { name:"Landsat8", a:1.11, i:98.2, phase:3,   color:"#4ecdc4", period:7   },
      { name:"GOES-18",  a:6.61, i:0.1,  phase:0.5, color:"#e63946", period:24  },
      { name:"Aqua",     a:1.11, i:98.2, phase:4,   color:"#457b9d", period:7   },
      { name:"Terra",    a:1.10, i:98.2, phase:5,   color:"#a8dadc", period:6.8 },
      { name:"NOAA 19",  a:1.11, i:99.1, phase:1.5, color:"#e9c46a", period:7.1 },
      { name:"GPS BIIR", a:4.16, i:55.6, phase:2.5, color:"#f4a261", period:12  },
      { name:"Sentinel", a:1.11, i:98.5, phase:3.5, color:"#2a9d8f", period:7.5 },
    ]

    let t = 0
    function draw() {
      const W = canvas.width, H = canvas.height
      const cx = W/2, cy = H/2, sc = Math.min(W,H) * 0.28

      ctx.fillStyle = "#020b18"
      ctx.fillRect(0, 0, W, H)

      for (let i = 0; i < 150; i++) {
        const sx = (i * 173.1) % W
        const sy = (i * 97.3 + 40) % H
        const op = 0.2 + Math.sin(t * 0.5 + i) * 0.15
        ctx.fillStyle = `rgba(255,255,255,${op})`
        ctx.beginPath()
        ctx.arc(sx, sy, i % 4 === 0 ? 1.2 : 0.6, 0, Math.PI*2)
        ctx.fill()
      }

      const g = ctx.createRadialGradient(cx - sc*0.3, cy - sc*0.3, 0, cx, cy, sc)
      g.addColorStop(0, "#1a6ea8")
      g.addColorStop(0.6, "#0d3d6b")
      g.addColorStop(1, "#050A14")
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(cx, cy, sc, 0, Math.PI*2)
      ctx.fill()

      ctx.strokeStyle = "rgba(79,195,247,0.15)"
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(cx, cy, sc + 2, 0, Math.PI*2)
      ctx.stroke()

      sats.forEach(sat => {
        const angle = sat.phase + (t / sat.period) * Math.PI * 2
        const tilt = sat.i * Math.PI / 180
        const x = cx + sat.a * sc * Math.cos(angle)
        const y = cy - sat.a * sc * Math.sin(angle) * Math.cos(tilt)
        const zVal = sat.a * Math.sin(angle) * Math.sin(tilt)
        const behind = zVal < 0

        ctx.globalAlpha = behind ? 0.25 : 1
        if (!behind) { ctx.shadowColor = sat.color; ctx.shadowBlur = 6 }
        ctx.fillStyle = sat.color
        ctx.beginPath()
        ctx.arc(x, y, 3.5, 0, Math.PI*2)
        ctx.fill()
        ctx.shadowBlur = 0

        if (!behind) {
          ctx.fillStyle = sat.color
          ctx.font = "10px 'JetBrains Mono', monospace"
          ctx.fillText(sat.name, x + 6, y - 4)
        }
        ctx.globalAlpha = 1
      })

      t += 0.016
      requestAnimationFrame(draw)
    }
    draw()
  }

  return (
    <div style={{ height:"100%", display:"flex", flexDirection:"column", padding:"12px", boxSizing:"border-box" }}>
      <p style={{ color:"#4A6880", textAlign:"center", marginBottom:"8px", fontSize:"12px", fontFamily:"'JetBrains Mono', monospace", letterSpacing:"1px" }}>
        LIVE ORBITAL SIMULATION — 10 SATELLITES
      </p>
      <canvas
        ref={mountRef}
        style={{ flex:1, width:"100%", borderRadius:"12px", border:"1px solid #1A2E44", display:"block" }}
      />
    </div>
  )
}
