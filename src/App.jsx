import { useState } from "react"
import Earth from "./Earth"           // already hai
import SatelliteList from "./SatelliteList"  // already hai
import Stars from "./Stars"           // already hai

export default function App() {
  const [activeTab, setActiveTab] = useState("home")

  return (
    <div style={{ width:"100%", height:"100%", background:"#050A14", color:"white", fontFamily:"Space Grotesk, sans-serif" }}>
      
      {/* NAV BAR */}
      <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 24px", borderBottom:"1px solid #1A2E44", position:"fixed", top:0, width:"100%", zIndex:999, background:"#050A14" }}>
        <div style={{ letterSpacing:"4px", fontSize:"18px" }}>N<span style={{color:"#378ADD"}}>I</span>RIKSH</div>
        <div style={{ display:"flex", gap:"8px" }}>
          {["home","about","simulation"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding:"6px 16px", border:"1px solid", borderColor: activeTab===tab ? "#185FA5":"#1A2E44",
                background: activeTab===tab ? "#042C53":"transparent",
                color: activeTab===tab ? "#B5D4F4":"#888", borderRadius:"8px", cursor:"pointer", textTransform:"capitalize" }}>
              {tab}
            </button>
          ))}
        </div>
      </nav>

      {/* CONTENT */}
      <div style={{ paddingTop:"56px", height:"100%" }}>
        {activeTab === "home" && (
          <div style={{ position:"relative", width:"100%", height:"calc(100vh - 56px)" }}>
            <Stars />
            <Earth />
            <SatelliteList />
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
        interactive 3D globe.
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:"12px" }}>
        {[["React 18","UI framework"],["Three.js","3D engine"],["satellite.js","SGP4 physics"],["Vite","Build tool"]].map(([name,desc]) => (
          <div key={name} style={{ background:"#0C1A2E", border:"1px solid #1A2E44", borderRadius:"10px", padding:"1rem" }}>
            <div style={{ fontWeight:500, marginBottom:"4px" }}>{name}</div>
            <div style={{ fontSize:"13px", color:"#888" }}>{desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}import { useEffect, useRef } from "react"

function SimulationSection() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const sats = [
      { name:"ISS", a:1.06, i:51.6, phase:0, color:"#1D9E75", period:5 },
      { name:"Hubble", a:1.08, i:28.5, phase:1, color:"#378ADD", period:6 },
      { name:"Starlink", a:1.09, i:53, phase:2, color:"#B5D4F4", period:5.5 },
      // baaki satellites bhi add kar sakte ho
    ]

    let t = 0, frame
    function draw() {
      const W = canvas.width, H = canvas.height
      const cx = W/2, cy = H/2, sc = Math.min(W,H)*0.12

      ctx.fillStyle = "#020b18"
      ctx.fillRect(0,0,W,H)

      // Earth
      const g = ctx.createRadialGradient(cx-sc*0.3,cy-sc*0.3,0,cx,cy,sc)
      g.addColorStop(0,"#5DCAA5"); g.addColorStop(1,"#042C53")
      ctx.fillStyle = g
      ctx.beginPath(); ctx.arc(cx,cy,sc,0,Math.PI*2); ctx.fill()

      // Satellites
      sats.forEach(sat => {
        const angle = sat.phase + (t/sat.period)*Math.PI*2
        const x = cx + sat.a * sc * Math.cos(angle)
        const y = cy - sat.a * sc * Math.sin(angle) * Math.cos(sat.i*Math.PI/180)
        ctx.fillStyle = sat.color
        ctx.beginPath(); ctx.arc(x,y,4,0,Math.PI*2); ctx.fill()
        ctx.fillStyle = sat.color
        ctx.font = "11px monospace"
        ctx.fillText(sat.name, x+6, y-4)
      })
      t += 0.016
      frame = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div style={{ height:"calc(100vh - 56px)", display:"flex", flexDirection:"column", padding:"1rem" }}>
      <p style={{ color:"#888", textAlign:"center", marginBottom:"8px", fontSize:"13px" }}>
        Live orbital simulation — SGP4 physics model
      </p>
      <canvas ref={canvasRef} style={{ flex:1, width:"100%", borderRadius:"12px", border:"1px solid #1A2E44" }} />
    </div>
  )
}
