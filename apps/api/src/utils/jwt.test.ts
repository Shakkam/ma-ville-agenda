import { test } from 'node:test';
import assert from 'node:assert/strict';
import { signToken, verifyToken } from './jwt.js';

test('signToken / verifyToken round-trips the payload', () => {
  const token = signToken({ userId: 'user-1', email: 'admin@example.com' });
  const payload = verifyToken(token);
  assert.ok(payload, 'payload should be returned');
  assert.equal(payload!.userId, 'user-1');
  assert.equal(payload!.email, 'admin@example.com');
});

test('verifyToken rejects a tampered token', () => {
  const token = signToken({ userId: 'user-1', email: 'admin@example.com' });
  assert.equal(verifyToken(token + 'x'), null);
});

test('verifyToken rejects garbage and empty input', () => {
  assert.equal(verifyToken('not-a-jwt'), null);
  assert.equal(verifyToken(''), null);
  assert.equal(verifyToken('a.b.c'), null);
});
