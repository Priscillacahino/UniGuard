import { describe, expect, it } from 'vitest';
import type { EmergencyAlert } from '../types';
import { ABUSE_CONTROL_POLICY, checkAlertAllowance } from './abuseControl';
import { purgeExpiredLocalAlerts, RETENTION_POLICY, retentionExpiresAtIso } from './retention';

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
  it('mantém a política documentada de 3 alertas/30min e cooldown de 60s', () => {
    expect(ABUSE_CONTROL_POLICY).toEqual({
      maxAlertsPerWindow: 3,
      windowMinutes: 30,
      cooldownSeconds: 60,
    });
  });

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

  it.each(['pendente', 'em_deslocamento', 'no_local'] as EmergencyAlert['status'][])(
    'considera %s um status ativo',
    (status) => {
      const result = checkAlertAllowance(
        [alert('u1', status, '2026-09-16T11:00:00.000Z')],
        'u1',
        Date.parse('2026-09-16T12:00:00.000Z'),
      );
      expect(result.reason).toBe('active_alert');
    },
  );

  it('não bloqueia outro usuário por causa de alerta alheio', () => {
    const result = checkAlertAllowance(
      [alert('u2', 'pendente', '2026-09-16T11:59:30.000Z')],
      'u1',
      Date.parse('2026-09-16T12:00:00.000Z'),
    );
    expect(result.allowed).toBe(true);
  });

  it('aplica limite de 3 alertas em 30 minutos por usuário', () => {
    const now = Date.parse('2026-09-16T12:00:00.000Z');
    const recent = [
      alert('u1', 'cancelado_usuario', '2026-09-16T11:40:00.000Z'),
      alert('u1', 'cancelado_usuario', '2026-09-16T11:50:00.000Z'),
      alert('u1', 'cancelado_usuario', '2026-09-16T11:55:00.000Z'),
    ];

    const result = checkAlertAllowance(recent, 'u1', now);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('rate_limit');
    expect(result.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('aplica cooldown de 60 segundos após o alerta anterior', () => {
    const result = checkAlertAllowance(
      [alert('u1', 'cancelado_usuario', '2026-09-16T11:40:00.000Z')],
      'u1',
      Date.parse('2026-09-16T11:40:30.000Z'),
    );

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('cooldown');
    expect(result.retryAfterSeconds).toBe(30);
  });

  it('libera novo alerta após o cooldown quando não há outra restrição', () => {
    const result = checkAlertAllowance(
      [alert('u1', 'cancelado_usuario', '2026-09-16T11:58:00.000Z')],
      'u1',
      Date.parse('2026-09-16T12:00:00.000Z'),
    );
    expect(result.allowed).toBe(true);
  });
});

describe('retenção local', () => {
  it('mantém os prazos documentados', () => {
    expect(RETENTION_POLICY).toEqual({
      localAlertDays: 7,
      alertDays: 90,
      evidenceDays: 30,
      auditDays: 365,
    });
  });

  it('calcula corretamente a expiração padrão de alertas', () => {
    const base = Date.parse('2026-01-01T00:00:00.000Z');
    expect(retentionExpiresAtIso(base)).toBe('2026-04-01T00:00:00.000Z');
  });

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

  it('remove também cancelamentos antigos', () => {
    const now = Date.parse('2026-09-16T12:00:00.000Z');
    const result = purgeExpiredLocalAlerts([
      alert('u1', 'cancelado_usuario', '2026-09-01T12:00:00.000Z'),
      alert('u1', 'cancelado_usuario', '2026-09-15T12:00:00.000Z'),
    ], now);

    expect(result).toHaveLength(1);
    expect(result[0].createdAt).toContain('2026-09-15');
  });

  it('preserva alerta ativo mesmo se a data for antiga ou inválida', () => {
    const now = Date.parse('2026-09-16T12:00:00.000Z');
    const activeInvalid = alert('u1', 'pendente', 'data-invalida');
    expect(purgeExpiredLocalAlerts([activeInvalid], now)).toHaveLength(1);
  });
});
