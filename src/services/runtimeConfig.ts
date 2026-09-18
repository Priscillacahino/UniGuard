export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface RuntimeConfiguration {
  firebaseEnabled: boolean;
  firebaseConfig: FirebaseClientConfig | null;
  appCheckSiteKey: string;
  trustedBackendEnabled: boolean;
  demoModeEnabled: boolean;
  error: string | null;
}

type EnvLike = Record<string, unknown>;

const FIREBASE_FIELDS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function strictFlag(value: unknown, name: string): { value: boolean; error: string | null } {
  const normalized = stringValue(value);
  if (!normalized || normalized === 'false') return { value: false, error: null };
  if (normalized === 'true') return { value: true, error: null };
  return { value: false, error: `${name} deve ser "true" ou "false".` };
}

export function validateRuntimeEnvironment(env: EnvLike): RuntimeConfiguration {
  const values = Object.fromEntries(
    FIREBASE_FIELDS.map((field) => [field, stringValue(env[field])]),
  ) as Record<(typeof FIREBASE_FIELDS)[number], string>;

  const configured = FIREBASE_FIELDS.filter((field) => values[field].length > 0);
  const missing = FIREBASE_FIELDS.filter((field) => values[field].length === 0);
  const trustedBackend = strictFlag(env.VITE_USE_TRUSTED_BACKEND, 'VITE_USE_TRUSTED_BACKEND');
  const demoMode = strictFlag(env.VITE_ENABLE_DEMO_MODE, 'VITE_ENABLE_DEMO_MODE');
  const appCheckSiteKey = stringValue(env.VITE_FIREBASE_APPCHECK_SITE_KEY);

  const flagError = trustedBackend.error || demoMode.error;
  if (flagError) {
    return {
      firebaseEnabled: false,
      firebaseConfig: null,
      appCheckSiteKey,
      trustedBackendEnabled: false,
      demoModeEnabled: false,
      error: flagError,
    };
  }

  if (configured.length === 0) {
    if (trustedBackend.value) {
      return {
        firebaseEnabled: false,
        firebaseConfig: null,
        appCheckSiteKey,
        trustedBackendEnabled: false,
        demoModeEnabled: demoMode.value,
        error: 'O backend confiável não pode ser ativado sem configuração completa do Firebase.',
      };
    }
    return {
      firebaseEnabled: false,
      firebaseConfig: null,
      appCheckSiteKey,
      trustedBackendEnabled: false,
      demoModeEnabled: demoMode.value,
      error: null,
    };
  }

  if (missing.length > 0) {
    return {
      firebaseEnabled: false,
      firebaseConfig: null,
      appCheckSiteKey,
      trustedBackendEnabled: false,
      demoModeEnabled: demoMode.value,
      error: `Configuração Firebase incompleta. Campos ausentes: ${missing.join(', ')}.`,
    };
  }

  if (!/^\d+$/.test(values.VITE_FIREBASE_MESSAGING_SENDER_ID)) {
    return {
      firebaseEnabled: false,
      firebaseConfig: null,
      appCheckSiteKey,
      trustedBackendEnabled: false,
      demoModeEnabled: demoMode.value,
      error: 'VITE_FIREBASE_MESSAGING_SENDER_ID deve conter somente dígitos.',
    };
  }

  if (!values.VITE_FIREBASE_APP_ID.startsWith('1:')) {
    return {
      firebaseEnabled: false,
      firebaseConfig: null,
      appCheckSiteKey,
      trustedBackendEnabled: false,
      demoModeEnabled: demoMode.value,
      error: 'VITE_FIREBASE_APP_ID possui formato inesperado.',
    };
  }

  if (trustedBackend.value && !appCheckSiteKey) {
    return {
      firebaseEnabled: false,
      firebaseConfig: null,
      appCheckSiteKey,
      trustedBackendEnabled: false,
      demoModeEnabled: demoMode.value,
      error: 'VITE_FIREBASE_APPCHECK_SITE_KEY é obrigatória quando o backend confiável está ativo.',
    };
  }

  return {
    firebaseEnabled: true,
    firebaseConfig: {
      apiKey: values.VITE_FIREBASE_API_KEY,
      authDomain: values.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: values.VITE_FIREBASE_PROJECT_ID,
      storageBucket: values.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: values.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: values.VITE_FIREBASE_APP_ID,
    },
    appCheckSiteKey,
    trustedBackendEnabled: trustedBackend.value,
    demoModeEnabled: demoMode.value,
    error: null,
  };
}

export const runtimeConfig = validateRuntimeEnvironment(import.meta.env);
