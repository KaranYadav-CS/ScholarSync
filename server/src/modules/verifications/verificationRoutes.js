const express = require('express');
const router = express.Router();
const verificationController = require('./verificationController');
const { authenticate, requireRole } = require('../../middleware/auth');

router.use(authenticate);
router.use(requireRole('VERIFIER'));

router.post('/applications/:id/verifications', verificationController.recordVerification);
router.post('/applications/:id/clarification-requests', verificationController.requestClarification);
router.post('/applications/:id/recommendation', verificationController.submitRecommendation);

module.exports = router;
