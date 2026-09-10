import { describe, expect, it } from 'vitest';
import {
  calculateDistance,
  checkPointInSafeZone,
  formatDistance,
  generateProtocolNumber,
  isPointInsideCampus,
} from './geo';
import type { SafeZone } from '../types';

describe('utilitários de geolocalização', () => {
  it('retorna zero para duas coordenadas iguais', () => {
    const point = { lat: -7.1398, lng: -34.8456 };
    expect(calculateDistance(point, point)).toBe(0);
  });

  it('calcula uma distância conhecida com tolerância', () => {
    const distance = calculateDistance(
      { lat: -7.1398, lng: -34.8456 },
      { lat: -7.1408, lng: -34.8456 },
    );
    expect(distance).toBeGreaterThanOrEqual(110);
    expect(distance).toBeLessThanOrEqual(112);
  });

  it('identifica um ponto dentro e fora de uma zona segura', () => {
    const zone: SafeZone = {
      id: 'test-zone',
      name: 'Zona de teste',
      code: 'ZT',
      description: 'Zona usada apenas no teste',
      center: { lat: -7.1398, lng: -34.8456 },
      radiusMeters: 100,
      icon: 'shield',
      requiresLongPress: true,
      suppressAutoSignalLossAlert: false,
      activeGuardsCount: 1,
      securityFeatures: [],
    };

    expect(checkPointInSafeZone(zone.center, [zone]).inZone).toBe(true);
    expect(checkPointInSafeZone({ lat: -7.1498, lng: -34.8456 }, [zone]).inZone).toBe(false);
  });

  it('aplica o algoritmo de ponto dentro do polígono', () => {
    const square: [number, number][] = [
      [0, 0], [0, 1], [1, 1], [1, 0],
    ];
    expect(isPointInsideCampus({ lat: 0.5, lng: 0.5 }, square)).toBe(true);
    expect(isPointInsideCampus({ lat: 2, lng: 2 }, square)).toBe(false);
  });

  it('formata metros e quilômetros', () => {
    expect(formatDistance(850)).toBe('850 m');
    expect(formatDistance(1500)).toBe('1.5 km');
  });

  it('gera protocolo no formato esperado', () => {
    expect(generateProtocolNumber()).toMatch(/^SOS-\d{4}-\d{4}$/);
  });
});
