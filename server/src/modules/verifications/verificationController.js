const { db } = require('../../database');

async function recordVerification(req, res, next) {
  try {
    const { id: applicationId } = req.params;
    const { action, comments } = req.body;

    const allowedActions = ['REVIEW_STARTED', 'DOCUMENTS_VERIFIED'];
    if (!allowedActions.includes(action)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ACTION', message: `Action must be one of: ${allowedActions.join(', ')}` },
      });
    }

    const app = db.getApplicationById(applicationId);
    if (!app) {
      return res.status(404).json({ success: false, error: { message: 'Application not found.' } });
    }

    if (app.assigned_verifier_user_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You are not assigned to verify this application.' },
      });
    }

    const verification = db.addVerification({
      application_id: applicationId,
      verifier_user_id: req.user.userId,
      action,
      comments: comments || 'Verification check performed.',
    });

    db.recordAudit(req.user.userId, `VERIFICATION_${action}`, 'Application', applicationId, 'SUCCESS', {
      comments,
    });

    return res.status(201).json({
      success: true,
      data: verification,
      message: 'Verification recorded successfully.',
    });
  } catch (err) {
    next(err);
  }
}

async function requestClarification(req, res, next) {
  try {
    const { id: applicationId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: { code: 'REASON_REQUIRED', message: 'Clarification reason is required.' },
      });
    }

    const app = db.getApplicationById(applicationId);
    if (!app) {
      return res.status(404).json({ success: false, error: { message: 'Application not found.' } });
    }

    if (app.assigned_verifier_user_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You are not assigned to this application.' },
      });
    }

    db.addVerification({
      application_id: applicationId,
      verifier_user_id: req.user.userId,
      action: 'CLARIFICATION_REQUESTED',
      comments: reason.trim(),
    });

    const updated = db.transitionApplicationStatus(
      applicationId,
      req.user.userId,
      'CLARIFICATION_REQUESTED',
      reason.trim()
    );

    return res.json({
      success: true,
      data: updated,
      message: 'Clarification requested from student.',
    });
  } catch (err) {
    next(err);
  }
}

async function submitRecommendation(req, res, next) {
  try {
    const { id: applicationId } = req.params;
    const { recommendation, comments } = req.body;

    const allowedRecommendations = ['RECOMMEND_APPROVAL', 'RECOMMEND_REJECTION'];
    if (!allowedRecommendations.includes(recommendation)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_RECOMMENDATION',
          message: 'Recommendation must be RECOMMEND_APPROVAL or RECOMMEND_REJECTION.',
        },
      });
    }

    const app = db.getApplicationById(applicationId);
    if (!app) {
      return res.status(404).json({ success: false, error: { message: 'Application not found.' } });
    }

    if (app.assigned_verifier_user_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You are not assigned to this application.' },
      });
    }

    const newStatus =
      recommendation === 'RECOMMEND_APPROVAL'
        ? 'RECOMMENDED_FOR_APPROVAL'
        : 'RECOMMENDED_FOR_REJECTION';

    db.addVerification({
      application_id: applicationId,
      verifier_user_id: req.user.userId,
      action: recommendation,
      comments: comments || 'Recommendation recorded by faculty verifier.',
    });

    const updated = db.transitionApplicationStatus(
      applicationId,
      req.user.userId,
      newStatus,
      comments || `Verifier recorded recommendation: ${recommendation}`
    );

    return res.json({
      success: true,
      data: updated,
      message: `Recommendation submitted to Scholarship Admin queue.`,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  recordVerification,
  requestClarification,
  submitRecommendation,
};
