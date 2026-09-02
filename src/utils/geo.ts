import { CAMPUS_LOCATIONS, CAMPUS_SAFE_ZONES, UFPB_CAMPI } from '../data/ufpbData';
import { CampusLocation, GeoCoordinate, SafeZone, UfpbCampusId, UfpbCampusInfo } from '../types';

/**
 * Calcula a distância em metros entre duas coordenadas geográficas (Fórmula de Haversine)
 */
export function calculateDistance(coord1: GeoCoordinate, coord2: GeoCoordinate): number {
  const R = 6371e3; // Raio da Terra em metros
  const φ1 = (coord1.lat * Math.PI) / 180;
  const φ2 = (coord2.lat * Math.PI) / 180;
  const Δφ = ((coord2.lat - coord1.lat) * Math.PI) / 180;
  const Δλ = ((coord2.lng - coord1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

/**
 * Retorna os dados do campus pelo ID ou o Campus I como padrão
 */
export function getCampusById(campusId?: string | UfpbCampusId): UfpbCampusInfo {
  if (!campusId) return UFPB_CAMPI[0];
  const found = UFPB_CAMPI.find((c) => c.id === campusId);
  return found || UFPB_CAMPI[0];
}

/**
 * Verifica se um ponto geográfico está dentro de alguma Zona de Segurança do Campus
 */
export function checkPointInSafeZone(
  point: GeoCoordinate,
  safeZones: SafeZone[] = CAMPUS_SAFE_ZONES,
  campusId?: UfpbCampusId
): { inZone: boolean; zone: SafeZone | null; distanceToCenter: number } {
  const filteredZones = campusId
    ? safeZones.filter((z) => !z.campusId || z.campusId === campusId)
    : safeZones;

  for (const zone of filteredZones) {
    const dist = calculateDistance(point, zone.center);
    if (dist <= zone.radiusMeters) {
      return { inZone: true, zone, distanceToCenter: dist };
    }
  }
  return { inZone: false, zone: null, distanceToCenter: 0 };
}

/**
 * Verifica se um ponto geográfico está dentro do polígono de limites do Campus (Ray-Casting Algorithm)
 * ou dentro do raio de tolerância do centro do campus.
 */
export function isPointInsideCampus(
  point: GeoCoordinate,
  campusOrBounds?: [number, number][] | UfpbCampusId
): boolean {
  let polygon: [number, number][] | undefined;
  let campusInfo: UfpbCampusInfo | undefined;

  if (typeof campusOrBounds === 'string') {
    campusInfo = getCampusById(campusOrBounds);
    polygon = campusInfo.bounds;
  } else if (Array.isArray(campusOrBounds)) {
    polygon = campusOrBounds;
  } else {
    campusInfo = UFPB_CAMPI[0];
    polygon = campusInfo.bounds;
  }

  if (!polygon || polygon.length < 3) {
    if (campusInfo) {
      const dist = calculateDistance(point, campusInfo.center);
      return dist <= campusInfo.radiusMeters;
    }
    return true;
  }

  let inside = false;
  const x = point.lat;
  const y = point.lng;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  // Se o ponto estiver bem próximo do centro mesmo no limiar do polígono
  if (!inside && campusInfo) {
    const dist = calculateDistance(point, campusInfo.center);
    if (dist <= campusInfo.radiusMeters * 0.85) {
      return true;
    }
  }

  return inside;
}

/**
 * Encontra a localidade ou centro acadêmico mais próximo dentro da UFPB (opcionalmente filtrado por campus)
 */
export function findNearestCampusLocation(
  point: GeoCoordinate,
  campusId?: UfpbCampusId
): { location: CampusLocation; distance: number } {
  const pool = campusId
    ? CAMPUS_LOCATIONS.filter((l) => !l.campusId || l.campusId === campusId)
    : CAMPUS_LOCATIONS;

  const validPool = pool.length > 0 ? pool : CAMPUS_LOCATIONS;
  let nearest = validPool[0];
  let minDistance = calculateDistance(point, nearest.coordinate);

  for (const loc of validPool) {
    const d = calculateDistance(point, loc.coordinate);
    if (d < minDistance) {
      minDistance = d;
      nearest = loc;
    }
  }

  return { location: nearest, distance: minDistance };
}

/**
 * Formata distância em metros ou quilômetros
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Gera um protocolo único no formato SOS-AAAA-XXXX
 */
export function generateProtocolNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `SOS-${year}-${randomNum}`;
}
