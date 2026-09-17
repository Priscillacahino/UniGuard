import { getApp, getApps, initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import type { AccessRole } from '../types';

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

const appCheckSiteKey = import.meta.env.VITE_FIREBASE_APPCHECK_SITE_KEY;
if (app && appCheckSiteKey) {
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
}
export const firestore = app ? getFirestore(app) : null;
export const firebaseStorage = app ? getStorage(app) : null;

export interface FirebaseAccount {
  uid: string;
  email: string;
  institutionId: string;
  role: AccessRole;
}

async function authorizationForUser(user: User): Promise<FirebaseAccount | null> {
  if (!app || !user.emailVerified) return null;

  const database = getFirestore(app);
  const operatorSnapshot = await getDoc(doc(database, 'operators', user.uid));
  if (operatorSnapshot.exists()) {
    const operator = operatorSnapshot.data();
    if (operator.active === true && typeof operator.institutionId === 'string' && operator.institutionId.length > 0) {
      return {
        uid: user.uid,
        email: user.email || '',
        institutionId: operator.institutionId,
        role: 'operator',
      };
    }
  }

  const membershipSnapshot = await getDoc(doc(database, 'memberships', user.uid));
  if (membershipSnapshot.exists()) {
    const membership = membershipSnapshot.data();
    if (membership.active === true && typeof membership.institutionId === 'string' && membership.institutionId.length > 0) {
      return {
        uid: user.uid,
        email: user.email || '',
        institutionId: membership.institutionId,
        role: 'user',
      };
    }
  }

  return null;
}

/**
 * Retorna a autorização efetiva da sessão atual.
 * Não cria identidade de fallback: sem e-mail verificado e sem vínculo ativo,
 * o usuário permanece sem acesso aos dados institucionais.
 */
export async function getCurrentAuthorization(): Promise<FirebaseAccount | null> {
  if (!app) return null;
  const user = getAuth(app).currentUser;
  return user ? authorizationForUser(user) : null;
}

export async function ensureFirebaseAuthentication(): Promise<FirebaseAccount | null> {
  return getCurrentAuthorization();
}

export async function authenticateAccount(email: string, password: string): Promise<FirebaseAccount> {
  if (!app) throw new Error('FIREBASE_NOT_CONFIGURED');

  const auth = getAuth(app);
  const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  if (!credential.user.emailVerified) {
    await sendEmailVerification(credential.user).catch(() => undefined);
    await signOut(auth);
    throw new Error('EMAIL_NOT_VERIFIED');
  }

  const account = await authorizationForUser(credential.user);
  if (!account) {
    await signOut(auth);
    throw new Error('NO_ACTIVE_INSTITUTIONAL_MEMBERSHIP');
  }

  return account;
}

export async function authenticateOperator(email: string, password: string): Promise<FirebaseAccount> {
  const account = await authenticateAccount(email, password);
  if (account.role !== 'operator') {
    await signOutFirebase();
    throw new Error('OPERATOR_NOT_AUTHORIZED');
  }
  return account;
}

/**
 * O cadastro só cria a credencial. O vínculo institucional é concedido fora do
 * cliente por um administrador/SSO em memberships/{uid}.
 */
export async function registerUserAccount(email: string, password: string): Promise<void> {
  if (!app) throw new Error('FIREBASE_NOT_CONFIGURED');

  const auth = getAuth(app);
  const credential = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  try {
    await sendEmailVerification(credential.user);
  } finally {
    await signOut(auth);
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  if (!app) throw new Error('FIREBASE_NOT_CONFIGURED');
  await sendPasswordResetEmail(getAuth(app), email.trim().toLowerCase());
}

export function currentFirebaseUserId(): string | null {
  return app ? getAuth(app).currentUser?.uid || null : null;
}

export async function signOutFirebase(): Promise<void> {
  if (app) await signOut(getAuth(app));
}
