import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const apply = process.argv.includes('--apply');
const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT;
initializeApp({ credential: applicationDefault(), ...(projectId ? { projectId } : {}) });
const db = getFirestore();

const collections = ['emergencyAlerts', 'auditLogs'];
const findings = [];

for (const name of collections) {
  const snapshot = await db.collection(name).get();
  for (const doc of snapshot.docs) {
    const data = doc.data();
    const issues = [];
    if (!data.institutionId) issues.push('missing_institutionId');
    if (!data.retentionExpiresAt) issues.push('missing_retentionExpiresAt');
    if (Object.prototype.hasOwnProperty.call(data, 'medicalNotes')) issues.push('forbidden_medicalNotes');
    if (issues.length) findings.push({ collection: name, id: doc.id, issues });
  }
}

console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', findings }, null, 2));

if (apply && findings.length) {
  throw new Error('AUTO_REPAIR_DISABLED: revise os achados manualmente antes de qualquer mutacao.');
}

process.exitCode = findings.length ? 2 : 0;