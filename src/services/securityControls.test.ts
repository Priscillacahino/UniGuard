import { describe, expect, it } from 'vitest';
import type { EmergencyAlert } from '../types';
import { checkAlertAllowance } from './abuseControl';
import { purgeExpiredLocalAlerts } from './retention';

function alert(userId: string, status: EmergencyAlert['status'], createdAt: string): EmergencyAlert {
  return {
    id: `a-${createdAt}`,
    institutionId: 'ufpb-demo',
    protocolNumber: 'SOS-TEST',
    userId,
    userProfile: {} as EmergencyAlert['userProfile'],
    category: 'urgencia_geral',
    status,
    createdAt,
    updatedAt: createdAt,
    location: { lat: 0, lng: 0 },
    locationName: 'teste',
    isInsideCampus: false,
    signalLost: false,
    lastSignalTimestamp: createdAt,
  };
}

describe('controle contra abuso', () => {
  it('bloqueia um segundo alerta enquanto existe ocorrência ativa', () => {
    const now = Date.parse('2026-09-16T12:00:00.000Z');
    const result = checkAlertAllowance(
      [alert('u1', 'pendente', '2026-09-16T11:00:00.000Z')],
      'u1',
      now,
    );

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('active_alert');
  });

  it('aplica janela e cooldown por usuário', () => {
    const now = Date.parse('2026-09-16T12:00:00.000Z');
    const recent = [
      alert('u1', 'cancelado_usuario', '2026-09-16T11:40:00.000Z'),
      alert('u1', 'cancelado_usuario', '2026-09-16T11:50:00.000Z'),
      alert('u1', 'cancelado_usuario', '2026-09-16T11:55:00.000Z'),
    ];

    expect(checkAlertAllowance(recent, 'u1', now).reason).toBe('rate_limit');
    expect(checkAlertAllowance([recent[0]], 'u1', Date.parse('2026-09-16T11:40:30.000Z')).reason)
      .toBe('cooldown');
  });
});

describe('retenção local', () => {
  it('remove ocorrências encerradas antigas e preserva ativas', () => {
    const now = Date.parse('2026-09-16T12:00:00.000Z');
    const result = purgeExpiredLocalAlerts([
      alert('u1', 'resolvido', '2026-09-01T12:00:00.000Z'),
      alert('u1', 'resolvido', '2026-09-15T12:00:00.000Z'),
      alert('u1', 'pendente', '2026-08-01T12:00:00.000Z'),
    ], now);

    expect(result).toHaveLength(2);
    expect(result.some((item) => item.status === 'pendente')).toBe(true);
    expect(result.some((item) => item.createdAt.startsWith('2026-09-15'))).toBe(true);
  });
});
