import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const firestoreRules = readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8');
const storageRules = readFileSync(resolve(process.cwd(), 'storage.rules'), 'utf8');

describe('invariantes críticas do Firestore', () => {
  it('exige e-mail verificado', () => {
    expect(firestoreRules).toContain('request.auth.token.email_verified == true');
  });

  it('exige vínculo institucional ativo para membros', () => {
    expect(firestoreRules).toContain('documents/memberships/$(request.auth.uid)');
    expect(firestoreRules).toContain("data.active == true");
    expect(firestoreRules).toContain('data.institutionId == institutionId');
  });

  it('restringe operadores à mesma instituição', () => {
    expect(firestoreRules).toContain('function isActiveOperatorFor(institutionId)');
    expect(firestoreRules).toContain('data.institutionId == institutionId');
  });

  it('mantém alertas sem exclusão pelo cliente', () => {
    expect(firestoreRules).toContain('allow delete: if false;');
  });

  it('não permite medicalNotes no perfil de usuário nem no alerta', () => {
    expect(firestoreRules).not.toMatch(/['"]medicalNotes['"]\s*,?/);
  });

  it('mantém auditoria append-only', () => {
    expect(firestoreRules).toContain('match /auditLogs/{eventId}');
    expect(firestoreRules).toContain('allow update, delete: if false;');
  });

  it('exige retentionExpiresAt nos alertas e eventos de auditoria', () => {
    const occurrences = firestoreRules.match(/retentionExpiresAt/g) ?? [];
    expect(occurrences.length).toBeGreaterThanOrEqual(4);
    expect(firestoreRules).toContain('data.retentionExpiresAt is timestamp');
  });

  it('limita campos que o usuário pode alterar ao cancelar um alerta', () => {
    expect(firestoreRules).toContain("affectedKeys().hasOnly(['status', 'updatedAt'])");
    expect(firestoreRules).toContain("request.resource.data.status == 'cancelado_usuario'");
  });
});

describe('invariantes críticas do Firebase Storage', () => {
  it('exige usuário verificado', () => {
    expect(storageRules).toContain('request.auth.token.email_verified == true');
  });

  it('valida vínculo e instituição antes de acessar evidência', () => {
    expect(storageRules).toContain('documents/memberships/$(request.auth.uid)');
    expect(storageRules).toContain('data.institutionId');
    expect(storageRules).toContain('alertDocument(alertId).data.institutionId');
  });

  it('impede sobrescrita da evidência existente', () => {
    expect(storageRules).toContain('resource == null');
  });

  it('limita evidência a formatos permitidos, sem metadados customizados e menos de 5 MB', () => {
    expect(storageRules).toContain('request.resource.size < 5 * 1024 * 1024');
    expect(storageRules).toContain('request.resource.metadata.size() == 0');
    expect(storageRules).toContain("'image/jpeg'");
    expect(storageRules).toContain("'image/png'");
    expect(storageRules).toContain("'image/webp'");
    expect(storageRules).not.toContain("request.resource.contentType.matches('image/.*')");
  });
});
