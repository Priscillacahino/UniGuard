import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProfileRole, normalizeRequiredBoolean } from './inputValidation.js';

test('aceita apenas perfis previstos no domínio', () => {
  for (const role of ['estudante', 'docente', 'tecnico', 'terceirizado', 'visitante']) {
    assert.equal(normalizeProfileRole(role), role);
  }
});

test('usa estudante quando o perfil não é informado', () => {
  assert.equal(normalizeProfileRole(undefined), 'estudante');
  assert.equal(normalizeProfileRole(''), 'estudante');
  assert.equal(normalizeProfileRole('   '), 'estudante');
});

test('rejeita perfis arbitrários ou tipos inválidos', () => {
  assert.equal(normalizeProfileRole('admin'), null);
  assert.equal(normalizeProfileRole('operator'), null);
  assert.equal(normalizeProfileRole({ role: 'estudante' }), null);
});


test('aceita somente booleanos reais para campos booleanos obrigatórios', () => {
  assert.equal(normalizeRequiredBoolean(true), true);
  assert.equal(normalizeRequiredBoolean(false), false);
  assert.equal(normalizeRequiredBoolean('true'), null);
  assert.equal(normalizeRequiredBoolean('false'), null);
  assert.equal(normalizeRequiredBoolean(1), null);
  assert.equal(normalizeRequiredBoolean(undefined), null);
});
