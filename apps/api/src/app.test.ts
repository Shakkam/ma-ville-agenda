import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from './app.js';

// These paths short-circuit before any database call (auth guards reject
// missing tokens, and Zod validation runs before Prisma), so they run with
// no database connection.

test('GET /health returns ok', async () => {
  const res = await request(app).get('/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'ok');
});

test('POST /api/auth/login rejects an invalid email (400)', async () => {
  const res = await request(app).post('/api/auth/login').send({ email: 'not-an-email', password: 'x' });
  assert.equal(res.status, 400);
});

test('GET /api/users without a token → 401', async () => {
  const res = await request(app).get('/api/users');
  assert.equal(res.status, 401);
});

test('POST /api/events without a token → 401', async () => {
  const res = await request(app).post('/api/events').send({ title: 'x' });
  assert.equal(res.status, 401);
});

test('POST /api/users/invite without a token → 401', async () => {
  const res = await request(app).post('/api/users/invite').send({ email: 'a@b.c', role: 'MODERATOR' });
  assert.equal(res.status, 401);
});

test('POST /api/push/register with a missing token field → 400', async () => {
  const res = await request(app).post('/api/push/register').send({});
  assert.equal(res.status, 400);
});

test('POST /api/auth/accept-invite with a missing token → 400', async () => {
  const res = await request(app).post('/api/auth/accept-invite').send({ password: 'short' });
  assert.equal(res.status, 400);
});

test('unknown route → 404', async () => {
  const res = await request(app).get('/api/does-not-exist');
  assert.equal(res.status, 404);
});
