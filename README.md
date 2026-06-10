# ⬡ Niriksh — Live Satellite Tracker

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
