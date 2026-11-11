const test = require('node:test');
const assert = require('node:assert');
const storageAdapter = require('../server/src/modules/documents/storageAdapter');
const demoDb = require('../server/src/database/demoDb');

test('File Management: Storage adapter generates opaque UUID blob names', async () => {
  const sampleBuffer = Buffer.from('ScholarSync Document Content Test');
  const result = await storageAdapter.uploadDocument({
    buffer: sampleBuffer,
    originalname: 'My Confidential Marks.pdf',
    mimetype: 'application/pdf',
    size: sampleBuffer.length,
  });

  assert.ok(result.blobName, 'Blob name must be generated');
  assert.ok(result.blobName.endsWith('.pdf'), 'Preserves extension');
  // Must NOT use original filename in storage key
  assert.strictEqual(result.blobName.includes('Confidential Marks'), false);
  // Must be at least 36 characters (UUIDv4)
  assert.ok(result.blobName.length >= 36);
});

test('File Management: Document metadata is recorded and linked to application', () => {
  demoDb.reset();
  const student = demoDb.data.students[0];
  const app = demoDb.data.applications[0];

  const doc = demoDb.addDocument({
    application_id: app.application_id,
    uploaded_by_user_id: student.user_id,
    document_type: 'Income Certificate',
    blob_name: 'test-opaque-12345.pdf',
    original_file_name: 'IncomeCert_2026.pdf',
    content_type: 'application/pdf',
    size_bytes: 2048,
  });

  assert.ok(doc.document_id);
  assert.strictEqual(doc.application_id, app.application_id);
  assert.strictEqual(doc.verification_status, 'PENDING');

  const retrieved = demoDb.findDocumentById(doc.document_id);
  assert.strictEqual(retrieved.blob_name, 'test-opaque-12345.pdf');
});
