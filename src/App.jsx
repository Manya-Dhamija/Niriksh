import { useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import Earth from "./components/Earth"
import Stars from "./components/Stars"
import SatelliteList from "./components/SatelliteList"
import SatellitePoint from "./components/SatellitePoint"
import { satellites as tleList } from "./tleData"

export default function App() {
  const [activeTab, setActiveTab] = useState("home")
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
          {["home","about","simulation"].map(tab => (
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

        {/* HOME */}
        {activeTab === "home" && (
          <div style={{ display:"flex", width:"100%", height:"100%" }}>

            {/* Satellite sidebar */}
            <SatelliteList
              satellites={tleList.map(s => ({
                ...s,
                lat: null,
                lon: null,
                alt: null,
              }))}
              selected={selected}
              onSelect={setSelected}
            />

            {/* 3D Canvas */}
            <div style={{ flex:1, position:"relative" }}>
              <Canvas camera={{ position: [0, 0, 3] }}>
                <ambientLight intensity={0.3} />
                <pointLight position={[5, 5, 5]} intensity={1.2} />
                <Stars />
                <Earth />
                {tleList.map((sat) => (
                  <SatellitePoint
                    key={sat.name}
                    tle1={sat.tle1}
                    tle2={sat.tle2}
                    color={sat.color}
                    name={sat.name}
                    isSelected={selected?.name === sat.name}
                    onClick={() => setSelected(sat)}
                  />
                ))}
                <OrbitControls enablePan={false} minDistance={1.5} maxDistance={8} />
              </Canvas>
            </div>

          </div>
        )}

        {activeTab === "about" && <AboutSection />}
        {activeTab === "simulation" && <SimulationSection />}
      </div>
    </div>
  )
}

function AboutSection() {
  return (
    <div style={{ maxWidth:"800px", margin:"0 auto", padding:"3rem 2rem", color:"white", overflowY:"auto", height:"100%" }}>
      <p style={{ letterSpacing:"3px", fontSize:"12px", color:"#00D4FF", marginBottom:"8px" }}>THE IDEA</p>
      <h1 style={{ fontSize:"32px", fontWeight:500, marginBottom:"1rem", color:"#E8F4FF" }}>
        Tracking satellites the way they deserve to be seen
      </h1>
      <p style={{ color:"#8BAAC5", lineHeight:1.8, marginBottom:"2rem" }}>
        Niriksh (Sanskrit: "to observe") is a real-time 3D satellite tracker.
        Using TLE data and the SGP4 propagation model, it computes the exact
        position of 10 real satellites at any moment and renders them on an
        interactive 3D globe. Rotate the Earth, zoom in, select a satellite
        to see its orbital trail, and watch it move in real time.
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:"12px", marginBottom:"2rem" }}>
        {[
          ["React 18","UI framework"],
          ["Three.js","3D engine"],
          ["satellite.js","SGP4 physics"],
          ["Vite","Build tool"],
          ["React Three Fiber","3D renderer"],
          ["GitHub Pages","Deployment"],
        ].map(([name, desc]) => (
          <div key={name} style={{ background:"#0A1628", border:"1px solid #1A2E44", borderRadius:"10px", padding:"1rem" }}>
            <div style={{ fontWeight:500, marginBottom:"4px", color:"#E8F4FF" }}>{name}</div>
            <div style={{ fontSize:"13px", color:"#4A6880" }}>{desc}</div>
          </div>
        ))}
      </div>
      <div style={{ background:"#0A1628", border:"1px solid #1A2E44", borderRadius:"12px", padding:"1.5rem" }}>
        <p style={{ fontSize:"11px", letterSpacing:"2px", color:"#00D4FF", marginBottom:"8px", textTransform:"uppercase" }}>What is TLE data?</p>
        <p style={{ color:"#8BAAC5", lineHeight:1.8, fontSize:"14px", marginBottom:"1rem" }}>
          A Two-Line Element set is a standardised format for specifying the orbital
          parameters of a satellite — inclination, eccentricity, mean motion, and more.
          Niriksh reads these and runs them through SGP4 every frame for live positions.
        </p>
        <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:"11px", color:"#39D353", lineHeight:2, background:"#050A14", padding:"1rem", borderRadius:"8px" }}>
          <div>1 25544U 98067A   23074.92  .00017148  00000-0  10270-3 0  9998</div>
          <div>2 25544  51.6439 250.6048 0008945 310.4539 285.5280 15.50121663</div>
        </div>
      </div>
    </div>
  )
}

function SimulationSection() {
  const canvasRef = typeof window !== "undefined" ? { current: null } : { current: null }
  
  // Use useEffect via inline approach
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

      // Stars
      for (let i = 0; i < 150; i++) {
        const sx = (i * 173.1) % W
        const sy = (i * 97.3 + 40) % H
        const op = 0.2 + Math.sin(t * 0.5 + i) * 0.15
        ctx.fillStyle = `rgba(255,255,255,${op})`
        ctx.beginPath()
        ctx.arc(sx, sy, i % 4 === 0 ? 1.2 : 0.6, 0, Math.PI*2)
        ctx.fill()
      }

      // Earth
      const g = ctx.createRadialGradient(cx - sc*0.3, cy - sc*0.3, 0, cx, cy, sc)
      g.addColorStop(0, "#1a6ea8")
      g.addColorStop(0.6, "#0d3d6b")
      g.addColorStop(1, "#050A14")
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(cx, cy, sc, 0, Math.PI*2)
      ctx.fill()

      // Atmosphere
      ctx.strokeStyle = "rgba(79,195,247,0.15)"
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(cx, cy, sc + 2, 0, Math.PI*2)
      ctx.stroke()

      // Satellites
      sats.forEach(sat => {
        const angle = sat.phase + (t / sat.period) * Math.PI * 2
        const tilt = sat.i * Math.PI / 180
        const x = cx + sat.a * sc * Math.cos(angle)
        const y = cy - sat.a * sc * Math.sin(angle) * Math.cos(tilt)
        const zVal = sat.a * Math.sin(angle) * Math.sin(tilt)
        const behind = zVal < 0

        ctx.globalAlpha = behind ? 0.25 : 1

        // Glow
        if (!behind) {
          ctx.shadowColor = sat.color
          ctx.shadowBlur = 6
        }

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
