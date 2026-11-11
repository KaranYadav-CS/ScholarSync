const express = require('express');
const router = express.Router();
const applicationController = require('./applicationController');
const { authenticate, requireRole } = require('../../middleware/auth');

router.use(authenticate);

router.get('/', applicationController.listApplications);
router.post('/', requireRole('STUDENT'), applicationController.createDraft);
router.get('/:id', applicationController.getApplicationById);
router.post('/:id/submit', requireRole('STUDENT'), applicationController.submitApplication);
router.post('/:id/clarification-response', requireRole('STUDENT'), applicationController.respondToClarification);
router.post('/:id/assign-verifier', requireRole('SCHOLARSHIP_ADMIN'), applicationController.assignVerifier);
router.post('/:id/decision', requireRole('SCHOLARSHIP_ADMIN'), applicationController.recordDecision);

module.exports = router;
