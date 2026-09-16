import type { EmergencyAlert } from '../types';

export const ABUSE_CONTROL_POLICY = {
  maxAlertsPerWindow: 3,
  windowMinutes: 30,
  cooldownSeconds: 60,
} as const;

export interface AlertAllowance {
  allowed: boolean;
  reason?: 'active_alert' | 'rate_limit' | 'cooldown';
  retryAfterSeconds?: number;
  message?: string;
}

const ACTIVE_STATUSES = new Set(['pendente', 'em_deslocamento', 'no_local']);

export function checkAlertAllowance(
  alerts: EmergencyAlert[],
  userId: string,
  now = Date.now(),
): AlertAllowance {
  const activeAlert = alerts.find(
    (alert) => alert.userId === userId && ACTIVE_STATUSES.has(alert.status),
  );
  if (activeAlert) {
    return {
      allowed: false,
      reason: 'active_alert',
      message: 'Já existe um alerta ativo. Aguarde a central encerrar ou cancele o chamado atual.',
    };
  }

  const windowStart = now - ABUSE_CONTROL_POLICY.windowMinutes * 60 * 1000;
  const recentAlerts = alerts
    .filter((alert) => alert.userId === userId)
    .map((alert) => Date.parse(alert.createdAt))
    .filter((createdAt) => !Number.isNaN(createdAt) && createdAt >= windowStart)
    .sort((a, b) => b - a);

  if (recentAlerts.length >= ABUSE_CONTROL_POLICY.maxAlertsPerWindow) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((recentAlerts[recentAlerts.length - 1] + ABUSE_CONTROL_POLICY.windowMinutes * 60 * 1000 - now) / 1000),
    );
    return {
      allowed: false,
      reason: 'rate_limit',
      retryAfterSeconds,
      message: `Limite de ${ABUSE_CONTROL_POLICY.maxAlertsPerWindow} alertas em ${ABUSE_CONTROL_POLICY.windowMinutes} minutos atingido. Tente novamente em ${Math.ceil(retryAfterSeconds / 60)} min.`,
    };
  }

  if (recentAlerts[0] && now - recentAlerts[0] < ABUSE_CONTROL_POLICY.cooldownSeconds * 1000) {
    const retryAfterSeconds = Math.ceil(
      (ABUSE_CONTROL_POLICY.cooldownSeconds * 1000 - (now - recentAlerts[0])) / 1000,
    );
    return {
      allowed: false,
      reason: 'cooldown',
      retryAfterSeconds,
      message: `Aguarde ${retryAfterSeconds}s antes de emitir outro alerta.`,
    };
  }

  return { allowed: true };
}
