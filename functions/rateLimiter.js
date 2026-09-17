export const RATE_LIMIT_POLICY = Object.freeze({
  maxAlertsPerWindow: 3,
  windowMs: 30 * 60 * 1000,
  cooldownMs: 60 * 1000,
});

export function evaluateRateLimit(previousTimestamps, now = Date.now()) {
  const recent = (Array.isArray(previousTimestamps) ? previousTimestamps : [])
    .filter((value) => Number.isFinite(value) && value >= now - RATE_LIMIT_POLICY.windowMs)
    .sort((a, b) => a - b);

  if (recent.length >= RATE_LIMIT_POLICY.maxAlertsPerWindow) {
    return { allowed: false, reason: 'WINDOW_LIMIT', retryAt: recent[0] + RATE_LIMIT_POLICY.windowMs };
  }

  const latest = recent.at(-1);
  if (latest != null && now - latest < RATE_LIMIT_POLICY.cooldownMs) {
    return { allowed: false, reason: 'COOLDOWN', retryAt: latest + RATE_LIMIT_POLICY.cooldownMs };
  }

  return { allowed: true, reason: null, retryAt: null, timestamps: [...recent, now] };
}