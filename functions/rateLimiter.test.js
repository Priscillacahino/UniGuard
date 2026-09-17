import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateRateLimit, RATE_LIMIT_POLICY } from './rateLimiter.js';

test('permite primeiro alerta', () => {
  const r = evaluateRateLimit([], 1_000_000);
  assert.equal(r.allowed, true);
  assert.deepEqual(r.timestamps, [1_000_000]);
});

test('bloqueia cooldown', () => {
  const now = 1_000_000;
  const r = evaluateRateLimit([now - 10_000], now);
  assert.equal(r.allowed, false);
  assert.equal(r.reason, 'COOLDOWN');
});

test('bloqueia quarto alerta na janela', () => {
  const now = 2_000_000;
  const r = evaluateRateLimit([now-1_500_000, now-900_000, now-120_000], now);
  assert.equal(r.allowed, false);
  assert.equal(r.reason, 'WINDOW_LIMIT');
});

test('descarta eventos fora da janela', () => {
  const now = 3_000_000;
  const old = now - RATE_LIMIT_POLICY.windowMs - 1;
  const r = evaluateRateLimit([old], now);
  assert.equal(r.allowed, true);
});