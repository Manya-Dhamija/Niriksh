import * as satellite from 'satellite.js'

export function parseTLE(tle1, tle2) {
  return satellite.twoline2satrec(tle1, tle2)
}

export function getSatellitePosition(satrec) {
  const now = new Date()
  const posVel = satellite.propagate(satrec, now)
  if (!posVel || !posVel.position) return null

  const gmst = satellite.gstime(now)
  const geo = satellite.eciToGeodetic(posVel.position, gmst)

  // Convert to 3D sphere coordinates (radius ~1 = Earth radius in scene)
  const lat = geo.latitude
  const lon = geo.longitude
  const alt = geo.height // km above Earth surface

  const R = 1 + alt / 6371  // normalize: Earth radius = 1

  const x = R * Math.cos(lat) * Math.cos(lon)
  const y = R * Math.sin(lat)
  const z = R * Math.cos(lat) * Math.sin(lon)

  return { x, y, z, lat: satellite.degreesLat(lat), lon: satellite.degreesLong(lon), alt: Math.round(alt) }
}
