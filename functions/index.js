import { initializeApp } from 'firebase-admin/app';
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall, onRequest } from 'firebase-functions/v2/https';
import { evaluateRateLimit } from './rateLimiter.js';
import { normalizeProfileRole, normalizeRequiredBoolean } from './inputValidation.js';

initializeApp();
const db = getFirestore();

const ACTIVE_STATUSES = new Set(['pendente', 'em_deslocamento', 'no_local']);
const ALLOWED_CATEGORIES = new Set([
  'urgencia_geral', 'violencia_ameaca', 'saude_desmaio', 'perseguicao_suspeito',
  'acidente_queda', 'area_escura_risco', 'furto_roubo',
]);

function string(value, max = 255) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function coordinate(value, min, max) {
  return typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max ? value : null;
}

export const createEmergencyAlert = onCall({ enforceAppCheck: true }, async (request) => {
  const auth = request.auth;
  if (!auth || auth.token.email_verified !== true) throw new HttpsError('unauthenticated', 'VERIFIED_AUTH_REQUIRED');

  const uid = auth.uid;
  const membershipRef = db.doc(`memberships/${uid}`);
  const rateRef = db.doc(`rateLimits/${uid}`);
  const membership = await membershipRef.get();
  if (!membership.exists || membership.get('active') !== true || !membership.get('institutionId')) {
    throw new HttpsError('permission-denied', 'ACTIVE_MEMBERSHIP_REQUIRED');
  }

  const institutionId = String(membership.get('institutionId'));
  const input = request.data ?? {};
  const alertId = string(input.id, 100);
  if (!alertId) throw new HttpsError('invalid-argument', 'ALERT_ID_REQUIRED');
  const category = string(input.category, 80);
  if (!ALLOWED_CATEGORIES.has(category)) throw new HttpsError('invalid-argument', 'INVALID_CATEGORY');

  const profileRole = normalizeProfileRole(input.role);
  if (!profileRole) throw new HttpsError('invalid-argument', 'INVALID_PROFILE_ROLE');

  const isInsideCampus = normalizeRequiredBoolean(input.isInsideCampus);
  if (isInsideCampus == null) throw new HttpsError('invalid-argument', 'INVALID_IS_INSIDE_CAMPUS');

  const alertRef = db.doc(`emergencyAlerts/${alertId}`);
  const auditRef = db.collection('auditLogs').doc();
  const nowMs = Date.now();
  const nowIso = new Date(nowMs).toISOString();

  await db.runTransaction(async (tx) => {
    const [rateSnap, existingAlert] = await Promise.all([tx.get(rateRef), tx.get(alertRef)]);
    if (existingAlert.exists) throw new HttpsError('already-exists', 'ALERT_ALREADY_EXISTS');

    const rate = rateSnap.exists ? rateSnap.data() : {};
    if (rate?.activeAlertId) {
      const activeSnap = await tx.get(db.doc(`emergencyAlerts/${rate.activeAlertId}`));
      if (activeSnap.exists && ACTIVE_STATUSES.has(activeSnap.get('status'))) {
        throw new HttpsError('resource-exhausted', 'ACTIVE_ALERT_EXISTS');
      }
    }

    const check = evaluateRateLimit(rate?.timestamps, nowMs);
    if (!check.allowed) {
      throw new HttpsError('resource-exhausted', check.reason, { retryAt: check.retryAt });
    }

    const lat = coordinate(input.location?.lat, -90, 90);
    const lng = coordinate(input.location?.lng, -180, 180);
    const retentionExpiresAt = Timestamp.fromMillis(nowMs + 90 * 24 * 60 * 60 * 1000);

    const alert = {
      id: alertId, institutionId, authUid: uid, userId: uid,
      protocolNumber: `SOS-${alertId.slice(0, 8).toUpperCase()}`,
      userProfile: { id: uid, institutionId, name: string(input.userName, 160) || 'Usuário', role: profileRole, registeredAt: nowIso },
      category, status: 'pendente', receiptStatus: 'aguardando_central',
      retentionExpiresAt, createdAt: nowIso, updatedAt: nowIso,
      location: { lat, lng }, locationName: string(input.locationName, 255) || 'Localização informada pelo dispositivo',
      isInsideCampus, signalLost: lat == null || lng == null,
      lastSignalTimestamp: nowIso, source: string(input.source, 20) === 'android' ? 'android' : 'web',
    };

    tx.set(alertRef, alert);
    tx.set(auditRef, {
      id: auditRef.id, institutionId, alertId, actorUid: uid, actorType: 'user', eventType: 'alert_created',
      createdAt: nowIso, retentionExpiresAt: Timestamp.fromMillis(nowMs + 365 * 24 * 60 * 60 * 1000),
      metadata: { source: 'trusted_backend' },
    });
    tx.set(rateRef, {
      institutionId, activeAlertId: alertId, timestamps: check.timestamps, updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  });

  return { id: alertId, status: 'pendente', createdAt: nowIso };
});

export const health = onRequest((request, response) => {
  response.set('Cache-Control', 'no-store');
  response.status(200).json({
    service: 'uniguard-backend',
    status: 'ok',
    version: '0.9-prep',
    timestamp: new Date().toISOString(),
  });
});
