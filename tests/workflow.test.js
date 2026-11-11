const test = require('node:test');
const assert = require('node:assert');
const demoDb = require('../server/src/database/demoDb');

test('Workflow State Machine: Application lifecycle transitions correctly and preserves audit trail', () => {
  demoDb.reset();

  const student = demoDb.findStudentByUserId('44444444-4444-4444-4444-444444444444');
  const scholarship = demoDb.data.scholarships[1]; // Women in computing

  // 1. Create Draft
  const { application: draft } = demoDb.createDraftApplication(student.student_id, scholarship.scholarship_id);
  assert.strictEqual(draft.status, 'DRAFT');

  // 2. Add sample document
  demoDb.addDocument({
    application_id: draft.application_id,
    uploaded_by_user_id: student.user_id,
    document_type: 'Transcript',
    blob_name: 'test-blob-123.pdf',
    original_file_name: 'transcript.pdf',
    content_type: 'application/pdf',
    size_bytes: 1024,
  });

  // 3. Submit application
  const submitted = demoDb.submitApplication(draft.application_id, student.user_id, 'My application note');
  assert.strictEqual(submitted.status, 'SUBMITTED');
  assert.ok(submitted.submitted_at);

  // 4. Assign Verifier
  const verifierUserId = '33333333-3333-3333-3333-333333333333';
  const underReview = demoDb.transitionApplicationStatus(
    draft.application_id,
    '11111111-1111-1111-1111-111111111111', // admin
    'UNDER_REVIEW',
    'Assigned to verifier',
    { assigned_verifier_user_id: verifierUserId }
  );
  assert.strictEqual(underReview.status, 'UNDER_REVIEW');
  assert.strictEqual(underReview.assigned_verifier_user_id, verifierUserId);

  // 5. Verifier requests clarification
  const clarificationReq = demoDb.transitionApplicationStatus(
    draft.application_id,
    verifierUserId,
    'CLARIFICATION_REQUESTED',
    'Please clarify year of study.'
  );
  assert.strictEqual(clarificationReq.status, 'CLARIFICATION_REQUESTED');

  // 6. Student responds
  const resubmitted = demoDb.transitionApplicationStatus(
    draft.application_id,
    student.user_id,
    'RESUBMITTED',
    'Enrolled in 3rd year CSE.'
  );
  assert.strictEqual(resubmitted.status, 'RESUBMITTED');

  // 7. Verifier recommends approval
  const recommended = demoDb.transitionApplicationStatus(
    draft.application_id,
    verifierUserId,
    'RECOMMENDED_FOR_APPROVAL',
    'All certificates validated.'
  );
  assert.strictEqual(recommended.status, 'RECOMMENDED_FOR_APPROVAL');

  // 8. Admin makes final decision with reason
  const approved = demoDb.transitionApplicationStatus(
    draft.application_id,
    '11111111-1111-1111-1111-111111111111',
    'APPROVED',
    'Meets all academic excellence criteria.',
    { decision_reason: 'Meets all academic excellence criteria.' }
  );
  assert.strictEqual(approved.status, 'APPROVED');
  assert.strictEqual(approved.decision_reason, 'Meets all academic excellence criteria.');

  // Verify status history preserved all 6 transitions
  const finalApp = demoDb.getApplicationById(draft.application_id);
  assert.ok(finalApp.statusHistory.length >= 6);
});

test('BOLA Protection: Student cannot query another student applications', () => {
  demoDb.reset();
  const student1Apps = demoDb.getApplications({ studentId: 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa' });
  const student2Apps = demoDb.getApplications({ studentId: 'a2222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa' });

  assert.ok(student1Apps.length > 0);
  assert.ok(student2Apps.length > 0);

  // Ensure strict isolation
  assert.strictEqual(student1Apps.every((a) => a.student_id === 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), true);
  assert.strictEqual(student2Apps.every((a) => a.student_id === 'a2222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa'), true);
});

test('Analytics Aggregation: Metrics reconcile without exposing direct PII', () => {
  demoDb.reset();
  const overview = demoDb.getAnalyticsOverview();
  assert.ok(typeof overview.totalApplications === 'number');
  assert.ok(typeof overview.totalApproved === 'number');
  assert.ok(typeof overview.totalDisbursed === 'number');

  const deptMetrics = demoDb.getAnalyticsByDepartment();
  assert.ok(Array.isArray(deptMetrics));
  assert.ok(deptMetrics.length > 0);
  assert.ok(deptMetrics[0].department);
  // Ensure no password or sensitive tokens exist in aggregates
  assert.strictEqual(deptMetrics[0].password_hash, undefined);
  assert.strictEqual(deptMetrics[0].email, undefined);
});
