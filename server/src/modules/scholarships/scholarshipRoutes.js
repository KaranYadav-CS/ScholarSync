const express = require('express');
const router = express.Router();
const scholarshipController = require('./scholarshipController');
const { authenticate, requireRole } = require('../../middleware/auth');

// Optional auth for public listings
router.get('/', (req, res, next) => {
  // Try authenticating if token is present, but allow through if not
  const token = req.cookies?.scholarsync_token;
  if (token) {
    authenticate(req, res, () => scholarshipController.listScholarships(req, res, next));
  } else {
    scholarshipController.listScholarships(req, res, next);
  }
});

router.get('/:id', (req, res, next) => {
  const token = req.cookies?.scholarsync_token;
  if (token) {
    authenticate(req, res, () => scholarshipController.getScholarshipById(req, res, next));
  } else {
    scholarshipController.getScholarshipById(req, res, next);
  }
});

router.get('/:id/eligibility', authenticate, requireRole('STUDENT'), scholarshipController.checkEligibility);

// Admin-only management
router.post('/', authenticate, requireRole('SCHOLARSHIP_ADMIN'), scholarshipController.createScholarship);
router.put('/:id', authenticate, requireRole('SCHOLARSHIP_ADMIN'), scholarshipController.updateScholarship);
router.post('/:id/publish', authenticate, requireRole('SCHOLARSHIP_ADMIN'), scholarshipController.publishScholarship);
router.post('/:id/close', authenticate, requireRole('SCHOLARSHIP_ADMIN'), scholarshipController.closeScholarship);

module.exports = router;
