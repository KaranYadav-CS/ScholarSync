const { db } = require('../../database');
const { evaluateEligibility } = require('../eligibility/eligibilityEngine');

async function listScholarships(req, res, next) {
  try {
    const { search, category, status } = req.query;

    // Visitors & students only see PUBLISHED unless user is admin
    let queryStatus = 'PUBLISHED';
    if (req.user && ['SCHOLARSHIP_ADMIN', 'SYSTEM_ADMIN'].includes(req.user.role)) {
      queryStatus = status || null;
    }

    let scholarships = db.getScholarships({ status: queryStatus, search });

    if (category) {
      scholarships = scholarships.filter((s) => s.category.toLowerCase() === category.toLowerCase());
    }

    // Attach criteria counts to each scholarship
    const enriched = scholarships.map((s) => {
      const full = db.getScholarshipById(s.scholarship_id);
      return {
        ...s,
        criteriaCount: full?.criteria?.length || 0,
      };
    });

    return res.json({
      success: true,
      data: enriched,
    });
  } catch (err) {
    next(err);
  }
}

async function getScholarshipById(req, res, next) {
  try {
    const { id } = req.params;
    const scholarship = db.getScholarshipById(id);

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Scholarship not found.' },
      });
    }

    // If not published, only admins can view
    if (scholarship.status !== 'PUBLISHED') {
      if (!req.user || !['SCHOLARSHIP_ADMIN', 'SYSTEM_ADMIN'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'This scholarship is not currently available.' },
        });
      }
    }

    return res.json({
      success: true,
      data: scholarship,
    });
  } catch (err) {
    next(err);
  }
}

async function checkEligibility(req, res, next) {
  try {
    const { id } = req.params;
    const scholarship = db.getScholarshipById(id);

    if (!scholarship) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Scholarship not found.' },
      });
    }

    const studentProfile = db.findStudentByUserId(req.user.userId);
    const evaluation = evaluateEligibility(scholarship.criteria, studentProfile);

    return res.json({
      success: true,
      data: {
        scholarship_id: scholarship.scholarship_id,
        scholarship_title: scholarship.title,
        ...evaluation,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function createScholarship(req, res, next) {
  try {
    const {
      title,
      provider,
      description,
      award_amount,
      currency,
      category,
      application_start_at,
      deadline_at,
      criteria,
    } = req.body;

    if (!title || !provider || !description || !deadline_at) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Title, provider, description, and deadline are required.' },
      });
    }

    const scholarship = db.createScholarship(
      {
        title,
        provider,
        description,
        award_amount,
        currency,
        category,
        application_start_at,
        deadline_at,
        status: 'DRAFT',
      },
      criteria || [],
      req.user.userId
    );

    db.recordAudit(req.user.userId, 'SCHOLARSHIP_CREATED', 'Scholarship', scholarship.scholarship_id, 'SUCCESS', {
      title,
    });

    return res.status(201).json({
      success: true,
      data: scholarship,
    });
  } catch (err) {
    next(err);
  }
}

async function updateScholarship(req, res, next) {
  try {
    const { id } = req.params;
    const {
      title,
      provider,
      description,
      award_amount,
      currency,
      category,
      application_start_at,
      deadline_at,
      status,
      criteria,
    } = req.body;

    const existing = db.getScholarshipById(id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Scholarship not found.' },
      });
    }

    const updated = db.updateScholarship(
      id,
      {
        title,
        provider,
        description,
        award_amount,
        currency,
        category,
        application_start_at,
        deadline_at,
        status,
      },
      criteria
    );

    db.recordAudit(req.user.userId, 'SCHOLARSHIP_UPDATED', 'Scholarship', id, 'SUCCESS');

    return res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

async function publishScholarship(req, res, next) {
  try {
    const { id } = req.params;
    const scholarship = db.getScholarshipById(id);
    if (!scholarship) {
      return res.status(404).json({ success: false, error: { message: 'Scholarship not found.' } });
    }

    if (new Date(scholarship.deadline_at) <= new Date()) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_DEADLINE', message: 'Cannot publish a scholarship with a deadline in the past.' },
      });
    }

    const updated = db.updateScholarship(id, { status: 'PUBLISHED' });
    db.recordAudit(req.user.userId, 'SCHOLARSHIP_PUBLISHED', 'Scholarship', id, 'SUCCESS');

    return res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

async function closeScholarship(req, res, next) {
  try {
    const { id } = req.params;
    const updated = db.updateScholarship(id, { status: 'CLOSED' });
    db.recordAudit(req.user.userId, 'SCHOLARSHIP_CLOSED', 'Scholarship', id, 'SUCCESS');

    return res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listScholarships,
  getScholarshipById,
  checkEligibility,
  createScholarship,
  updateScholarship,
  publishScholarship,
  closeScholarship,
};
