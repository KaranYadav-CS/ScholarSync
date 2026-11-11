const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const app = require('../server/src/app');
const demoDb = require('../server/src/database/demoDb');

let server;
let port;
let baseUrl;

test.before(async () => {
  demoDb.reset();
  server = http.createServer(app);
  await new Promise((resolve) => {
    server.listen(0, () => {
      port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

test('API Health: /api/health returns healthy status and mode', async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.strictEqual(data.status, 'healthy');
  assert.ok(data.mode);
});

test('API Mode: /api/mode reports database and storage providers', async () => {
  const res = await fetch(`${baseUrl}/api/mode`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(typeof data.demoMode === 'boolean');
  assert.ok(data.database);
  assert.ok(data.storage);
});

test('API Scholarships: /api/scholarships returns published scholarships publicly', async () => {
  const res = await fetch(`${baseUrl}/api/scholarships`);
  assert.strictEqual(res.status, 200);
  const json = await res.json();
  assert.strictEqual(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.ok(json.data.length >= 3);
  assert.strictEqual(json.data[0].status, 'PUBLISHED');
});

test('API Auth: Public registration assigns STUDENT role and rejects duplicate email', async () => {
  const registerPayload = {
    full_name: 'Test New Applicant',
    email: 'newstudent@example.edu',
    password: 'Password123!',
    role: 'SCHOLARSHIP_ADMIN', // Attempted elevation
  };

  const res = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registerPayload),
  });

  assert.strictEqual(res.status, 201);
  const json = await res.json();
  assert.strictEqual(json.success, true);
  assert.strictEqual(json.data.user.role, 'STUDENT', 'Elevated role must be overridden to STUDENT');

  // Duplicate registration must return 409
  const dupRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registerPayload),
  });
  assert.strictEqual(dupRes.status, 409);
});

test('API Auth: Valid login succeeds and sets auth cookie', async () => {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'student@scholarsync.edu',
      password: 'Password123!',
    }),
  });

  assert.strictEqual(res.status, 200);
  const json = await res.json();
  assert.strictEqual(json.success, true);
  assert.strictEqual(json.data.user.email, 'student@scholarsync.edu');

  const setCookie = res.headers.get('set-cookie');
  assert.ok(setCookie, 'HttpOnly cookie must be set');
  assert.ok(setCookie.includes('scholarsync_token'));
  assert.ok(setCookie.includes('HttpOnly'));
});

test('API Auth: Invalid password returns 401 generic error', async () => {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'student@scholarsync.edu',
      password: 'IncorrectPassword',
    }),
  });

  assert.strictEqual(res.status, 401);
  const json = await res.json();
  assert.strictEqual(json.success, false);
  assert.strictEqual(json.error.code, 'INVALID_CREDENTIALS');
});

test('API RBAC: Unauthenticated requests to protected endpoints return 401', async () => {
  const res = await fetch(`${baseUrl}/api/students/me`);
  assert.strictEqual(res.status, 401);
  const json = await res.json();
  assert.strictEqual(json.error.code, 'UNAUTHORIZED');
});
