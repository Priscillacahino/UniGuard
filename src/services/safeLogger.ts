const EMAIL_RE = /([A-Z0-9._%+-])([A-Z0-9._%+-]*)(@[A-Z0-9.-]+\.[A-Z]{2,})/gi;
const PHONE_RE = /(?:\+?\d[\s().-]?){10,15}/g;

export function maskEmail(value: string): string {
  return value.replace(EMAIL_RE, (_match, first: string, _middle: string, domain: string) => `${first}***${domain}`);
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length < 4) return '****';
  return `${'*'.repeat(Math.max(6, digits.length - 4))}${digits.slice(-4)}`;
}

export function maskUid(value: string): string {
  if (value.length <= 8) return '***';
  return `${value.slice(0, 4)}…${value.slice(-4)}`;
}

export function approximateCoordinate(value: number): number {
  return Math.round(value * 100) / 100;
}

export function sanitizeLogText(value: string): string {
  return value
    .replace(EMAIL_RE, (_match, first: string, _middle: string, domain: string) => `${first}***${domain}`)
    .replace(PHONE_RE, (phone) => maskPhone(phone));
}

type SafePrimitive = string | number | boolean | null | undefined;

export function safeLog(
  level: 'info' | 'warn' | 'error',
  event: string,
  details: Record<string, SafePrimitive> = {},
): void {
  const sanitized: Record<string, SafePrimitive> = {};

  for (const [key, value] of Object.entries(details)) {
    if (value == null) { sanitized[key] = value; continue; }
    const lower = key.toLowerCase();
    if (lower.includes('password') || lower.includes('token') || lower.includes('secret')) {
      sanitized[key] = '[REDACTED]';
    } else if (lower.includes('email')) {
      sanitized[key] = maskEmail(String(value));
    } else if (lower.includes('phone') || lower.includes('telefone')) {
      sanitized[key] = maskPhone(String(value));
    } else if (lower === 'uid' || lower.endsWith('uid')) {
      sanitized[key] = maskUid(String(value));
    } else if ((lower.includes('lat') || lower.includes('lng') || lower.includes('longitude')) && typeof value === 'number') {
      sanitized[key] = approximateCoordinate(value);
    } else {
      sanitized[key] = typeof value === 'string' ? sanitizeLogText(value) : value;
    }
  }

  const payload = { event, ...sanitized };
  if (level === 'error') console.error('[UniGuard]', payload);
  else if (level === 'warn') console.warn('[UniGuard]', payload);
  else console.info('[UniGuard]', payload);
}