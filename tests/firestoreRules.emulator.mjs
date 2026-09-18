import fs from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

const projectId = 'uniguard-ci-demo';
const env = await initializeTestEnvironment({
  projectId,
  firestore: { rules: fs.readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
});

const now = '2026-09-17T12:00:00.000Z';
const expiry = Timestamp.fromDate(new Date('2026-12-16T12:00:00.000Z'));

function alert(id, authUid, institutionId) {
  return {
    id, institutionId, authUid, protocolNumber: `SOS-${id}`, userId: authUid,
    userProfile: { id: authUid, institutionId, name: 'Pessoa Teste', role: 'estudante', registeredAt: now },
    category: 'urgencia_geral', status: 'pendente', receiptStatus: 'aguardando_central',
    retentionExpiresAt: expiry, createdAt: now, updatedAt: now,
    location: { lat: -7.1, lng: -34.8 }, locationName: 'Campus teste',
    isInsideCampus: true, signalLost: false, lastSignalTimestamp: now, source: 'web',
  };
}

await env.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();
  await setDoc(doc(db, 'memberships/userA'), { institutionId: 'instA', active: true });
  await setDoc(doc(db, 'memberships/userB'), { institutionId: 'instB', active: true });
  await setDoc(doc(db, 'operators/opA'), { institutionId: 'instA', active: true });
  await setDoc(doc(db, 'operators/opB'), { institutionId: 'instB', active: true });
  await setDoc(doc(db, 'memberships/inactiveUser'), { institutionId: 'instA', active: false });
  await setDoc(doc(db, 'operators/inactiveOp'), { institutionId: 'instA', active: false });
  await setDoc(doc(db, 'emergencyAlerts/a1'), alert('a1', 'userA', 'instA'));
  await setDoc(doc(db, 'emergencyAlerts/b1'), alert('b1', 'userB', 'instB'));
});

try {
  const userA = env.authenticatedContext('userA', { email_verified: true }).firestore();
  const userAUnverified = env.authenticatedContext('userA', { email_verified: false }).firestore();
  const opA = env.authenticatedContext('opA', { email_verified: true }).firestore();
  const ghost = env.authenticatedContext('ghost', { email_verified: true }).firestore();
  const inactiveUser = env.authenticatedContext('inactiveUser', { email_verified: true }).firestore();
  const inactiveOp = env.authenticatedContext('inactiveOp', { email_verified: true }).firestore();

  await assertSucceeds(getDoc(doc(userA, 'emergencyAlerts/a1')));
  await assertFails(getDoc(doc(userA, 'emergencyAlerts/b1')));
  await assertFails(getDoc(doc(userAUnverified, 'emergencyAlerts/a1')));
  await assertFails(getDoc(doc(ghost, 'emergencyAlerts/a1')));
  await assertFails(getDoc(doc(inactiveUser, 'emergencyAlerts/a1')));
  await assertFails(getDoc(doc(inactiveOp, 'emergencyAlerts/a1')));
  await assertSucceeds(getDoc(doc(opA, 'emergencyAlerts/a1')));
  await assertFails(getDoc(doc(opA, 'emergencyAlerts/b1')));
  await assertFails(updateDoc(doc(opA, 'emergencyAlerts/b1'), { updatedAt: now, status: 'em_deslocamento' }));
  await assertFails(updateDoc(doc(userA, 'emergencyAlerts/b1'), { updatedAt: now, status: 'cancelado_usuario' }));
  await assertSucceeds(updateDoc(doc(userA, 'emergencyAlerts/a1'), { updatedAt: now, status: 'cancelado_usuario' }));
  await assertFails(deleteDoc(doc(userA, 'emergencyAlerts/a1')));

  const injected = alert('a2', 'userA', 'instA');
  injected.medicalNotes = 'dado proibido';
  await assertFails(setDoc(doc(userA, 'emergencyAlerts/a2'), injected));
  await assertSucceeds(setDoc(doc(userA, 'emergencyAlerts/a3'), alert('a3', 'userA', 'instA')));

  const routeHistoryInjection = alert('a-route-history', 'userA', 'instA');
  routeHistoryInjection.userRouteHistory = [{ coordinate: { lat: -7.1, lng: -34.8 }, timestamp: now }];
  await assertFails(setDoc(doc(userA, 'emergencyAlerts/a-route-history'), routeHistoryInjection));

  const smsDetailsInjection = alert('a-sms-details', 'userA', 'instA');
  smsDetailsInjection.smsNotificationsSent = [{ contactName: 'Contato', contactPhone: '+5583999999999' }];
  await assertFails(setDoc(doc(userA, 'emergencyAlerts/a-sms-details'), smsDetailsInjection));


  const invalidLocationExtra = alert('a-location-extra', 'userA', 'instA');
  invalidLocationExtra.location = { lat: -7.1, lng: -34.8, unexpected: { nested: true } };
  await assertFails(setDoc(doc(userA, 'emergencyAlerts/a-location-extra'), invalidLocationExtra));

  const invalidAccuracy = alert('a-location-accuracy', 'userA', 'instA');
  invalidAccuracy.location = { lat: -7.1, lng: -34.8, accuracy: -1 };
  await assertFails(setDoc(doc(userA, 'emergencyAlerts/a-location-accuracy'), invalidAccuracy));

  const nullableAccuracy = alert('a-location-null', 'userA', 'instA');
  nullableAccuracy.location = { lat: null, lng: null, accuracy: null };
  await assertSucceeds(setDoc(doc(userA, 'emergencyAlerts/a-location-null'), nullableAccuracy));


  const malformedProfile = alert('a-profile-invalid', 'userA', 'instA');
  malformedProfile.userProfile.name = { unexpected: true };
  await assertFails(setDoc(doc(userA, 'emergencyAlerts/a-profile-invalid'), malformedProfile));

  const oversizedPhone = alert('a-profile-phone', 'userA', 'instA');
  oversizedPhone.userProfile.phone = '9'.repeat(80);
  await assertFails(setDoc(doc(userA, 'emergencyAlerts/a-profile-phone'), oversizedPhone));


  await env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), 'settings/security'), { trustedBackendRequired: true });
  });
  await assertFails(setDoc(doc(userA, 'emergencyAlerts/a4'), alert('a4', 'userA', 'instA')));

  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, 'auditLogs/log1'), {
      id: 'log1', institutionId: 'instA', alertId: 'a1', actorUid: 'userA', actorType: 'user',
      eventType: 'alert_created', createdAt: now, retentionExpiresAt: expiry, metadata: { source: 'test' },
    });
  });
  await assertFails(updateDoc(doc(userA, 'auditLogs/log1'), { metadata: { changed: true } }));
  await assertFails(deleteDoc(doc(userA, 'auditLogs/log1')));

  console.log('Firestore Emulator: cenarios criticos aprovados.');
} finally {
  await env.cleanup();
}