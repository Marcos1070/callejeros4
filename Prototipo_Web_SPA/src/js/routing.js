/**
 * Routing - Ruta real por calles para la navegación del mapa
 * Usa el servicio público de OSRM (sin clave). Si no hay conexión, tarda demasiado o responde mal,
 * devuelve null y el mapa usa un trazado aproximado (la app nunca queda bloqueada).
 */

const OSRM_URL = 'https://router.project-osrm.org/route/v1/driving';

/**
 * @param {[number, number]} origin - [lat, lng]
 * @param {[number, number]} dest   - [lat, lng]
 * @param {{ timeoutMs?: number, fetchFn?: Function }} [options]
 * @returns {Promise<{ points: Array<[number, number]>, km: number, minutes: number } | null>}
 */
export async function fetchDrivingRoute(origin, dest, { timeoutMs = 6000, fetchFn = (...a) => fetch(...a) } = {}) {
  // OSRM espera longitud,latitud (al revés que Leaflet)
  const url = `${OSRM_URL}/${origin[1]},${origin[0]};${dest[1]},${dest[0]}?overview=full&geometries=geojson`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetchFn(url, { signal: controller.signal });
    if (!res.ok) return null;

    const data = await res.json();
    const route = data && data.code === 'Ok' && data.routes && data.routes[0];
    const coords = route && route.geometry && route.geometry.coordinates;
    if (!Array.isArray(coords) || coords.length < 2) return null;
    if (!Number.isFinite(route.distance) || !Number.isFinite(route.duration)) return null;

    const points = coords.map(([lng, lat]) => [lat, lng]);
    if (points.some(([lat, lng]) => !Number.isFinite(lat) || !Number.isFinite(lng))) return null;

    return {
      points,
      km: route.distance / 1000,
      minutes: Math.max(1, Math.round(route.duration / 60))
    };
  } catch (e) {
    return null; // sin red, timeout (abort) o JSON inválido
  } finally {
    clearTimeout(timer);
  }
}
