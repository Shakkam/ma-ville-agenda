import { test, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from './app.js';
import { prisma } from './db/prisma.js';

// Safety: these hit a real database. They only run when RUN_INTEGRATION=1 is set
// (the test:integration script loads .env.test, which points DATABASE_URL at the
// isolated "test" Postgres schema). Without it, this file defines nothing.
const RUN = process.env.RUN_INTEGRATION === '1';

const ADMIN = { email: 'admin@test.local', password: 'admin123' };

const resetAndSeed = async () => {
  await prisma.event.deleteMany();
  await prisma.pushToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.user.create({
    data: {
      email: ADMIN.email,
      password: await bcrypt.hash(ADMIN.password, 10),
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });
};

const login = async (email: string, password: string) => {
  const res = await request(app).post('/api/auth/login').send({ email, password });
  return res;
};

const adminToken = async () => {
  const res = await login(ADMIN.email, ADMIN.password);
  return res.body.token as string;
};

if (RUN) {
  beforeEach(resetAndSeed);
  after(() => prisma.$disconnect());

  test('login succeeds with valid credentials', async () => {
    const res = await login(ADMIN.email, ADMIN.password);
    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.user.role, 'SUPER_ADMIN');
  });

  test('login fails with a wrong password (401)', async () => {
    const res = await login(ADMIN.email, 'wrongpassword');
    assert.equal(res.status, 401);
  });

  test('RBAC: a moderator cannot manage users (403) but can moderate events (200)', async () => {
    // Create an active moderator directly, then act as them.
    await prisma.user.create({
      data: {
        email: 'modo@test.local',
        password: await bcrypt.hash('modopass123', 10),
        role: 'MODERATOR',
        status: 'ACTIVE',
      },
    });
    const modToken = (await login('modo@test.local', 'modopass123')).body.token;

    const users = await request(app).get('/api/users').set('Authorization', `Bearer ${modToken}`);
    assert.equal(users.status, 403);

    const adminEvents = await request(app).get('/api/events/admin').set('Authorization', `Bearer ${modToken}`);
    assert.equal(adminEvents.status, 200);
  });

  test('invitation flow: invite -> accept (set password) -> login works', async () => {
    const token = await adminToken();

    const invite = await request(app)
      .post('/api/users/invite')
      .set('Authorization', `Bearer ${token}`)
      .send({ email: 'newuser@test.local', role: 'MODERATOR' });
    assert.equal(invite.status, 201);
    assert.equal(invite.body.user.status, 'INVITED');

    const inviteToken = invite.body.inviteUrl.split('token=')[1];
    assert.ok(inviteToken);

    // Pending account cannot log in yet.
    const pendingLogin = await login('newuser@test.local', 'whatever');
    assert.equal(pendingLogin.status, 403);

    const accept = await request(app)
      .post('/api/auth/accept-invite')
      .send({ token: inviteToken, password: 'MyNewPassword1' });
    assert.equal(accept.status, 200);
    assert.ok(accept.body.token);

    const finalLogin = await login('newuser@test.local', 'MyNewPassword1');
    assert.equal(finalLogin.status, 200);
  });

  test('event lifecycle: create (PENDING) -> validate (PUBLISHED) -> visible publicly', async () => {
    const token = await adminToken();

    const created = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Concert test',
        description: 'desc',
        startDate: '2026-08-01T18:00:00.000Z',
        endDate: '2026-08-01T20:00:00.000Z',
        category: 'CULTURE',
        location: 'Léognan',
      });
    assert.equal(created.status, 201);
    assert.equal(created.body.status, 'PENDING');
    const id = created.body.id;

    // Not visible publicly while pending.
    let pub = await request(app).get('/api/events');
    assert.equal(pub.body.some((e: { id: string }) => e.id === id), false);

    const validated = await request(app).put(`/api/events/${id}/validate`).set('Authorization', `Bearer ${token}`);
    assert.equal(validated.status, 200);
    assert.equal(validated.body.status, 'PUBLISHED');

    // Now visible publicly.
    pub = await request(app).get('/api/events');
    assert.equal(pub.body.some((e: { id: string }) => e.id === id), true);
  });
}
