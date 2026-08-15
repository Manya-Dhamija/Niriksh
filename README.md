# Niriksh — Planetary Intelligence for Renewable Siting

**V1 scope: utility-scale solar project pre-feasibility in India.**

Niriksh answers one question for a renewable-energy developer: *"Is this
potential solar project site worth pursuing?"* — by combining public
geospatial and climate datasets into a transparent, auditable **Project
Feasibility Score (0–100)**, an interactive map, and a plain-language
recommendation.

This is a working prototype, not a mockup: pick a reference site (or draw
your own boundary), set a capacity, and get a real scored report computed by
an actual scoring engine running against real geospatial data.

This repo contains two things that ship together but deploy separately:

- **The marketing site** (`index.html`, `style.css`, `script.js`, plus the
  built app in `app/`) — a static site, goes straight to GitHub Pages.
- **The Score Engine** (`backend/` + `frontend/`) — a real FastAPI + React
  app. The built frontend lives in `app/` and rides along with the marketing
  site; the FastAPI backend needs an actual server, since GitHub Pages only
  serves static files.

---

## 0. Deploying this to the internet

This is the part that differs from a plain static site — read this before
you push to GitHub.

### Step 1 — Marketing site + app, on GitHub Pages (free, static)

Push everything **except** `backend/` and `frontend/` to the root of your
repo (or push everything — the extra folders are harmless, GitHub Pages just
won't serve them as pages). Then:

1. Repo → **Settings → Pages**
2. **Source**: Deploy from a branch → `main` → `/ (root)` → **Save**
3. Live in a minute or two at `https://<you>.github.io/<repo>/`, with the
   Score Engine reachable at `https://<you>.github.io/<repo>/app/`

No build step, no Actions workflow — `app/` already contains the built
React app.

### Step 2 — The backend, somewhere that runs Python (this part is required)

GitHub Pages **cannot** run `backend/`. Pick any host that runs a Python web
service; [Render](https://render.com)'s free tier is the least fuss:

1. New **Web Service** → connect this repo → set **Root Directory** to
   `backend`
2. **Build command**: `pip install -r requirements.txt`
3. **Start command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add an environment variable **`NIRIKSH_CORS_ORIGINS`** set to your GitHub
   Pages origin, e.g. `https://<you>.github.io` (comma-separate multiple
   origins if needed) — without this, the browser will block requests from
   your deployed site with a CORS error.
5. Deploy. You'll get a URL like `https://niriksh-backend.onrender.com`.
   Hit `https://niriksh-backend.onrender.com/api/health` to confirm it's up.

(Railway and Fly.io work the same way, if you'd rather use those.)

### Step 3 — Point the deployed app at the deployed backend

Open `app/config.js` in your repo (directly in GitHub's web editor is fine —
no local setup needed) and set:

```js
window.__NIRIKSH_CONFIG__ = {
  apiBaseUrl: "https://niriksh-backend.onrender.com"  // your Step 2 URL
};
```

Commit it, refresh `.../app/`, and the app is live end-to-end. This file is
the **only** thing you touch to repoint the app at a different backend —
never needs a rebuild.

> Free-tier hosts like Render's typically spin down when idle, so the first
> request after a quiet period can take 20–30 seconds while it wakes up.
> That's the host, not the app.

---

## 1. Quick start (running it locally, for development)

### Backend (FastAPI)

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate   # optional but recommended
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

API docs: `http://localhost:8000/docs`
Health check: `http://localhost:8000/api/health`

### Frontend (React + TypeScript + Vite)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

App: `http://localhost:5173`

No API keys are required to run the full demo — five real Indian solar
regions ship with cached, source-attributed data (see §4).

---

## 2. Product workflow

```
Select site (reference site OR draw a polygon)
        │
        ▼
Set capacity (MW) + module technology
        │
        ▼
Run Feasibility Analysis  ──►  POST /api/analyze
        │
        ▼
Feasibility report:
  • Overall score (0–100) + recommendation band
  • 9 individual factor scores, each with raw value, rating, explanation, source
  • Interactive map: site boundary, substation, illustrative grid tie-in,
    protected-area buffer
  • Key advantages / key risks (auto-derived from factor ratings)
  • Estimated annual generation (GWh/year)
  • Data sources & assumptions
```

---

## 3. Architecture

```
niriksh/
├── index.html, style.css, script.js   Marketing site (static, → GitHub Pages)
│
├── app/                     Built Score Engine — the compiled output of
│   ├── index.html           frontend/, checked in so GitHub Pages can serve
│   ├── config.js            it with zero build step. config.js is the one
│   └── assets/              file you edit to point it at your backend.
│
├── backend/                 FastAPI source — needs a real Python host
│   ├── app/
│   │   ├── main.py            FastAPI app, CORS, router wiring
│   │   ├── schemas.py         Pydantic request/response contracts
│   │   ├── data_sites.py      Cached reference data for 5 demo sites (+ source notes)
│   │   ├── weights.json       Configurable scoring weights (edit, no code change needed)
│   │   ├── scoring.py         Transparent factor-scoring + weighted composite engine
│   │   ├── geo_utils.py       Shapely/GeoPandas geometry + IDW interpolation for custom sites
│   │   ├── map_layers.py      Builds GeoJSON layers returned to the frontend map
│   │   └── routers/
│   │       ├── sites.py       GET /api/sites
│   │       └── analyze.py     POST /api/analyze (the core endpoint)
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/                Score Engine source — edit here, then
    ├── src/                 `npm run build` and copy dist/ over app/
    │   ├── App.tsx                 State orchestration + layout
    │   ├── api/client.ts           Typed fetch wrapper for the backend
    │   ├── types/index.ts          TypeScript mirror of the Pydantic schemas
    │   ├── components/
    │   │   ├── Header.tsx
    │   │   ├── ControlPanel.tsx    Site select / draw / capacity / tech / analyze
    │   │   ├── MapView.tsx         Leaflet map, drawing tool, result layers
    │   │   ├── ScorePanel.tsx      Overall score gauge + recommendation
    │   │   ├── FactorBreakdown.tsx Per-factor score bars with explanations
    │   │   ├── RiskAdvantages.tsx  Auto-derived advantages/risks lists
    │   │   ├── GenerationCard.tsx  Estimated annual generation
    │   │   └── SourcesFooter.tsx   Data sources, assumptions, data-mode banner
    │   └── styles/
    ├── public/config.js        Source of app/config.js (copied in at build time)
    ├── package.json
    └── .env.example
```

**Why `app/` is checked in as a build:** GitHub Pages can't run `npm run
build` for you, so the compiled output has to already exist in the repo.
If you change anything in `frontend/src`, rebuild locally (`npm run
build`) and copy `frontend/dist/*` over `app/*` — `config.js` will survive
untouched since it isn't part of the source build path Vite tracks, but
double check it after copying.

**Why this split:** the scoring methodology lives entirely in the backend as
plain, testable Python functions (`scoring.py`) with weights externalized to
`weights.json`. The frontend never computes or guesses a score — it only
renders what the API returns. This means the same scoring engine could be
called from a CLI, a batch job, or a future mobile app without duplicating
logic.

---

## 4. Data sources & how the demo works

Niriksh V1 ships **without requiring any external API keys**, per the brief.
Five real, publicly known utility-scale solar regions in India are shipped
with **cached, source-attributed reference data**:

| Site | State | Notes |
|---|---|---|
| Bhadla Solar Park region | Rajasthan | Thar desert, one of the world's largest solar parks |
| Charanka Solar Park region | Gujarat | Established solar park cluster near the Little Rann |
| Pavagada Solar Park region | Karnataka | 2,050 MW park on leased farmland, Deccan plateau |
| Kurnool Ultra Mega Solar Park region | Andhra Pradesh | Near the Krishna/Tungabhadra basin |
| Khavda Renewable Energy Park region | Gujarat | World's largest under-construction RE park, Kutch |

Each site's factor values (irradiance, slope, land cover, distances,
flood/heat/water figures) are **real, representative long-term figures for
that region**, compiled from the *type* of dataset that would back them in
production. They are explicitly a cached snapshot — not a live pull for a
specific date — and this is stated in the API response (`data_mode:
"cached_demo_site"`) and shown in the UI, so no one mistakes a demo figure
for a live measurement.

| Factor | Dataset | Provider | Resolution |
|---|---|---|---|
| Solar resource (GHI/DNI) | Global Solar Atlas | World Bank/ESMAP + Solargis | ~250m, long-term climatology |
| Elevation & slope | SRTM 30m / Copernicus GLO-30 DEM | NASA / ESA | 30m |
| Land use / land cover | ESA WorldCover | ESA (Sentinel-2 derived) | 10m |
| Roads | OpenStreetMap | OSM contributors | vector |
| Transmission / substations | OpenStreetMap `power=*` tags, cross-checked vs. CEA/POSOCO public maps | — | vector |
| Environmental constraints | WDPA | UNEP-WCMC / IUCN | vector |
| Flood exposure | CWC Flood Atlas | Central Water Commission, India | district/basin |
| Extreme heat | IMD Climate Normals (1991–2020) | India Meteorological Department | station-interpolated |
| Water availability | CGWB groundwater assessment | Central Ground Water Board, India | block level |

**Drawing a custom site:** if you draw your own polygon instead of picking a
reference site, Niriksh does **not** fabricate numbers for it. It performs a
transparent **inverse-distance-weighted (IDW) interpolation** of the 5
cached reference sites (`geo_utils.interpolate_raw_factors`), and the API
response is flagged `data_mode: "interpolated_custom_site"` with the
distance to the nearest reference site, so the report is honest about its
own uncertainty. This is intentionally a coarse screen, not a substitute for
a real data pull.

### Moving beyond the demo cache

`backend/.env.example` documents the live endpoints (NASA POWER, Global
Solar Atlas API, OpenStreetMap Overpass, OpenTopography, Sentinel Hub) that
would replace the cache in a production deployment, plus a
`NIRIKSH_ENABLE_LIVE_FETCH` flag as the intended integration point. Wiring
these in is the main piece of work for a V1.1: each cached lookup in
`analyze.py` would become a live fetch with the cache as a fallback.

---

## 5. Scoring methodology

The **Project Feasibility Score** is a weighted composite of 9 factor scores,
each independently normalized from a raw physical/geospatial measurement to
0–100. There is no AI/ML model in this loop — every transformation is a
documented, deterministic function in `backend/app/scoring.py`.

| Factor | Weight | Normalization | Rationale |
|---|---|---|---|
| Solar Resource (GHI) | 24% | Linear map across India's 3.5–6.3 kWh/m²/day range | Primary driver of energy yield |
| Grid / Transmission Proximity | 16% | `100 − 6 × km_to_substation` | Interconnection cost dominates project economics |
| Terrain (slope) | 11% | `100 − 15 × slope_%` | Drives earthworks/grading cost |
| Land Use / Land Cover | 11% | Category base score − conflict penalty | Barren/scrub land scores highest; active cropland/forest lowest |
| Environmental Constraints | 10% | `2.5 × km_to_protected_area` | Proximity to protected areas raises clearance risk |
| Road Accessibility | 9% | `100 − 8 × km_to_paved_road` | Construction logistics cost |
| Flood Exposure | 8% | Categorical (low/moderate/high) | Binary-ish risk, not a smooth gradient in practice |
| Extreme Heat / Climate Risk | 6% | `100 − 0.6 × days_above_40°C` | PV output derates with panel temperature |
| Water Availability | 5% | Category base − groundwater-depth penalty | Low weight — utility-scale PV has minimal water demand, but affects O&M logistics |

Weights sum to 1.0 and live in `backend/app/weights.json` — **change them
without touching code** to reflect your organization's risk appetite (e.g.
raise the grid-proximity weight if interconnection cost dominates your
economics).

**Recommendation bands** (from the weighted overall score):

| Score | Recommendation |
|---|---|
| ≥ 85 | Highly Suitable |
| 70–84 | Suitable |
| 55–69 | Moderate |
| 40–54 | High Risk |
| < 40 | Not Recommended |

**Advantages / Risks** are auto-derived, not separately authored: any factor
scoring "excellent" or "good" becomes an advantage bullet; any factor
scoring "poor" or "critical" becomes a risk bullet, each carrying its own
explanation and source.

### Generation estimate

A simplified, transparent P50 pre-feasibility yield, **not** a bankable
estimate:

```
Specific Yield (kWh/kWp/yr) = GHI(kWh/m²/day) × 365 × Performance Ratio
Annual Energy (kWh)         = Capacity(kWp) × Specific Yield
```

Performance ratio defaults by module technology (0.78–0.82) are placeholders
that should be replaced with project-specific PVsyst/SAM modelling before
any investment decision — this is stated in the API response itself
(`generation_estimate.annual_generation_basis`).

---

## 6. Limitations (V1)

- **Cached, not live, data.** All demo-site figures are representative
  regional snapshots, clearly labeled as such. No live satellite/API pulls
  happen in this prototype (see §4 for the wiring plan).
- **Custom-site interpolation is coarse.** IDW from 5 points across a
  country the size of India is a rough screen, appropriate for a first pass
  only — the UI and API both say so explicitly.
- **Map layers are illustrative.** The grid tie-in line and protected-area
  buffer are distance indicators, not surveyed routes/boundaries.
- **Generation estimate is simplified.** No tracker gain, tilt optimization,
  DC/AC oversizing, or detailed shading/soiling losses.
- **No persistence layer.** Reports are computed on demand and not stored;
  there's no user accounts, saved projects, or PostGIS deployment yet
  (though the codebase is structured so one can be added — see §7).
- **India only, solar only.** By design, per the V1 brief.

---

## 7. Future expansion (beyond V1)

The V1 architecture is deliberately built so these can be added without a
rewrite:

- **Live data integration**: replace `data_sites.py` cache lookups with live
  calls to NASA POWER, Global Solar Atlas, Overpass, OpenTopography, and
  Sentinel Hub, using the cache as an offline fallback (flag already
  scaffolded: `NIRIKSH_ENABLE_LIVE_FETCH`).
- **PostGIS**: swap the in-memory `DEMO_SITES` dict and IDW interpolation
  for a proper PostGIS-backed raster/vector data store, enabling true
  polygon-level DEM/land-cover queries instead of point interpolation.
- **ML / climate simulation as an additive layer**: e.g. a learned
  calibration model trained on realized project outcomes, or downscaled
  climate-projection inputs for multi-decade heat/flood risk — layered *on
  top of* the transparent baseline score, never replacing it, and reported
  as a separate, clearly labeled score component.
- **More technologies & geographies**: wind, BESS co-location, and
  geographies beyond India — the `FactorDef`/weights pattern in
  `scoring.py` generalizes directly.
- **Saved projects & comparison**: persist reports, compare multiple sites
  side-by-side, export a PDF pre-feasibility memo.
- **This is the seed of "planetary intelligence"**: the same
  score-a-location-transparently pattern extends to other site-selection
  and environmental-risk problems beyond solar.

---

## 8. Tech stack

- **Backend**: FastAPI, Pydantic, Shapely, GeoPandas, Rasterio (wired for
  future raster work), NumPy
- **Frontend**: React 18, TypeScript, Vite, Leaflet + leaflet-draw
- **Design**: deep-tech/space-tech visual language — dark UI, telemetry-style
  radial score gauge, Space Grotesk / JetBrains Mono typography — deliberately
  avoiding a generic SaaS-dashboard look
