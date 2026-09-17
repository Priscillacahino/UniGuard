import { describe, expect, it, vi } from 'vitest';
import { approximateCoordinate, maskEmail, maskPhone, maskUid, safeLog, sanitizeLogText } from './safeLogger';

describe('safeLogger', () => {
  it('mascara e-mail, telefone e uid', () => {
    expect(maskEmail('priscilla@example.com')).toBe('p***@example.com');
    expect(maskPhone('+55 (83) 99999-1234')).toMatch(/1234$/);
    expect(maskPhone('+55 (83) 99999-1234')).not.toContain('99999');
    expect(maskUid('abcdefghijklmnop')).toBe('abcd…mnop');
  });

  it('reduz precisão de coordenadas', () => {
    expect(approximateCoordinate(-7.123456)).toBe(-7.12);
  });

  it('remove dados sensíveis de texto', () => {
    const result = sanitizeLogText('Contato priscilla@example.com telefone 5583999991234');
    expect(result).not.toContain('priscilla@example.com');
    expect(result).not.toContain('5583999991234');
  });

  it('redige segredo e mascara campos no logger', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    safeLog('info', 'teste', {
      email: 'priscilla@example.com',
      phone: '5583999991234',
      uid: 'abcdefghijklmnop',
      token: 'segredo-real',
      latitude: -7.123456,
    });
    const payload = spy.mock.calls[0][1] as Record<string, unknown>;
    expect(payload.email).toBe('p***@example.com');
    expect(String(payload.phone)).not.toContain('99999');
    expect(payload.uid).toBe('abcd…mnop');
    expect(payload.token).toBe('[REDACTED]');
    expect(payload.latitude).toBe(-7.12);
    spy.mockRestore();
  });
});