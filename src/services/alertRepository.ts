import {
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  where,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import type {
  AccessRole,
  AlertReceiptStatus,
  AlertStatus,
  AuditEventType,
  EmergencyAlert,
  EmergencyPhotoSnapshot,
} from '../types';
import {
  firebaseEnabled,
  firebaseStorage,
  firestore,
  getCurrentAuthorization,
  type FirebaseAccount,
} from './firebase';
import { RETENTION_POLICY } from './retention';
import { createAlertViaTrustedBackend, trustedBackendEnabled } from './trustedBackend';
import { safeLog } from './safeLogger';

const COLLECTION = 'emergencyAlerts';
const AUDIT_COLLECTION = 'auditLogs';

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
  if (value instanceof Timestamp) return value;
  if (Array.isArray(value)) {
    return value.filter((item) => item !== undefined).map((item) => withoutUndefined(item)) as T;
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, withoutUndefined(item)]),
    ) as T;
  }
  return value;
}

function retentionTimestamp(days: number): Timestamp {
  return Timestamp.fromMillis(Date.now() + days * 24 * 60 * 60 * 1000);
}

function sanitizeUserProfile(profile: EmergencyAlert['userProfile'], institutionId: string) {
  const { medicalNotes: _medicalNotes, ...profileWithoutRestrictedData } =
    profile as EmergencyAlert['userProfile'] & { medicalNotes?: unknown };
  return {
    ...profileWithoutRestrictedData,
    institutionId,
  };
}

function createAuditEvent(
  auditId: string,
  account: FirebaseAccount,
  alertId: string,
  eventType: AuditEventType,
  createdAt: string,
  metadata?: Record<string, string | number | boolean | null>,
) {
  return withoutUndefined({
    id: auditId,
    institutionId: account.institutionId,
    alertId,
    actorUid: account.uid,
    actorType: account.role,
    eventType,
    createdAt,
    retentionExpiresAt: retentionTimestamp(RETENTION_POLICY.auditDays),
    metadata,
  });
}

async function requireAccount(expectedRole?: AccessRole): Promise<FirebaseAccount> {
  const account = await getCurrentAuthorization();
  if (!account) throw new Error('AUTHORIZATION_REQUIRED');
  if (expectedRole && account.role !== expectedRole) {
    throw new Error('ROLE_NOT_AUTHORIZED');
  }
  return account;
}

function sortByCreatedAt(alerts: EmergencyAlert[]) {
  return [...alerts].sort((a, b) => {
    const aTime = Date.parse(a.createdAt);
    const bTime = Date.parse(b.createdAt);
    return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
  });
}

export async function publishAlert(alert: EmergencyAlert): Promise<void> {
  if (!firestore || !firebaseEnabled) return;

  const account = await requireAccount();
  const now = new Date().toISOString();
  const {
    photoSnapshot,
    securityNotes: _securityNotes,
    userRouteHistory: _userRouteHistory,
    smsNotificationsSent: _smsNotificationsSent,
    ...alertWithoutEmbeddedPhoto
  } = alert;
  const alertDocument = doc(firestore, COLLECTION, alert.id);
  const auditDocument = doc(collection(firestore, AUDIT_COLLECTION));

  const payload = {
    ...alertWithoutEmbeddedPhoto,
    id: alert.id,
    institutionId: account.institutionId,
    authUid: account.uid,
    userProfile: sanitizeUserProfile(alert.userProfile, account.institutionId),
    status: 'pendente' as const,
    receiptStatus: 'aguardando_central' as AlertReceiptStatus,
    createdAt: now,
    updatedAt: now,
    retentionExpiresAt: retentionTimestamp(RETENTION_POLICY.alertDays),
    ...(account.role === 'operator' && alert.securityNotes
      ? { securityNotes: alert.securityNotes }
      : {}),
  };

  if (trustedBackendEnabled && account.role === 'user') {
    await createAlertViaTrustedBackend(alert);
  } else {
    const batch = writeBatch(firestore);
    batch.set(alertDocument, withoutUndefined(payload));
    batch.set(
      auditDocument,
      createAuditEvent(
        auditDocument.id,
        account,
        alert.id,
        'alert_created',
        now,
        { source: account.role === 'operator' ? 'central_simulation' : 'user_app' },
      ),
    );
    await batch.commit();
  }

  const isRealPhoto = photoSnapshot
    && photoSnapshot.source !== 'simulacao_evidencia'
    && photoSnapshot.dataUrl.startsWith('data:image/');

  if (isRealPhoto && firebaseStorage) {
    const photoReference = ref(firebaseStorage, `emergency-evidence/${alert.id}/evidence.jpg`);
    await uploadString(photoReference, photoSnapshot.dataUrl, 'data_url');
    const photoUrl = await getDownloadURL(photoReference);
    const photoAuditDocument = doc(collection(firestore, AUDIT_COLLECTION));
    const photoBatch = writeBatch(firestore);
    photoBatch.update(alertDocument, {
      photoUrl,
      photoCapturedAt: photoSnapshot.capturedAt,
      photoSource: photoSnapshot.source,
      updatedAt: new Date().toISOString(),
    });
    photoBatch.set(
      photoAuditDocument,
      createAuditEvent(
        photoAuditDocument.id,
        account,
        alert.id,
        'evidence_uploaded',
        new Date().toISOString(),
        { source: 'web_camera' },
      ),
    );
    await photoBatch.commit();
  }
}

export async function acknowledgeAlert(alertId: string): Promise<void> {
  if (!firestore || !firebaseEnabled) return;

  const account = await requireAccount('operator');
  const now = new Date().toISOString();
  const alertDocument = doc(firestore, COLLECTION, alertId);
  const auditDocument = doc(collection(firestore, AUDIT_COLLECTION));

  await runTransaction(firestore, async (transaction) => {
    const currentAlert = await transaction.get(alertDocument);
    if (!currentAlert.exists()) return;

    const currentData = currentAlert.data() as EmergencyAlert;
    if (currentData.receiptStatus === 'recebido_pela_central') return;

    transaction.update(alertDocument, {
      receiptStatus: 'recebido_pela_central' as AlertReceiptStatus,
      centralReceiptAt: now,
      centralReceiptByUid: account.uid,
      updatedAt: now,
    });
    transaction.set(
      auditDocument,
      createAuditEvent(auditDocument.id, account, alertId, 'alert_received', now),
    );
  });
}

export async function cancelAlert(alertId: string): Promise<void> {
  if (!firestore || !firebaseEnabled) return;

  const account = await requireAccount('user');
  const now = new Date().toISOString();
  const alertDocument = doc(firestore, COLLECTION, alertId);
  const auditDocument = doc(collection(firestore, AUDIT_COLLECTION));
  const batch = writeBatch(firestore);

  batch.update(alertDocument, {
    status: 'cancelado_usuario' as AlertStatus,
    updatedAt: now,
  });
  batch.set(
    auditDocument,
    createAuditEvent(auditDocument.id, account, alertId, 'alert_cancelled_by_user', now),
  );
  await batch.commit();
}

export async function changeAlertStatus(
  alertId: string,
  status: AlertStatus,
  unitId?: string,
  unitName?: string,
  note?: string,
): Promise<void> {
  if (!firestore || !firebaseEnabled) return;
  if (status === 'cancelado_usuario') throw new Error('USER_CANCELLATION_REQUIRED');

  const account = await requireAccount('operator');
  const now = new Date().toISOString();
  const patch: Record<string, unknown> = {
    status,
    updatedAt: now,
  };
  if (unitId) patch.assignedUnitId = unitId;
  if (unitName) patch.assignedUnitName = unitName;
  if (note) {
    const timestampedNote = `[${new Date().toLocaleTimeString('pt-BR')}] ${note}`;
    patch.lastSecurityNote = note;
    patch.securityNotes = arrayUnion(timestampedNote);
  }
  if (status === 'resolvido') patch.resolvedAt = now;

  const alertDocument = doc(firestore, COLLECTION, alertId);
  const auditDocument = doc(collection(firestore, AUDIT_COLLECTION));
  const batch = writeBatch(firestore);
  batch.update(alertDocument, patch);
  batch.set(
    auditDocument,
    createAuditEvent(
      auditDocument.id,
      account,
      alertId,
      'alert_status_changed',
      now,
      { status, ...(unitId ? { unitId } : {}), ...(note ? { hasNote: true } : {}) },
    ),
  );
  await batch.commit();
}

export async function recordAlertViewed(alertId: string): Promise<void> {
  if (!firestore || !firebaseEnabled) return;

  const account = await requireAccount('operator');
  const auditDocument = doc(collection(firestore, AUDIT_COLLECTION));
  const now = new Date().toISOString();
  const batch = writeBatch(firestore);
  batch.set(
    auditDocument,
    createAuditEvent(auditDocument.id, account, alertId, 'alert_viewed', now),
  );
  await batch.commit();
}

export async function subscribeToAlerts(
  institutionId: string,
  role: AccessRole,
  onChange: (alerts: EmergencyAlert[]) => void,
  onError: (error: Error) => void,
): Promise<() => void> {
  if (!firestore || !firebaseEnabled) return () => undefined;

  const account = await requireAccount();
  if (account.institutionId !== institutionId || account.role !== role) {
    throw new Error('INSTITUTION_CONTEXT_MISMATCH');
  }

  const constraints = [
    where('institutionId', '==', account.institutionId),
    ...(account.role === 'user' ? [where('authUid', '==', account.uid)] : []),
  ];
  const alertsQuery = query(collection(firestore, COLLECTION), ...constraints);
  const acknowledgedInSession = new Set<string>();

  return onSnapshot(
    alertsQuery,
    (snapshot) => {
      const alerts = sortByCreatedAt(
        snapshot.docs.map((item) => normalizeAlert(item.data() as EmergencyAlert)),
      );
      onChange(alerts);

      if (account.role === 'operator') {
        snapshot.docs
          .filter((item) => {
            const data = item.data() as EmergencyAlert;
            return data.status === 'pendente'
              && data.receiptStatus !== 'recebido_pela_central'
              && !data.centralReceiptAt
              && !acknowledgedInSession.has(item.id);
          })
          .forEach((item) => {
            acknowledgedInSession.add(item.id);
            void acknowledgeAlert(item.id).catch((error) => {
              acknowledgedInSession.delete(item.id);
              safeLog('error', 'alert_acknowledgement_failed', { message: error instanceof Error ? error.message : 'unknown_error' });
            });
          });
      }
    },
    (error) => onError(error),
  );
}

export { firebaseEnabled };
