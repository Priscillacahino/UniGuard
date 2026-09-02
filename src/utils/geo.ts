import { CAMPUS_LOCATIONS, CAMPUS_SAFE_ZONES, UFPB_CAMPUS_BOUNDS } from '../data/ufpbData';
import { CampusLocation, GeoCoordinate, SafeZone } from '../types';

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
 * Verifica se um ponto geográfico está dentro de alguma Zona de Segurança do Campus
 */
export function checkPointInSafeZone(point: GeoCoordinate, safeZones: SafeZone[] = CAMPUS_SAFE_ZONES): { inZone: boolean; zone: SafeZone | null; distanceToCenter: number } {
  for (const zone of safeZones) {
    const dist = calculateDistance(point, zone.center);
    if (dist <= zone.radiusMeters) {
      return { inZone: true, zone, distanceToCenter: dist };
    }
  }
  return { inZone: false, zone: null, distanceToCenter: 0 };
}

/**
 * Verifica se um ponto geográfico está dentro do polígono de limites do Campus I da UFPB (Ray-Casting Algorithm)
 */
export function isPointInsideCampus(point: GeoCoordinate, polygon: [number, number][] = UFPB_CAMPUS_BOUNDS): boolean {
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

  return inside;
}

/**
 * Encontra a localidade ou centro acadêmico mais próximo dentro da UFPB
 */
export function findNearestCampusLocation(point: GeoCoordinate): { location: CampusLocation; distance: number } {
  let nearest = CAMPUS_LOCATIONS[0];
  let minDistance = calculateDistance(point, nearest.coordinate);

  for (const loc of CAMPUS_LOCATIONS) {
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

