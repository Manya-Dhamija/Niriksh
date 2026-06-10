import * as satellite from 'satellite.js'

const R_EARTH_KM = 6371 // Earth radius in km
const SCENE_SCALE = 1 / R_EARTH_KM // 1 unit = 6371 km

/**
 * Parse TLE lines into a satrec object (do once, cache it)
 */
export function parseTLE(tle1, tle2) {
  return satellite.twoline2satrec(tle1, tle2)
}

/**
 * Get current ECI position (x, y, z) scaled to scene units
 * Returns null if propagation fails
 */
export function getSatellitePosition(satrec, date = new Date()) {
  const posVel = satellite.propagate(satrec, date)
  if (!posVel.position) return null

  const gmst = satellite.gstime(date)
  const ecf = satellite.eciToEcf(posVel.position, gmst)

  return {
    x: ecf.x * SCENE_SCALE,
    y: ecf.z * SCENE_SCALE, // Three.js uses Y-up; swap Z and Y
    z: -ecf.y * SCENE_SCALE,
  }
}

/**
 * Get geodetic position (lat, lon, altitude) for display
 */
export function getSatelliteGeodetic(satrec, date = new Date()) {
  const posVel = satellite.propagate(satrec, date)
  if (!posVel.position) return null

  const gmst = satellite.gstime(date)
  const geo = satellite.eciToGeodetic(posVel.position, gmst)

  return {
    latitude: satellite.degreesLat(geo.latitude).toFixed(2),
    longitude: satellite.degreesLong(geo.longitude).toFixed(2),
    altitude: (geo.height).toFixed(1), // km
  }
}
