function AboutSection({ onLaunch }) {
  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "3rem 2rem",
        color: "white",
        overflowY: "auto",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Hero */}

      <p
        style={{
          letterSpacing: "3px",
          fontSize: "11px",
          color: "#00D4FF",
          marginBottom: "8px",
          textTransform: "uppercase",
        }}
      >
        SPACE OPERATIONS INTELLIGENCE PLATFORM
      </p>

      <h1
        style={{
          fontSize: "38px",
          fontWeight: 600,
          marginBottom: "1.2rem",
          color: "#E8F4FF",
          lineHeight: 1.3,
        }}
      >
        Building the Intelligence Layer
        <br />
        for Space Operations
      </h1>

      <p
        style={{
          color: "#8BAAC5",
          lineHeight: 1.9,
          marginBottom: "1rem",
          fontSize: "15px",
        }}
      >
        Niriksh is an AI-powered space intelligence platform designed to help
        operators observe, simulate, understand, predict, and optimize the
        increasingly complex orbital environment surrounding Earth.
      </p>

      <p
        style={{
          color: "#8BAAC5",
          lineHeight: 1.9,
          marginBottom: "2rem",
          fontSize: "15px",
        }}
      >
        As thousands of satellites, launch vehicles, and debris objects
        continue to populate space, mission operators require more than
        dashboards—they need systems capable of transforming raw orbital data
        into actionable intelligence.
      </p>

      {/* Mission Quote */}

      <div
        style={{
          borderLeft: "3px solid #00D4FF",
          paddingLeft: "1.25rem",
          marginBottom: "2.5rem",
          color: "#E8F4FF",
          fontSize: "16px",
          fontStyle: "italic",
          lineHeight: 1.8,
        }}
      >
        "Observe. Simulate. Understand. Predict. Recommend."
      </div>

      {/* WHY NIRIKSH */}

      <p
        style={{
          letterSpacing: "2px",
          fontSize: "11px",
          color: "#00D4FF",
          marginBottom: "12px",
          textTransform: "uppercase",
        }}
      >
        WHY NIRIKSH
      </p>

      <div
        style={{
          background: "#0A1628",
          border: "1px solid #1A2E44",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "2.5rem",
        }}
      >
        <p
          style={{
            color: "#8BAAC5",
            lineHeight: 1.8,
            fontSize: "14px",
          }}
        >
          The space industry is growing faster than ever.
          New launch providers, satellite constellations, Earth observation
          missions, and commercial operators are transforming Earth's orbit into
          one of the most complex operational environments ever created.
        </p>

        <p
          style={{
            color: "#8BAAC5",
            lineHeight: 1.8,
            fontSize: "14px",
            marginTop: "1rem",
          }}
        >
          While hardware capabilities continue to advance rapidly, operational
          software remains fragmented across multiple tools for tracking,
          simulation, collision monitoring, and mission planning.
        </p>

        <p
          style={{
            color: "#E8F4FF",
            lineHeight: 1.8,
            fontSize: "14px",
            marginTop: "1rem",
            fontWeight: 500,
          }}
        >
          Niriksh aims to unify these capabilities into a single intelligence
          platform that transforms space data into operational decisions.
        </p>
      </div>

      {/* Current MVP */}

      <p
        style={{
          letterSpacing: "2px",
          fontSize: "11px",
          color: "#00D4FF",
          marginBottom: "12px",
          textTransform: "uppercase",
        }}
      >
        CURRENT MVP — ORBITAL DIGITAL TWIN
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "14px",
          marginBottom: "2.5rem",
        }}
      >
        {[
          [
            "🌍",
            "Interactive 3D Earth",
            "Explore Earth's orbital environment in real time.",
          ],
          [
            "🛰️",
            "Live Satellite Tracking",
            "Visualize satellites using real orbital propagation.",
          ],
          [
            "📡",
            "Orbit Propagation",
            "Powered by public TLE datasets and SGP4.",
          ],
          [
            "🔍",
            "Satellite Explorer",
            "Search and inspect satellites with live orbital data.",
          ],
          [
            "🌠",
            "Orbit Visualization",
            "Visualize orbital trajectories around Earth.",
          ],
          [
            "📊",
            "Orbital Analytics",
            "Understand altitude, inclination, velocity and orbital parameters.",
          ],
        ].map(([icon, title, desc]) => (
          <div
            key={title}
            style={{
              background: "#0A1628",
              border: "1px solid #1A2E44",
              borderRadius: "10px",
              padding: "1rem",
            }}
          >
            <div style={{ fontSize: "22px", marginBottom: "8px" }}>
              {icon}
            </div>

            <div
              style={{
                color: "#E8F4FF",
                fontWeight: 500,
                marginBottom: "6px",
                fontSize: "14px",
              }}
            >
              {title}
            </div>

            <div
              style={{
                color: "#6D8CA7",
                fontSize: "12px",
                lineHeight: 1.7,
              }}
            >
              {desc}
            </div>
          </div>
        ))}
      </div>

      {/* Vision */}

      <div
        style={{
          background: "#0A1628",
          border: "1px solid #1A2E44",
          borderRadius: "12px",
          padding: "1.5rem",
          marginBottom: "2.5rem",
        }}
      >
        <p
          style={{
            letterSpacing: "2px",
            fontSize: "11px",
            color: "#00D4FF",
            marginBottom: "12px",
            textTransform: "uppercase",
          }}
        >
          Long-Term Vision
        </p>

        <p
          style={{
            color: "#8BAAC5",
            lineHeight: 1.9,
            fontSize: "14px",
          }}
        >
          Earth's orbit is only the first domain of the Niriksh intelligence
          platform.
        </p>

        <p
          style={{
            color: "#8BAAC5",
            lineHeight: 1.9,
            fontSize: "14px",
            marginTop: "1rem",
          }}
        >
          Future versions will expand into mission planning, operational
          intelligence, AI-assisted decision support, digital mission twins, and
          eventually broader planetary-scale systems such as climate,
          environmental monitoring, disaster resilience, and infrastructure
          intelligence.
        </p>

        <p
          style={{
            color: "#E8F4FF",
            lineHeight: 1.9,
            marginTop: "1.2rem",
            fontStyle: "italic",
          }}
        >
          "From orbital awareness to planetary intelligence."
        </p>
      </div>

      {/* CTA */}

      <div style={{ textAlign: "center", paddingBottom: "2rem" }}>
        <button
          onClick={onLaunch}
          style={{
            padding: "12px 34px",
            background: "rgba(0,212,255,0.1)",
            border: "1px solid #00D4FF",
            color: "#00D4FF",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "14px",
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: "2px",
            textTransform: "uppercase",
          }}
        >
          Launch Orbital Simulation →
        </button>
      </div>
    </div>
  );
}
