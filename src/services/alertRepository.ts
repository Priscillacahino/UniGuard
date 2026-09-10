import {
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import type { AlertStatus, EmergencyAlert, EmergencyPhotoSnapshot } from '../types';
import {
  ensureFirebaseAuthentication,
  firebaseEnabled,
  firebaseStorage,
  firestore,
  currentFirebaseUserId,
} from './firebase';

const COLLECTION = 'emergencyAlerts';

function normalizeAlert(value: EmergencyAlert & {
  photoUrl?: string;
  photoCapturedAt?: string;
  photoSource?: EmergencyPhotoSnapshot['source'];
}): EmergencyAlert {
  if (value.photoSnapshot || !value.photoUrl) return value;
  return {
    ...value,
    photoSnapshot: {
      dataUrl: value.photoUrl,
      capturedAt: value.photoCapturedAt || value.updatedAt,
      source: value.photoSource || 'camera_traseira',
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
  const { photoSnapshot, ...alertWithoutEmbeddedPhoto } = alert;
  const alertDocument = doc(firestore, COLLECTION, alert.id);

  // A imagem base64 permanece apenas na memória/localStorage para a demonstração.
  // Fotos reais são enviadas ao Storage; o Firestore recebe somente a URL.
  await setDoc(alertDocument, withoutUndefined({
    ...alertWithoutEmbeddedPhoto,
    authUid: currentFirebaseUserId(),
  }));

  const isRealPhoto = photoSnapshot
    && photoSnapshot.source !== 'simulacao_evidencia'
    && photoSnapshot.dataUrl.startsWith('data:image/');

  if (isRealPhoto && firebaseStorage) {
    const photoReference = ref(firebaseStorage, `emergency-evidence/${alert.id}.jpg`);
    await uploadString(photoReference, photoSnapshot.dataUrl, 'data_url');
    const photoUrl = await getDownloadURL(photoReference);
    await updateDoc(alertDocument, {
      photoUrl,
      photoCapturedAt: photoSnapshot.capturedAt,
      photoSource: photoSnapshot.source,
      updatedAt: new Date().toISOString(),
    });
  }
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
  if (note) {
    const timestampedNote = `[${new Date().toLocaleTimeString('pt-BR')}] ${note}`;
    patch.lastSecurityNote = note;
    patch.securityNotes = arrayUnion(timestampedNote);
  }
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
