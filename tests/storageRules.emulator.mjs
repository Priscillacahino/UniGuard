import fs from 'node:fs';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getBytes } from 'firebase/storage';

const projectId = 'uniguard-ci-demo';
const env = await initializeTestEnvironment({
  projectId,
  firestore: { rules: fs.readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  storage: { rules: fs.readFileSync('storage.rules', 'utf8'), host: '127.0.0.1', port: 9199 },
});

const now = '2026-09-17T12:00:00.000Z';
const expiry = Timestamp.fromDate(new Date('2026-12-16T12:00:00.000Z'));

await env.withSecurityRulesDisabled(async (ctx) => {
  const db = ctx.firestore();
  await setDoc(doc(db, 'memberships/userA'), { institutionId: 'instA', active: true });
  await setDoc(doc(db, 'memberships/userB'), { institutionId: 'instB', active: true });
  await setDoc(doc(db, 'operators/opA'), { institutionId: 'instA', active: true });
  await setDoc(doc(db, 'emergencyAlerts/a1'), {
    id:'a1', institutionId:'instA', authUid:'userA', protocolNumber:'SOS-a1', userId:'userA',
    userProfile:{id:'userA',institutionId:'instA',name:'Pessoa Teste',role:'estudante',registeredAt:now},
    category:'urgencia_geral',status:'pendente',receiptStatus:'aguardando_central',retentionExpiresAt:expiry,
    createdAt:now,updatedAt:now,location:{lat:-7.1,lng:-34.8},locationName:'Campus teste',isInsideCampus:true,
    signalLost:false,lastSignalTimestamp:now,source:'web'
  });
});

try {
  const userA = env.authenticatedContext('userA', { email_verified: true });
  const userB = env.authenticatedContext('userB', { email_verified: true });
  const opA = env.authenticatedContext('opA', { email_verified: true });
  const userAUnverified = env.authenticatedContext('userA', { email_verified: false });
  const path = 'emergency-evidence/a1.jpg';
  const jpg = new Uint8Array([0xff,0xd8,0xff,0xd9]);

  await assertSucceeds(uploadBytes(ref(userA.storage(), path), jpg, { contentType: 'image/jpeg' }));
  await assertSucceeds(getBytes(ref(userA.storage(), path)));
  await assertSucceeds(getBytes(ref(opA.storage(), path)));
  await assertFails(getBytes(ref(userB.storage(), path)));
  await assertFails(getBytes(ref(userAUnverified.storage(), path)));
  await assertFails(uploadBytes(ref(userA.storage(), path), jpg, { contentType: 'image/jpeg' }));
  await assertFails(uploadBytes(ref(userA.storage(), 'emergency-evidence/other.jpg'), new TextEncoder().encode('texto'), { contentType: 'text/plain' }));

  console.log('Storage Emulator: cenarios criticos aprovados.');
} finally {
  await env.cleanup();
}