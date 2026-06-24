import { useState, useEffect, useRef } from "react"
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
  const [satellites, setSatellites] = useState(
    tleList.map(s => ({ ...s, lat: null, lon: null, alt: null }))
  )

  // SatellitePoint se position update receive karne ke liye
  const handlePositionUpdate = (updatedSats) => {
    setSatellites(updatedSats)
  }

  return (
    <div style={{ width:"100%", height:"100%", background:"#050A14", color:"white", fontFamily:"Space Grotesk, sans-serif" }}>

      {/* NAV BAR */}
      <nav style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"12px 24px", borderBottom:"1px solid #1A2E44",
        position:"fixed", top:0, width:"100%", zIndex:999, background:"#050A14"
      }}>
        <div style={{ letterSpacing:"4px", fontSize:"18px" }}>
          N<span style={{color:"#378ADD"}}>I</span>RIKSH
        </div>
        <div style={{ display:"flex", gap:"8px" }}>
          {["home","about","simulation"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{
                padding:"6px 16px", border:"1px solid",
                borderColor: activeTab===tab ? "#185FA5" : "#1A2E44",
                background: activeTab===tab ? "#042C53" : "transparent",
                color: activeTab===tab ? "#B5D4F4" : "#888",
                borderRadius:"8px", cursor:"pointer", textTransform:"capitalize"
              }}>
              {tab}
            </button>
          ))}
        </div>
      </nav>

      {/* CONTENT */}
      <div style={{ paddingTop:"56px", height:"100%" }}>

        {/* HOME */}
        {activeTab === "home" && (
          <div style={{ display:"flex", width:"100%", height:"calc(100vh - 56px)" }}>

            {/* Satellite List — Canvas ke bahar, left side */}
            <SatelliteList
              satellites={satellites}
              selected={selected}
              onSelect={setSelected}
            />

            {/* 3D Globe — Canvas ke andar */}
            <div style={{ flex:1, position:"relative" }}>
              <Canvas camera={{ position: [0, 0, 3] }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <Stars />
                <Earth />
                <SatellitePoint
                  selected={selected}
                  onSelect={setSelected}
                  onPositionUpdate={handlePositionUpdate}
                />
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
    <div style={{ maxWidth:"800px", margin:"0 auto", padding:"3rem 2rem", color:"white" }}>
      <p style={{ letterSpacing:"3px", fontSize:"12px", color:"#378ADD", marginBottom:"8px" }}>THE IDEA</p>
      <h1 style={{ fontSize:"32px", fontWeight:500, marginBottom:"1rem" }}>
        Tracking satellites the way they deserve to be seen
      </h1>
      <p style={{ color:"#aaa", lineHeight:1.8, marginBottom:"2rem" }}>
        Niriksh (Sanskrit: "to observe") is a real-time 3D satellite tracker.
        Using TLE data and the SGP4 propagation model, it computes the exact
        position of 10 real satellites at any moment and renders them on an
        interactive 3D globe. You can rotate the Earth, zoom in, select a
        satellite to see its orbital path, and watch it move in real time.
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:"12px" }}>
        {[
          ["React 18","UI framework"],
          ["Three.js","3D engine"],
          ["satellite.js","SGP4 physics"],
          ["Vite","Build tool"],
          ["R3F","React Three Fiber"],
          ["GitHub Pages","Deployment"],
        ].map(([name, desc]) => (
          <div key={name} style={{ background:"#0C1A2E", border:"1px solid #1A2E44", borderRadius:"10px", padding:"1rem" }}>
            <div style={{ fontWeight:500, marginBottom:"4px", color:"#E8F4FF" }}>{name}</div>
            <div style={{ fontSize:"13px", color:"#4A6880" }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* TLE explanation */}
      <div style={{ marginTop:"2rem", background:"#0A1628", border:"1px solid #1A2E44", borderRadius:"12px", padding:"1.5rem" }}>
        <p style={{ fontSize:"12px", letterSpacing:"2px", color:"#378ADD", marginBottom:"8px" }}>WHAT IS TLE DATA?</p>
        <p style={{ color:"#aaa", lineHeight:1.8, fontSize:"14px", marginBottom:"1rem" }}>
          A Two-Line Element set is a standardised format for specifying orbital parameters of a satellite.
          Niriksh reads these and runs them through SGP4 every frame to give you live position.
        </p>
        <div style={{ fontFamily:"monospace", fontSize:"12px", color:"#1D9E75", lineHeight:2 }}>
          <div>1 25544U 98067A   24001.00000000  .00005000  00000-0  80000-4 0  9999</div>
          <div>2 25544  51.6400 339.4900 0001234  91.2000 268.9000 15.49500000000000</div>
        </div>
      </div>
    </div>
  )
}

function SimulationSection() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")

    function resize() {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener("resize", resize)

    const sats = [
      { name:"ISS",      a:1.06, i:51.6, phase:0,   color:"#1D9E75", period:5   },
      { name:"Hubble",   a:1.08, i:28.5, phase:1,   color:"#378ADD", period:6   },
      { name:"Starlink", a:1.09, i:53.0, phase:2,   color:"#B5D4F4", period:5.5 },
      { name:"Landsat",  a:1.11, i:98.2, phase:3,   color:"#FAC775", period:7   },
      { name:"GOES-18",  a:6.61, i:0.1,  phase:0.5, color:"#ED93B1", period:24  },
      { name:"Aqua",     a:1.11, i:98.2, phase:4,   color:"#5DCAA5", period:7   },
      { name:"Terra",    a:1.10, i:98.2, phase:5,   color:"#AFA9EC", period:6.8 },
      { name:"NOAA-20",  a:1.11, i:98.7, phase:1.5, color:"#F0997B", period:7.1 },
      { name:"GPS IIR",  a:4.16, i:55.0, phase:2.5, color:"#CED3C6", period:12  },
      { name:"Jason-3",  a:1.21, i:66.0, phase:3.5, color:"#FAC775", period:7.5 },
    ]

    let t = 0, frame

    function draw() {
      const W = canvas.width, H = canvas.height
      const cx = W/2, cy = H/2, sc = Math.min(W,H) * 0.28

      ctx.fillStyle = "#020b18"
      ctx.fillRect(0, 0, W, H)

      for (let i = 0; i < 120; i++) {
        const sx = (i * 173.1) % W
        const sy = (i * 97.3 + 40) % H
        const op = 0.3 + Math.sin(t * 0.5 + i) * 0.2
        ctx.fillStyle = `rgba(255,255,255,${op})`
        ctx.beginPath()
        ctx.arc(sx, sy, i % 3 === 0 ? 1.2 : 0.6, 0, Math.PI*2)
        ctx.fill()
      }

      const g = ctx.createRadialGradient(cx - sc*0.3, cy - sc*0.3, 0, cx, cy, sc)
      g.addColorStop(0, "#5DCAA5")
      g.addColorStop(0.5, "#1D9E75")
      g.addColorStop(1, "#042C53")
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(cx, cy, sc, 0, Math.PI*2)
      ctx.fill()

      sats.forEach(sat => {
        const angle = sat.phase + (t / sat.period) * Math.PI * 2
        const tilt = sat.i * Math.PI / 180
        const x = cx + sat.a * sc * Math.cos(angle)
        const y = cy - sat.a * sc * Math.sin(angle) * Math.cos(tilt)
        const behind = Math.sin(angle) * Math.sin(tilt) < 0

        ctx.globalAlpha = behind ? 0.3 : 1
        ctx.fillStyle = sat.color
        ctx.beginPath()
        ctx.arc(x, y, 3.5, 0, Math.PI*2)
        ctx.fill()

        if (!behind) {
          ctx.font = "10px monospace"
          ctx.fillText(sat.name, x + 6, y - 4)
        }
        ctx.globalAlpha = 1
      })

      t += 0.016
      frame = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
    }
  }, [])

  return (
    <div style={{ height:"calc(100vh - 56px)", display:"flex", flexDirection:"column", padding:"1rem" }}>
      <p style={{ color:"#888", textAlign:"center", marginBottom:"8px", fontSize:"13px" }}>
        Live orbital simulation — 10 satellites tracked in real time
      </p>
      <canvas
        ref={canvasRef}
        style={{ flex:1, width:"100%", borderRadius:"12px", border:"1px solid #1A2E44" }}
      />
    </div>
  )
}
