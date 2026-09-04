import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseEnabled = Object.values(config).every(Boolean);

const app = firebaseEnabled ? (getApps().length ? getApp() : initializeApp(config)) : null;
export const firestore = app ? getFirestore(app) : null;

let authentication: Promise<void> | null = null;

export function ensureFirebaseAuthentication(): Promise<void> {
  if (!app) return Promise.resolve();
  if (!authentication) {
    const auth = getAuth(app);
    authentication = auth.currentUser
      ? Promise.resolve()
      : signInAnonymously(auth).then(() => undefined);
  }
  return authentication;
}

export async function authenticateOperator(email: string, password: string): Promise<void> {
  if (!app) return;
  await signInWithEmailAndPassword(getAuth(app), email, password);
}

export function currentFirebaseUserId(): string | null {
  return app ? getAuth(app).currentUser?.uid || null : null;
}

export async function signOutFirebase(): Promise<void> {
  if (app) await signOut(getAuth(app));
  authentication = null;
}
