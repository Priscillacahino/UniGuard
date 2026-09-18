import { describe, expect, it } from 'vitest';
import { validateRuntimeEnvironment } from './runtimeConfig';

const validEnv = {
  VITE_FIREBASE_API_KEY: 'api-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'demo.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'demo-project',
  VITE_FIREBASE_STORAGE_BUCKET: 'demo.firebasestorage.app',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '1234567890',
  VITE_FIREBASE_APP_ID: '1:1234567890:web:abcdef',
  VITE_FIREBASE_APPCHECK_SITE_KEY: 'site-key',
  VITE_USE_TRUSTED_BACKEND: 'false',
  VITE_ENABLE_DEMO_MODE: 'false',
};

describe('validateRuntimeEnvironment', () => {
  it('mantém Firebase desativado quando nenhuma credencial é informada', () => {
    const result = validateRuntimeEnvironment({});
    expect(result.firebaseEnabled).toBe(false);
    expect(result.error).toBeNull();
  });

  it('bloqueia configuração Firebase parcial', () => {
    const result = validateRuntimeEnvironment({ VITE_FIREBASE_API_KEY: 'partial' });
    expect(result.firebaseEnabled).toBe(false);
    expect(result.error).toContain('Configuração Firebase incompleta');
  });

  it('aceita configuração Firebase completa', () => {
    const result = validateRuntimeEnvironment(validEnv);
    expect(result.firebaseEnabled).toBe(true);
    expect(result.error).toBeNull();
  });

  it('rejeita flags fora de true/false', () => {
    const result = validateRuntimeEnvironment({ ...validEnv, VITE_ENABLE_DEMO_MODE: 'yes' });
    expect(result.firebaseEnabled).toBe(false);
    expect(result.error).toContain('VITE_ENABLE_DEMO_MODE');
  });

  it('exige App Check quando o backend confiável está ativo', () => {
    const result = validateRuntimeEnvironment({
      ...validEnv,
      VITE_USE_TRUSTED_BACKEND: 'true',
      VITE_FIREBASE_APPCHECK_SITE_KEY: '',
    });
    expect(result.firebaseEnabled).toBe(false);
    expect(result.error).toContain('VITE_FIREBASE_APPCHECK_SITE_KEY');
  });
});
