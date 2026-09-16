import type { EmergencyAlert } from '../types';

export const RETENTION_POLICY = {
  /** Cache local do navegador: apenas para continuidade offline. */
  localAlertDays: 7,
  /** Registro operacional no Firestore, sujeito a TTL. */
  alertDays: 90,
  /** Evidência fotográfica no Storage, via ciclo de vida do bucket. */
  evidenceDays: 30,
  /** Trilha de auditoria, sujeita a TTL e acesso restrito. */
  auditDays: 365,
} as const;

const DAY_MS = 24 * 60 * 60 * 1000;

export function retentionExpiresAtIso(
  baseTime = Date.now(),
  days: number = RETENTION_POLICY.alertDays,
): string {
  return new Date(baseTime + days * DAY_MS).toISOString();
}

export function purgeExpiredLocalAlerts(
  alerts: EmergencyAlert[],
  now = Date.now(),
): EmergencyAlert[] {
  const cutoff = now - RETENTION_POLICY.localAlertDays * DAY_MS;
  return alerts.filter((alert) => {
    const createdAt = Date.parse(alert.createdAt);
    const isActive = alert.status !== 'resolvido' && alert.status !== 'cancelado_usuario';
    return isActive || !Number.isNaN(createdAt) && createdAt >= cutoff;
  });
}
