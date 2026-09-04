import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import type { AlertStatus, EmergencyAlert } from '../types';
import {
  ensureFirebaseAuthentication,
  firebaseEnabled,
  firestore,
  currentFirebaseUserId,
} from './firebase';

const COLLECTION = 'emergencyAlerts';

function normalizeAlert(value: EmergencyAlert & { photoUrl?: string; photoCapturedAt?: string }): EmergencyAlert {
  if (value.photoSnapshot || !value.photoUrl) return value;
  return {
    ...value,
    photoSnapshot: {
      dataUrl: value.photoUrl,
      capturedAt: value.photoCapturedAt || value.updatedAt,
      source: 'camera_traseira',
      latitude: value.location?.lat,
      longitude: value.location?.lng,
      protocolNumber: value.protocolNumber,
    },
  };
}

function withoutUndefined<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function publishAlert(alert: EmergencyAlert): Promise<void> {
  if (!firestore) return;
  await ensureFirebaseAuthentication();
  await setDoc(doc(firestore, COLLECTION, alert.id), withoutUndefined({
    ...alert,
    authUid: currentFirebaseUserId(),
  }));
}

export async function changeAlertStatus(
  alertId: string,
  status: AlertStatus,
  unitId?: string,
  unitName?: string,
  note?: string,
): Promise<void> {
  if (!firestore) return;
  await ensureFirebaseAuthentication();
  const patch: Record<string, unknown> = {
    status,
    updatedAt: new Date().toISOString(),
  };
  if (unitId) patch.assignedUnitId = unitId;
  if (unitName) patch.assignedUnitName = unitName;
  if (note) patch.lastSecurityNote = note;
  if (status === 'resolvido') patch.resolvedAt = new Date().toISOString();
  await updateDoc(doc(firestore, COLLECTION, alertId), patch);
}

export async function subscribeToAlerts(
  onChange: (alerts: EmergencyAlert[]) => void,
  onError: (error: Error) => void,
): Promise<() => void> {
  if (!firestore) return () => undefined;
  await ensureFirebaseAuthentication();
  const alertsQuery = query(collection(firestore, COLLECTION), orderBy('createdAt', 'desc'));
  return onSnapshot(
    alertsQuery,
    (snapshot) => onChange(snapshot.docs.map((item) => normalizeAlert(item.data() as EmergencyAlert))),
    (error) => onError(error),
  );
}

export { firebaseEnabled };
