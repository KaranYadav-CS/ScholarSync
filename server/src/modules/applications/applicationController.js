const { db } = require('../../database');
const { evaluateEligibility } = require('../eligibility/eligibilityEngine');

/**
 * List applications with strict role-based scope:
 * - STUDENT: Only own applications
 * - VERIFIER: Only assigned applications
 * - ADMIN: All applications
 */
async function listApplications(req, res, next) {
  try {
    const { status, student_id } = req.query;
    const { role, userId } = req.user;

    let filter = { status: status || null };

    if (role === 'STUDENT') {
      const student = db.findStudentByUserId(userId);
      if (!student) {
        return res.json({ success: true, data: [] });
      }
      filter.studentId = student.student_id;
    } else if (role === 'VERIFIER') {
      filter.verifierUserId = userId;
    } else if (['SCHOLARSHIP_ADMIN', 'SYSTEM_ADMIN'].includes(role)) {
      if (student_id) filter.studentId = student_id;
    }

    const applications = db.getApplications(filter);
    return res.json({
      success: true,
      data: applications,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get detailed application with object-level authorization check
 */
async function getApplicationById(req, res, next) {
  try {
    const { id } = req.params;
    const app = db.getApplicationById(id);

    if (!app) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Application not found.' },
      });
    }

    const { role, userId } = req.user;

    // Object-level authorization check
    if (role === 'STUDENT') {
      const student = db.findStudentByUserId(userId);
      if (!student || app.student_id !== student.student_id) {
        db.recordAudit(userId, 'ACCESS_DENIED_BOLA', 'Application', id, 'FAILURE', {
          reason: 'Student attempted to access foreign application',
        });
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Access denied. You do not own this application.' },
        });
      }
    } else if (role === 'VERIFIER') {
      if (app.assigned_verifier_user_id !== userId) {
        db.recordAudit(userId, 'ACCESS_DENIED_VERIFIER', 'Application', id, 'FAILURE', {
          reason: 'Verifier attempted to access unassigned application',
        });
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Access denied. You are not assigned to this application.' },
        });
      }
    }

    return res.json({
      success: true,
      data: app,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new application draft (Student only)
 */
async function createDraft(req, res, next) {
  try {
    const { scholarship_id, submission_notes } = req.body;

    if (!scholarship_id) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'scholarship_id is required.' },
      });
    }

    const student = db.findStudentByUserId(req.user.userId);
    if (!student) {
      return res.status(400).json({
        success: false,
        error: { code: 'NO_PROFILE', message: 'Please complete your student profile before applying.' },
      });
    }

    const scholarship = db.getScholarshipById(scholarship_id);
    if (!scholarship || scholarship.status !== 'PUBLISHED') {
      return res.status(400).json({
        success: false,
        error: { code: 'SCHOLARSHIP_NOT_OPEN', message: 'This scholarship is not accepting applications.' },
      });
    }

    if (new Date(scholarship.deadline_at) < new Date()) {
      return res.status(400).json({
        success: false,
        error: { code: 'DEADLINE_PASSED', message: 'The application deadline has passed.' },
      });
    }

    // Check duplicate
    const existing = db.data.applications.find(
      (a) => a.student_id === student.student_id && a.scholarship_id === scholarship_id
    );

    if (existing) {
      return res.json({
        success: true,
        data: db.getApplicationById(existing.application_id),
        message: 'Loaded existing application draft.',
      });
    }

    const { application } = db.createDraftApplication(student.student_id, scholarship_id, submission_notes || '');

    db.recordAudit(req.user.userId, 'APPLICATION_DRAFT_CREATED', 'Application', application.application_id, 'SUCCESS');

    return res.status(201).json({
      success: true,
      data: application,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Submit Application (Student only)
 * Performs strict server-side deadline, eligibility, and document checks
 */
async function submitApplication(req, res, next) {
  try {
    const { id } = req.params;
    const { submission_notes } = req.body;

    const app = db.getApplicationById(id);
    if (!app) {
      return res.status(404).json({ success: false, error: { message: 'Application not found.' } });
    }

    const student = db.findStudentByUserId(req.user.userId);
    if (!student || app.student_id !== student.student_id) {
      return res.status(403).json({ success: false, error: { message: 'Access denied.' } });
    }

    if (app.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: `Only DRAFT applications can be submitted. Current: ${app.status}` },
      });
    }

    const scholarship = db.getScholarshipById(app.scholarship_id);
    if (new Date(scholarship.deadline_at) < new Date()) {
      return res.status(400).json({
        success: false,
        error: { code: 'DEADLINE_PASSED', message: 'Application deadline has passed.' },
      });
    }

    // Re-verify eligibility on the server!
    const eligibility = evaluateEligibility(scholarship.criteria, student);
    if (!eligibility.is_eligible) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NOT_ELIGIBLE',
          message: 'Cannot submit application: You do not satisfy mandatory criteria.',
          details: eligibility,
        },
      });
    }

    // Check attached documents
    if (!app.documents || app.documents.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'DOCUMENTS_REQUIRED', message: 'Please upload at least one required supporting document before submitting.' },
      });
    }

    const submittedApp = db.submitApplication(id, req.user.userId, submission_notes);

    return res.json({
      success: true,
      data: submittedApp,
      message: 'Application successfully submitted!',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Assign verifier to application (Scholarship Admin only)
 */
async function assignVerifier(req, res, next) {
  try {
    const { id } = req.params;
    const { verifier_user_id } = req.body;

    if (!verifier_user_id) {
      return res.status(400).json({ success: false, error: { message: 'verifier_user_id is required.' } });
    }

    const verifier = db.findUserById(verifier_user_id);
    if (!verifier || verifier.role !== 'VERIFIER') {
      return res.status(400).json({ success: false, error: { message: 'Target user is not a valid Verifier.' } });
    }

    const app = db.getApplicationById(id);
    if (!app) {
      return res.status(404).json({ success: false, error: { message: 'Application not found.' } });
    }

    const updated = db.transitionApplicationStatus(
      id,
      req.user.userId,
      'UNDER_REVIEW',
      `Assigned to verifier ${verifier.full_name}`,
      { assigned_verifier_user_id: verifier_user_id }
    );

    return res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Student Clarification Response (Student only)
 */
async function respondToClarification(req, res, next) {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, error: { message: 'Response message is required.' } });
    }

    const app = db.getApplicationById(id);
    if (!app) {
      return res.status(404).json({ success: false, error: { message: 'Application not found.' } });
    }

    const student = db.findStudentByUserId(req.user.userId);
    if (!student || app.student_id !== student.student_id) {
      return res.status(403).json({ success: false, error: { message: 'Access denied.' } });
    }

    if (app.status !== 'CLARIFICATION_REQUESTED') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'Application is not awaiting clarification.' },
      });
    }

    const updated = db.transitionApplicationStatus(
      id,
      req.user.userId,
      'RESUBMITTED',
      `Student response: ${message}`
    );

    return res.json({
      success: true,
      data: updated,
      message: 'Clarification response submitted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Final Decision (Scholarship Admin only)
 * Mandatory reason required!
 */
async function recordDecision(req, res, next) {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_DECISION', message: 'Decision must be either APPROVED or REJECTED.' },
      });
    }

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: { code: 'REASON_REQUIRED', message: 'A comprehensive decision reason is mandatory.' },
      });
    }

    const app = db.getApplicationById(id);
    if (!app) {
      return res.status(404).json({ success: false, error: { message: 'Application not found.' } });
    }

    if (['APPROVED', 'REJECTED'].includes(app.status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'FINAL_DECISION_ALREADY_MADE', message: 'This application already has a final immutable decision.' },
      });
    }

    const updated = db.transitionApplicationStatus(
      id,
      req.user.userId,
      status,
      reason.trim(),
      {
        decision_at: new Date().toISOString(),
        decision_by_user_id: req.user.userId,
        decision_reason: reason.trim(),
      }
    );

    return res.json({
      success: true,
      data: updated,
      message: `Application marked as ${status}.`,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listApplications,
  getApplicationById,
  createDraft,
  submitApplication,
  assignVerifier,
  respondToClarification,
  recordDecision,
};
