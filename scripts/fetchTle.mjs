import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = join(__dirname, '../src/tleData.js')
const CELESTRAK_URL =
  'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=tle'

/** Curated set — NORAD IDs and name hints from the original tleData.js */
const CURATED = [
  {
    name: 'ISS (ZARYA)',
    noradId: 25544,
    matchNames: ['ISS (ZARYA)', 'ISS'],
    color: '#00ff88',
    type: 'Space Station',
    agency: 'NASA/ISS',
  },
  {
    name: 'Hubble Space Telescope',
    noradId: 20580,
    matchNames: ['HUBBLE SPACE TELESCOPE', 'HST'],
    color: '#ff6b35',
    type: 'Space Telescope',
    agency: 'NASA',
  },
  {
    name: 'Landsat 8',
    noradId: 39084,
    matchNames: ['LANDSAT 8'],
    color: '#4ecdc4',
    type: 'Earth Observation',
    agency: 'USGS/NASA',
  },
  {
    name: 'Terra (EOS AM-1)',
    noradId: 25994,
    matchNames: ['TERRA (EOS AM-1)', 'TERRA'],
    color: '#a8dadc',
    type: 'Earth Observation',
    agency: 'NASA',
  },
  {
    name: 'Aqua (EOS PM-1)',
    noradId: 27424,
    matchNames: ['AQUA (EOS PM-1)', 'AQUA'],
    color: '#457b9d',
    type: 'Earth Observation',
    agency: 'NASA',
  },
  {
    name: 'NOAA 19',
    noradId: 33591,
    matchNames: ['NOAA 19'],
    color: '#e9c46a',
    type: 'Weather',
    agency: 'NOAA',
  },
  {
    name: 'GPS BIIR-2 (PRN 13)',
    noradId: 24876,
    matchNames: ['GPS BIIR-2 (PRN 13)', 'GPS IIR-2 (PRN 13)', 'GPS IIR-2'],
    color: '#f4a261',
    type: 'Navigation',
    agency: 'USAF',
  },
  {
    name: 'Starlink-1007',
    noradId: 44713,
    matchNames: ['STARLINK-1007'],
    color: '#e76f51',
    type: 'Communications',
    agency: 'SpaceX',
  },
  {
    name: 'Sentinel-2A',
    noradId: 40697,
    matchNames: ['SENTINEL-2A'],
    color: '#2a9d8f',
    type: 'Earth Observation',
    agency: 'ESA',
  },
  {
    name: 'GOES-18',
    noradId: 51850,
    matchNames: ['GOES-18', 'GOES 18'],
    color: '#e63946',
    type: 'Weather (GEO)',
    agency: 'NOAA',
  },
]

function noradFromTleLine1(tle1) {
  const m = /^1\s+(\d+)U/.exec(tle1)
  return m ? Number.parseInt(m[1], 10) : null
}

function normalizeName(name) {
  return name.trim().toUpperCase()
}

function parseTleBlob(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim())
  const parsed = []
  let i = 0
  while (i < lines.length) {
    while (i < lines.length && lines[i] === '') i++
    if (i + 2 >= lines.length) break

    const name = lines[i]
    const tle1 = lines[i + 1]
    const tle2 = lines[i + 2]
    if (tle1?.startsWith('1 ') && tle2?.startsWith('2 ')) {
      parsed.push({
        name,
        tle1,
        tle2,
        noradId: noradFromTleLine1(tle1),
      })
      i += 3
    } else {
      i += 1
    }
  }
  return parsed
}

function nameMatchesCurated(celestrakName, entry) {
  const n = normalizeName(celestrakName)
  return entry.matchNames.some(
    (m) => n === normalizeName(m) || n.includes(normalizeName(m)),
  )
}

function indexFetched(fetched) {
  const byNorad = new Map()
  const byName = new Map()
  for (const sat of fetched) {
    if (sat.noradId != null) byNorad.set(sat.noradId, sat)
    byName.set(normalizeName(sat.name), sat)
  }
  return { byNorad, byName }
}

function loadExistingTleByNorad() {
  const map = new Map()
  if (!existsSync(OUT_PATH)) return map
  try {
    const src = readFileSync(OUT_PATH, 'utf8')
    const re =
      /tle1:\s*'((?:\\'|[^'])*)'[\s\S]*?tle2:\s*'((?:\\'|[^'])*)'/g
    let m
    while ((m = re.exec(src)) !== null) {
      const tle1 = m[1].replace(/\\'/g, "'")
      const tle2 = m[2].replace(/\\'/g, "'")
      const id = noradFromTleLine1(tle1)
      if (id != null) map.set(id, { tle1, tle2 })
    }
  } catch {
    /* keep empty map */
  }
  return map
}

function escapeJsString(s) {
  return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function formatSatellite(sat) {
  return `  {
    name: '${escapeJsString(sat.name)}',
    tle1: '${escapeJsString(sat.tle1)}',
    tle2: '${escapeJsString(sat.tle2)}',
    color: '${escapeJsString(sat.color)}',
    type: '${escapeJsString(sat.type)}',
    agency: '${escapeJsString(sat.agency)}',
  }`
}

function writeTleDataJs(satellites) {
  const body = satellites.map(formatSatellite).join(',\n')
  const content = `// TLE data — refreshed at build time from CelesTrak (scripts/fetchTle.mjs)
// Source: ${CELESTRAK_URL}

export const satellites = [
${body},
]
`
  writeFileSync(OUT_PATH, content, 'utf8')
}

async function fetchLiveTle() {
  const res = await fetch(CELESTRAK_URL, {
    headers: { 'User-Agent': 'Niriksh-satellite-tracker/1.0 (build-time TLE fetch)' },
  })
  if (!res.ok) {
    throw new Error(`CelesTrak HTTP ${res.status} ${res.statusText}`)
  }
  return res.text()
}

function mergeCurated(fetched, existingByNorad) {
  const { byNorad, byName } = indexFetched(fetched)

  const merged = []

  for (const entry of CURATED) {
    let live =
      byNorad.get(entry.noradId) ??
      [...byName.values()].find((s) => nameMatchesCurated(s.name, entry))

    if (live) {
      merged.push({
        name: entry.name,
        tle1: live.tle1,
        tle2: live.tle2,
        color: entry.color,
        type: entry.type,
        agency: entry.agency,
      })
      continue
    }

    const stale = existingByNorad.get(entry.noradId)
    if (stale) {
      console.warn(
        `[fetchTle] "${entry.name}" (NORAD ${entry.noradId}) not in CelesTrak feed; keeping existing TLE.`,
      )
      merged.push({
        name: entry.name,
        tle1: stale.tle1,
        tle2: stale.tle2,
        color: entry.color,
        type: entry.type,
        agency: entry.agency,
      })
      continue
    }

    console.warn(
      `[fetchTle] "${entry.name}" (NORAD ${entry.noradId}) missing from feed and no local fallback.`,
    )
  }

  return merged
}

async function main() {
  const existingByNorad = loadExistingTleByNorad()

  try {
    const text = await fetchLiveTle()
    const fetched = parseTleBlob(text)
    if (fetched.length === 0) {
      throw new Error('CelesTrak response contained no parseable TLE records')
    }

    const merged = mergeCurated(fetched, existingByNorad)
    if (merged.length === 0) {
      throw new Error('No curated satellites could be resolved from CelesTrak data')
    }

    writeTleDataJs(merged)
    console.log(
      `[fetchTle] Wrote ${merged.length} satellites to ${OUT_PATH.replace(/\\/g, '/')}`,
    )
  } catch (err) {
    console.warn(
      `[fetchTle] Failed to refresh TLE data (${err.message}). Keeping existing src/tleData.js.`,
    )
    if (!existsSync(OUT_PATH)) {
      console.warn('[fetchTle] No existing tleData.js — build may use stale or missing data.')
    }
    process.exitCode = 0
  }
}

main()
