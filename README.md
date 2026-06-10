# Niriksh

**Building the Awareness Layer of Earth's Orbit**

Niriksh is an orbital intelligence platform that aims to monitor, understand, and eventually help manage the increasingly complex environment surrounding Earth.

As thousands of satellites and debris objects continue to populate Earth's orbit, operators face growing challenges in tracking objects, assessing risks, planning maneuvers, and maintaining mission safety.

Niriksh starts with a simple goal:

> Visualize and understand everything orbiting Earth.

Over time, it aims to evolve into a platform capable of providing orbital awareness, risk assessment, collision prediction, and decision-support tools for satellite operators.

---

## Vision

The future of space will involve tens of thousands of satellites operating simultaneously.

Niriksh aims to become the intelligence layer that helps understand this environment by answering questions such as:

* What is currently orbiting Earth?
* Where will a satellite be in the future?
* Which orbital regions are becoming congested?
* Which objects pose potential risks?
* What actions can operators take to reduce those risks?

Rather than focusing on a single satellite, Niriksh focuses on the orbital ecosystem as a whole.

---

## Current Scope (MVP)

The initial version of Niriksh focuses on:

* 🌍 Interactive 3D Earth visualization
* 🛰️ Real-time satellite simulation
* 📡 Orbit propagation using public TLE data
* 🔍 Satellite search and inspection
* 📊 Basic orbital analytics

The goal of this phase is to build a digital representation of Earth's orbital environment.

---

## Future Roadmap

### Phase 1 — Orbital Visualization

* Visualize real satellites in orbit
* Display orbital paths
* Satellite information panels
* Search and filtering

### Phase 2 — Orbital Awareness

* Conjunction detection
* Orbital congestion analysis
* Risk heatmaps
* Debris tracking

### Phase 3 — Orbital Intelligence

* Collision probability estimation
* Risk scoring
* Future orbit forecasting
* Traffic analysis

### Phase 4 — Decision Support

* Maneuver recommendations
* Fuel optimization
* Mission planning assistance
* Fleet-level analytics

### Phase 5 — Orbital Operating System

* Autonomous orbital intelligence
* Multi-satellite coordination
* Orbital traffic management tools
* AI-powered decision support

---

## Technology Stack

* React
* Vite
* Three.js
* React Three Fiber
* Satellite.js (SGP4 Propagation)
* GitHub Pages

---

## Project Philosophy

Most people see satellites as individual objects.

Niriksh sees Earth's orbit as a living system.

The mission is not simply to track satellites.

The mission is to build awareness of the orbital environment itself.

---

## Long-Term Mission

> To create a digital twin of Earth's orbital environment that continuously observes, understands, predicts, and assists in the safe and efficient operation of satellites in space.

---

## Status

🚧 Early Development

Currently focused on building the first visualization and simulation layer.

The journey begins with understanding orbit.

The destination is orbital intelligence.


A real-time 3D satellite tracker built with React, Three.js, and TLE orbital data.  
Tracks 10 real satellites using the SGP4 propagation model.

![Tech Stack](https://img.shields.io/badge/React-18-61DAFB?logo=react) 
![Three.js](https://img.shields.io/badge/Three.js-0.157-black?logo=three.js)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- 🌍 Interactive 3D Earth with orbit controls (rotate, zoom)
- 🛰️ 10 real satellites tracked in real time (ISS, Hubble, Landsat, GOES, Starlink, and more)
- 📡 SGP4 orbital propagation via `satellite.js`
- 🔍 Searchable satellite list with live lat/lon/altitude readout
- 🌠 Orbit trail visualization on selection
- 🚀 Deploys automatically to GitHub Pages via GitHub Actions

## Live Demo

`https://<your-username>.github.io/orbit-os/`  
*(after deployment — see instructions below)*

---

## Getting Started

### Prerequisites
- Node.js ≥ 16
- npm ≥ 8

### Local development

```bash
# 1. Clone the repo
git clone https://github.com/<your-username>/orbit-os.git
cd orbit-os

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev
# → Open http://localhost:5173
```

### Build for production
```bash
npm run build
# Static files output to ./dist/

npm run preview
# Preview the production build locally
```

---

## Deploying to GitHub Pages

### Step 1 — Edit `vite.config.js`
Change the `base` field to match your repository name:
```js
base: '/your-repo-name/',  // ← change this
```

### Step 2 — Push to GitHub
```bash
git add .
git commit -m "initial commit"
git push origin main
```

### Step 3 — Enable GitHub Pages via Actions
1. Go to your repo → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. The workflow at `.github/workflows/deploy.yml` runs automatically on every push to `main`
4. After ~1 minute, your site is live at `https://<username>.github.io/<repo-name>/`

---

## Project Structure

```
orbit-os/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Auto-deploy to GitHub Pages
├── src/
│   ├── components/
│   │   ├── Earth.jsx           # 3D Earth globe
│   │   ├── SatellitePoint.jsx  # Individual satellite + trail
│   │   ├── SatelliteList.jsx   # Sidebar UI
│   │   └── Stars.jsx           # Background starfield
│   ├── utils/
│   │   └── orbital.js          # SGP4 propagation helpers
│   ├── tleData.js              # TLE data for 10 satellites
│   ├── App.jsx                 # Root component
│   └── main.jsx                # Entry point
├── index.html
├── vite.config.js
└── package.json
```

---

## Updating TLE Data

TLE (Two-Line Element) data gets stale over time. Refresh it from:
- **CelesTrak**: https://celestrak.org/SOCRATES/
- **Space-Track**: https://www.space-track.org/ (free account required)

Edit `src/tleData.js` and replace the `tle1` / `tle2` strings for each satellite.

---

## Tech Stack

| Package | Purpose |
|---|---|
| `react` + `react-dom` | UI framework |
| `three` | 3D engine |
| `@react-three/fiber` | React renderer for Three.js |
| `@react-three/drei` | R3F helpers (OrbitControls, Html) |
| `satellite.js` | SGP4 orbital propagation |
| `vite` | Build tool |

---

## License

MIT — free to use, modify, and distribute.

---

*Built with satellite.js SGP4 model. Orbital positions are computed in real time from TLE data.*
