const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

// Fixed bcrypt hash for Password123!
const DEMO_PASSWORD_HASH = '$2a$10$4VX9sgleEEw7Ct61M0CJpOqqU1aGPdHDJm56b8o5IeNW/qCUW0lRi';

function getInitialData() {
  const adminUserId = '11111111-1111-1111-1111-111111111111';
  const sysAdminUserId = '22222222-2222-2222-2222-222222222222';
  const verifierUserId = '33333333-3333-3333-3333-333333333333';
  const student1UserId = '44444444-4444-4444-4444-444444444444';
  const student2UserId = '55555555-5555-5555-5555-555555555555';

  const student1Id = 'a1111111-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
  const student2Id = 'a2222222-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

  const scholarship1Id = 'b1111111-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const scholarship2Id = 'b2222222-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
  const scholarship3Id = 'b3333333-bbbb-bbbb-bbbb-bbbbbbbbbbbb';

  const application1Id = 'c1111111-cccc-cccc-cccc-cccccccccccc';
  const application2Id = 'c2222222-cccc-cccc-cccc-cccccccccccc';

  return {
    users: [
      {
        user_id: adminUserId,
        full_name: 'Dr. Sarah Mitchell',
        email: 'admin@scholarsync.edu',
        password_hash: DEMO_PASSWORD_HASH,
        role: 'SCHOLARSHIP_ADMIN',
        account_status: 'ACTIVE',
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        user_id: sysAdminUserId,
        full_name: 'Alex Chen',
        email: 'sysadmin@scholarsync.edu',
        password_hash: DEMO_PASSWORD_HASH,
        role: 'SYSTEM_ADMIN',
        account_status: 'ACTIVE',
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        user_id: verifierUserId,
        full_name: 'Prof. Robert Jenkins',
        email: 'verifier@scholarsync.edu',
        password_hash: DEMO_PASSWORD_HASH,
        role: 'VERIFIER',
        account_status: 'ACTIVE',
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        user_id: student1UserId,
        full_name: 'Aarav Sharma',
        email: 'student@scholarsync.edu',
        password_hash: DEMO_PASSWORD_HASH,
        role: 'STUDENT',
        account_status: 'ACTIVE',
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      },
      {
        user_id: student2UserId,
        full_name: 'Priya Patel',
        email: 'priya.patel@scholarsync.edu',
        password_hash: DEMO_PASSWORD_HASH,
        role: 'STUDENT',
        account_status: 'ACTIVE',
        created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
    ],

    students: [
      {
        student_id: student1Id,
        user_id: student1UserId,
        student_number: 'CS-2024-042',
        department: 'Computer Science and Engineering',
        program: 'B.Tech',
        study_year: 3,
        cgpa: 8.85,
        annual_family_income: 320000,
        domicile_state: 'Maharashtra',
        category: 'General',
        created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        student_id: student2Id,
        user_id: student2UserId,
        student_number: 'EE-2024-118',
        department: 'Electrical and Electronics Engineering',
        program: 'B.Tech',
        study_year: 2,
        cgpa: 7.9,
        annual_family_income: 580000,
        domicile_state: 'Karnataka',
        category: 'OBC',
        created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ],

    scholarships: [
      {
        scholarship_id: scholarship1Id,
        title: 'National Excellence STEM Scholarship 2026',
        provider: 'Ministry of Education & Tech Foundation',
        description: 'Prestigious scholarship awarded to high-performing STEM undergraduates with financial need. Covers annual tuition fee and academic resources allowance.',
        award_amount: 75000,
        currency: 'INR',
        category: 'Merit-cum-Means',
        application_start_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        deadline_at: new Date(Date.now() + 60 * 86400000).toISOString(),
        status: 'PUBLISHED',
        created_by_user_id: adminUserId,
        created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        scholarship_id: scholarship2Id,
        title: 'Women in Computing & AI Fellowship',
        provider: 'Global Tech Diversity Initiative',
        description: 'Promoting gender diversity in advanced computing, machine learning, and software systems. Open to 2nd to 4th year engineering students.',
        award_amount: 50000,
        currency: 'INR',
        category: 'Merit-based',
        application_start_at: new Date(Date.now() - 15 * 86400000).toISOString(),
        deadline_at: new Date(Date.now() + 45 * 86400000).toISOString(),
        status: 'PUBLISHED',
        created_by_user_id: adminUserId,
        created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      },
      {
        scholarship_id: scholarship3Id,
        title: 'Community Uplift Rural Opportunity Grant',
        provider: 'Apex Charitable Trust',
        description: 'Dedicated financial grant for students from rural backgrounds and lower-income families who maintain solid academic standing.',
        award_amount: 40000,
        currency: 'INR',
        category: 'Need-based',
        application_start_at: new Date(Date.now() - 10 * 86400000).toISOString(),
        deadline_at: new Date(Date.now() + 90 * 86400000).toISOString(),
        status: 'PUBLISHED',
        created_by_user_id: adminUserId,
        created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
      },
    ],

    eligibilityCriteria: [
      {
        criterion_id: 'crit-001',
        scholarship_id: scholarship1Id,
        field_key: 'cgpa',
        operator: 'GTE',
        expected_value: '7.5',
        upper_value: null,
        is_mandatory: true,
        display_reason: 'Minimum CGPA of 7.5 on a 10.0 scale',
      },
      {
        criterion_id: 'crit-002',
        scholarship_id: scholarship1Id,
        field_key: 'annual_family_income',
        operator: 'LTE',
        expected_value: '600000',
        upper_value: null,
        is_mandatory: true,
        display_reason: 'Annual family income must not exceed INR 6,00,000',
      },
      {
        criterion_id: 'crit-003',
        scholarship_id: scholarship1Id,
        field_key: 'study_year',
        operator: 'GTE',
        expected_value: '2',
        upper_value: null,
        is_mandatory: true,
        display_reason: 'Applicant must be in 2nd year or above',
      },
      {
        criterion_id: 'crit-004',
        scholarship_id: scholarship2Id,
        field_key: 'cgpa',
        operator: 'GTE',
        expected_value: '8.0',
        upper_value: null,
        is_mandatory: true,
        display_reason: 'Cumulative CGPA of 8.0 or higher',
      },
      {
        criterion_id: 'crit-005',
        scholarship_id: scholarship2Id,
        field_key: 'study_year',
        operator: 'BETWEEN',
        expected_value: '2',
        upper_value: '4',
        is_mandatory: true,
        display_reason: 'Must be enrolled in 2nd, 3rd, or 4th year of study',
      },
    ],

    applications: [
      {
        application_id: application1Id,
        student_id: student1Id,
        scholarship_id: scholarship1Id,
        assigned_verifier_user_id: verifierUserId,
        status: 'UNDER_REVIEW',
        submission_notes: 'Passionate about distributed systems. Requesting fee waiver.',
        submitted_at: new Date(Date.now() - 5 * 86400000).toISOString(),
        decision_at: null,
        decision_by_user_id: null,
        decision_reason: null,
        created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
      {
        application_id: application2Id,
        student_id: student2Id,
        scholarship_id: scholarship3Id,
        assigned_verifier_user_id: null,
        status: 'SUBMITTED',
        submission_notes: 'Applying based on rural domicile and family annual income certificate.',
        submitted_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        decision_at: null,
        decision_by_user_id: null,
        decision_reason: null,
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ],

    documents: [
      {
        document_id: 'doc-001',
        application_id: application1Id,
        uploaded_by_user_id: student1UserId,
        document_type: 'Income Certificate',
        blob_name: 'demo-income-cert-001.pdf',
        original_file_name: 'Income_Certificate_2025_26.pdf',
        content_type: 'application/pdf',
        size_bytes: 245120,
        sha256_hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        verification_status: 'ACCEPTED',
        verification_comments: 'Official tehsildar stamp verified.',
        uploaded_at: new Date(Date.now() - 6 * 86400000).toISOString(),
      },
      {
        document_id: 'doc-002',
        application_id: application1Id,
        uploaded_by_user_id: student1UserId,
        document_type: 'Academic Transcript',
        blob_name: 'demo-transcript-001.pdf',
        original_file_name: 'Sem5_Official_Transcript.pdf',
        content_type: 'application/pdf',
        size_bytes: 512300,
        sha256_hash: 'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
        verification_status: 'PENDING',
        verification_comments: null,
        uploaded_at: new Date(Date.now() - 6 * 86400000).toISOString(),
      },
    ],

    verifications: [
      {
        verification_id: 'ver-001',
        application_id: application1Id,
        verifier_user_id: verifierUserId,
        action: 'REVIEW_STARTED',
        comments: 'Initial review commenced. Validated academic status and income certificate authenticity.',
        action_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
    ],

    applicationStatusHistory: [
      {
        history_id: 'hist-001',
        application_id: application1Id,
        changed_by_user_id: student1UserId,
        old_status: 'DRAFT',
        new_status: 'SUBMITTED',
        change_reason: 'Student completed application submission',
        correlation_id: 'corr-001',
        changed_at: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        history_id: 'hist-002',
        application_id: application1Id,
        changed_by_user_id: adminUserId,
        old_status: 'SUBMITTED',
        new_status: 'UNDER_REVIEW',
        change_reason: 'Assigned to faculty verifier Prof. Robert Jenkins',
        correlation_id: 'corr-002',
        changed_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
      {
        history_id: 'hist-003',
        application_id: application2Id,
        changed_by_user_id: student2UserId,
        old_status: 'DRAFT',
        new_status: 'SUBMITTED',
        change_reason: 'Student completed application submission',
        correlation_id: 'corr-003',
        changed_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
    ],

    auditLogs: [
      {
        audit_id: 1,
        actor_user_id: student1UserId,
        action: 'APPLICATION_SUBMITTED',
        entity_type: 'Application',
        entity_id: application1Id,
        outcome: 'SUCCESS',
        correlation_id: 'corr-001',
        event_time: new Date(Date.now() - 5 * 86400000).toISOString(),
        metadata_json: JSON.stringify({ role: 'STUDENT' }),
      },
      {
        audit_id: 2,
        actor_user_id: adminUserId,
        action: 'VERIFIER_ASSIGNED',
        entity_type: 'Application',
        entity_id: application1Id,
        outcome: 'SUCCESS',
        correlation_id: 'corr-002',
        event_time: new Date(Date.now() - 4 * 86400000).toISOString(),
        metadata_json: JSON.stringify({ verifier_id: verifierUserId }),
      },
    ],
  };
}

class DemoDatabase {
  constructor() {
    this.filePath = config.localDbPath;
    this.data = null;
    this.load();
  }

  load() {
    try {
      const dataDir = path.dirname(this.filePath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf8');
        this.data = JSON.parse(raw);
      } else {
        this.data = getInitialData();
        this.save();
      }
    } catch (err) {
      console.warn('[DemoDb] Error loading local DB file, initializing fresh demo data:', err.message);
      this.data = getInitialData();
    }
  }

  save() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('[DemoDb] Failed to persist data to disk:', err.message);
    }
  }

  reset() {
    this.data = getInitialData();
    this.save();
    return this.data;
  }

  // --- Users Operations ---
  findUserByEmail(email) {
    if (!email) return null;
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(userId) {
    return this.data.users.find((u) => u.user_id === userId);
  }

  createUser(userData) {
    const user = {
      user_id: userData.user_id || uuidv4(),
      full_name: userData.full_name,
      email: userData.email.toLowerCase(),
      password_hash: userData.password_hash,
      role: userData.role || 'STUDENT',
      account_status: userData.account_status || 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      last_login_at: null,
    };
    this.data.users.push(user);
    this.save();
    return user;
  }

  updateUser(userId, updates) {
    const user = this.findUserById(userId);
    if (!user) return null;
    Object.assign(user, updates, { updated_at: new Date().toISOString() });
    this.save();
    return user;
  }

  getAllUsers() {
    return this.data.users.map(({ password_hash, ...safe }) => safe);
  }

  // --- Student Profiles ---
  findStudentByUserId(userId) {
    return this.data.students.find((s) => s.user_id === userId);
  }

  findStudentById(studentId) {
    return this.data.students.find((s) => s.student_id === studentId);
  }

  upsertStudent(userId, profileData) {
    let student = this.findStudentByUserId(userId);
    if (student) {
      Object.assign(student, profileData, { updated_at: new Date().toISOString() });
    } else {
      student = {
        student_id: uuidv4(),
        user_id: userId,
        student_number: profileData.student_number || null,
        department: profileData.department || '',
        program: profileData.program || 'B.Tech',
        study_year: Number(profileData.study_year || 1),
        cgpa: Number(profileData.cgpa || 0),
        annual_family_income: Number(profileData.annual_family_income || 0),
        domicile_state: profileData.domicile_state || '',
        category: profileData.category || 'General',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.data.students.push(student);
    }
    this.save();
    return student;
  }

  // --- Scholarships & Criteria ---
  getScholarships({ status = null, search = '' } = {}) {
    let list = this.data.scholarships;
    if (status) {
      list = list.filter((s) => s.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.title.toLowerCase().includes(q) || s.provider.toLowerCase().includes(q) || s.category.toLowerCase().includes(q));
    }
    return list;
  }

  getScholarshipById(scholarshipId) {
    const s = this.data.scholarships.find((item) => item.scholarship_id === scholarshipId);
    if (!s) return null;
    const criteria = this.data.eligibilityCriteria.filter((c) => c.scholarship_id === scholarshipId);
    return { ...s, criteria };
  }

  createScholarship(scholarshipData, criteriaData = [], creatorUserId) {
    const scholarship = {
      scholarship_id: uuidv4(),
      title: scholarshipData.title,
      provider: scholarshipData.provider,
      description: scholarshipData.description,
      award_amount: Number(scholarshipData.award_amount || 0),
      currency: scholarshipData.currency || 'INR',
      category: scholarshipData.category || 'Merit-cum-Means',
      application_start_at: scholarshipData.application_start_at || new Date().toISOString(),
      deadline_at: scholarshipData.deadline_at,
      status: scholarshipData.status || 'DRAFT',
      created_by_user_id: creatorUserId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.data.scholarships.push(scholarship);

    if (criteriaData && criteriaData.length > 0) {
      criteriaData.forEach((c) => {
        this.data.eligibilityCriteria.push({
          criterion_id: uuidv4(),
          scholarship_id: scholarship.scholarship_id,
          field_key: c.field_key,
          operator: c.operator,
          expected_value: String(c.expected_value),
          upper_value: c.upper_value ? String(c.upper_value) : null,
          is_mandatory: c.is_mandatory !== false,
          display_reason: c.display_reason || '',
          created_at: new Date().toISOString(),
        });
      });
    }

    this.save();
    return this.getScholarshipById(scholarship.scholarship_id);
  }

  updateScholarship(scholarshipId, updates, criteria = null) {
    const s = this.data.scholarships.find((item) => item.scholarship_id === scholarshipId);
    if (!s) return null;
    Object.assign(s, updates, { updated_at: new Date().toISOString() });

    if (criteria !== null) {
      // replace criteria
      this.data.eligibilityCriteria = this.data.eligibilityCriteria.filter((c) => c.scholarship_id !== scholarshipId);
      criteria.forEach((c) => {
        this.data.eligibilityCriteria.push({
          criterion_id: uuidv4(),
          scholarship_id: scholarshipId,
          field_key: c.field_key,
          operator: c.operator,
          expected_value: String(c.expected_value),
          upper_value: c.upper_value ? String(c.upper_value) : null,
          is_mandatory: c.is_mandatory !== false,
          display_reason: c.display_reason || '',
          created_at: new Date().toISOString(),
        });
      });
    }

    this.save();
    return this.getScholarshipById(scholarshipId);
  }

  // --- Applications Operations ---
  getApplicationById(applicationId) {
    const app = this.data.applications.find((a) => a.application_id === applicationId);
    if (!app) return null;

    const student = this.data.students.find((s) => s.student_id === app.student_id);
    const user = student ? this.data.users.find((u) => u.user_id === student.user_id) : null;
    const scholarship = this.data.scholarships.find((s) => s.scholarship_id === app.scholarship_id);
    const verifier = app.assigned_verifier_user_id ? this.data.users.find((u) => u.user_id === app.assigned_verifier_user_id) : null;
    const decider = app.decision_by_user_id ? this.data.users.find((u) => u.user_id === app.decision_by_user_id) : null;

    const documents = this.data.documents.filter((d) => d.application_id === applicationId);
    const verifications = this.data.verifications.filter((v) => v.application_id === applicationId);
    const statusHistory = this.data.applicationStatusHistory
      .filter((h) => h.application_id === applicationId)
      .sort((a, b) => new Date(b.changed_at) - new Date(a.changed_at));

    return {
      ...app,
      student: student ? { ...student, full_name: user?.full_name, email: user?.email } : null,
      scholarship,
      verifier: verifier ? { user_id: verifier.user_id, full_name: verifier.full_name, email: verifier.email } : null,
      decider: decider ? { user_id: decider.user_id, full_name: decider.full_name } : null,
      documents,
      verifications,
      statusHistory,
    };
  }

  getApplications({ studentId = null, verifierUserId = null, status = null } = {}) {
    let list = this.data.applications;
    if (studentId) list = list.filter((a) => a.student_id === studentId);
    if (verifierUserId) list = list.filter((a) => a.assigned_verifier_user_id === verifierUserId);
    if (status) list = list.filter((a) => a.status === status);

    return list.map((a) => {
      const student = this.data.students.find((s) => s.student_id === a.student_id);
      const user = student ? this.data.users.find((u) => u.user_id === student.user_id) : null;
      const scholarship = this.data.scholarships.find((s) => s.scholarship_id === a.scholarship_id);
      const verifier = a.assigned_verifier_user_id ? this.data.users.find((u) => u.user_id === a.assigned_verifier_user_id) : null;

      return {
        ...a,
        student_name: user?.full_name || 'Unknown',
        student_email: user?.email || '',
        department: student?.department || '',
        cgpa: student?.cgpa || 0,
        scholarship_title: scholarship?.title || '',
        scholarship_award: scholarship?.award_amount || 0,
        verifier_name: verifier?.full_name || null,
      };
    });
  }

  createDraftApplication(studentId, scholarshipId, submissionNotes = '') {
    // Check duplicate
    const existing = this.data.applications.find(
      (a) => a.student_id === studentId && a.scholarship_id === scholarshipId
    );
    if (existing) {
      return { application: this.getApplicationById(existing.application_id), isNew: false };
    }

    const application = {
      application_id: uuidv4(),
      student_id: studentId,
      scholarship_id: scholarshipId,
      assigned_verifier_user_id: null,
      status: 'DRAFT',
      submission_notes: submissionNotes,
      submitted_at: null,
      decision_at: null,
      decision_by_user_id: null,
      decision_reason: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.data.applications.push(application);
    this.save();
    return { application: this.getApplicationById(application.application_id), isNew: true };
  }

  submitApplication(applicationId, userId, submissionNotes = '') {
    const app = this.data.applications.find((a) => a.application_id === applicationId);
    if (!app) throw new Error('Application not found');
    if (app.status !== 'DRAFT') throw new Error(`Cannot submit application in status: ${app.status}`);

    const oldStatus = app.status;
    app.status = 'SUBMITTED';
    app.submitted_at = new Date().toISOString();
    app.updated_at = new Date().toISOString();
    if (submissionNotes) app.submission_notes = submissionNotes;

    this.recordStatusChange(applicationId, userId, oldStatus, 'SUBMITTED', 'Student submitted application');
    this.recordAudit(userId, 'APPLICATION_SUBMITTED', 'Application', applicationId, 'SUCCESS');

    this.save();
    return this.getApplicationById(applicationId);
  }

  transitionApplicationStatus(applicationId, userId, newStatus, reason = '', extraFields = {}) {
    const app = this.data.applications.find((a) => a.application_id === applicationId);
    if (!app) throw new Error('Application not found');

    const oldStatus = app.status;
    app.status = newStatus;
    app.updated_at = new Date().toISOString();
    Object.assign(app, extraFields);

    this.recordStatusChange(applicationId, userId, oldStatus, newStatus, reason);
    this.recordAudit(userId, `STATUS_TRANSITION_${newStatus}`, 'Application', applicationId, 'SUCCESS', { reason });

    this.save();
    return this.getApplicationById(applicationId);
  }

  recordStatusChange(applicationId, userId, oldStatus, newStatus, reason = '', correlationId = null) {
    this.data.applicationStatusHistory.push({
      history_id: uuidv4(),
      application_id: applicationId,
      changed_by_user_id: userId,
      old_status: oldStatus,
      new_status: newStatus,
      change_reason: reason,
      correlation_id: correlationId || uuidv4(),
      changed_at: new Date().toISOString(),
    });
  }

  // --- Documents ---
  addDocument(docData) {
    const doc = {
      document_id: uuidv4(),
      application_id: docData.application_id,
      uploaded_by_user_id: docData.uploaded_by_user_id,
      document_type: docData.document_type,
      blob_name: docData.blob_name,
      original_file_name: docData.original_file_name,
      content_type: docData.content_type,
      size_bytes: docData.size_bytes,
      sha256_hash: docData.sha256_hash || null,
      verification_status: 'PENDING',
      verification_comments: null,
      uploaded_at: new Date().toISOString(),
    };
    this.data.documents.push(doc);
    this.save();
    return doc;
  }

  findDocumentById(documentId) {
    return this.data.documents.find((d) => d.document_id === documentId);
  }

  updateDocument(documentId, updates) {
    const doc = this.findDocumentById(documentId);
    if (!doc) return null;
    Object.assign(doc, updates);
    this.save();
    return doc;
  }

  // --- Verifications ---
  addVerification(verData) {
    const verification = {
      verification_id: uuidv4(),
      application_id: verData.application_id,
      verifier_user_id: verData.verifier_user_id,
      action: verData.action,
      comments: verData.comments,
      action_at: new Date().toISOString(),
    };
    this.data.verifications.push(verification);
    this.save();
    return verification;
  }

  // --- Audit Logs ---
  recordAudit(actorUserId, action, entityType, entityId, outcome = 'SUCCESS', metadata = {}) {
    this.data.auditLogs.unshift({
      audit_id: this.data.auditLogs.length + 1,
      actor_user_id: actorUserId,
      action,
      entity_type: entityType,
      entity_id: String(entityId),
      outcome,
      correlation_id: uuidv4(),
      event_time: new Date().toISOString(),
      metadata_json: JSON.stringify(metadata),
    });
    this.save();
  }

  getAuditLogs(limit = 100) {
    return this.data.auditLogs.slice(0, limit).map((log) => {
      const user = log.actor_user_id ? this.data.users.find((u) => u.user_id === log.actor_user_id) : null;
      return {
        ...log,
        actor_name: user ? user.full_name : 'System',
        actor_email: user ? user.email : 'system@internal',
      };
    });
  }

  // --- Analytics Aggregates ---
  getAnalyticsOverview() {
    const apps = this.data.applications;
    const scholarships = this.data.scholarships;

    const totalApplications = apps.length;
    const totalApproved = apps.filter((a) => a.status === 'APPROVED').length;
    const totalRejected = apps.filter((a) => a.status === 'REJECTED').length;
    const totalPending = apps.filter((a) => !['APPROVED', 'REJECTED', 'DRAFT'].includes(a.status)).length;
    const totalDraft = apps.filter((a) => a.status === 'DRAFT').length;

    // Disbursed amount
    let totalDisbursed = 0;
    apps
      .filter((a) => a.status === 'APPROVED')
      .forEach((a) => {
        const s = scholarships.find((item) => item.scholarship_id === a.scholarship_id);
        if (s) totalDisbursed += Number(s.award_amount || 0);
      });

    return {
      totalApplications,
      totalApproved,
      totalRejected,
      totalPending,
      totalDraft,
      totalScholarships: scholarships.length,
      publishedScholarships: scholarships.filter((s) => s.status === 'PUBLISHED').length,
      totalDisbursed,
      currency: 'INR',
    };
  }

  getAnalyticsByDepartment() {
    const deptMap = {};
    this.data.applications.forEach((a) => {
      const st = this.data.students.find((s) => s.student_id === a.student_id);
      const dept = st?.department || 'Unspecified';
      if (!deptMap[dept]) {
        deptMap[dept] = { department: dept, total: 0, approved: 0, rejected: 0, pending: 0 };
      }
      deptMap[dept].total += 1;
      if (a.status === 'APPROVED') deptMap[dept].approved += 1;
      else if (a.status === 'REJECTED') deptMap[dept].rejected += 1;
      else if (a.status !== 'DRAFT') deptMap[dept].pending += 1;
    });

    return Object.values(deptMap);
  }

  getAnalyticsByScholarship() {
    return this.data.scholarships.map((s) => {
      const apps = this.data.applications.filter((a) => a.scholarship_id === s.scholarship_id);
      const approved = apps.filter((a) => a.status === 'APPROVED').length;
      return {
        scholarship_id: s.scholarship_id,
        title: s.title,
        provider: s.provider,
        award_amount: s.award_amount,
        status: s.status,
        total_applications: apps.length,
        approved_count: approved,
        total_disbursed: approved * Number(s.award_amount || 0),
      };
    });
  }
}

// Export singleton instance
const demoDb = new DemoDatabase();
module.exports = demoDb;
