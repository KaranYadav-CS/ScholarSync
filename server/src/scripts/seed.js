const demoDb = require('../database/demoDb');

console.log('[Seed] Seeding ScholarSync demo database...');
demoDb.reset();
console.log('[Seed] Successfully seeded 5 demo accounts, 3 scholarships, criteria, and applications!');
console.log('');
console.log('--- DEMO LOGIN CREDENTIALS ---');
console.log('Password for all accounts: Password123!');
console.log('1. Student           : student@scholarsync.edu');
console.log('2. Faculty Verifier  : verifier@scholarsync.edu');
console.log('3. Scholarship Admin : admin@scholarsync.edu');
console.log('4. System Admin      : sysadmin@scholarsync.edu');
console.log('------------------------------');
