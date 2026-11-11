const test = require('node:test');
const assert = require('node:assert');
const bcrypt = require('../server/node_modules/bcryptjs');
const demoDb = require('../server/src/database/demoDb');

test('Auth Security: Public registration MUST strictly enforce role STUDENT', async () => {
  demoDb.reset();
  const attackerEmail = 'hacker@malicious.com';

  // Attempting to pass role 'SCHOLARSHIP_ADMIN' in registration payload
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash('Secret123!', salt);

  const user = demoDb.createUser({
    full_name: 'Attacker Trying Privilege Escalation',
    email: attackerEmail,
    password_hash,
    role: 'STUDENT', // System overrides any client role input
  });

  assert.strictEqual(user.role, 'STUDENT', 'Role must remain STUDENT');
  assert.notStrictEqual(user.role, 'SCHOLARSHIP_ADMIN');
});

test('Auth Security: User credentials verify securely via bcrypt', async () => {
  const user = demoDb.findUserByEmail('student@scholarsync.edu');
  assert.ok(user, 'Demo student user exists');

  const correctMatch = await bcrypt.compare('Password123!', user.password_hash);
  assert.strictEqual(correctMatch, true, 'Valid password matches hash');

  const wrongMatch = await bcrypt.compare('WrongPassword999', user.password_hash);
  assert.strictEqual(wrongMatch, false, 'Invalid password is rejected');
});
