const express = require('express');
const router = express.Router();
const analyticsController = require('./analyticsController');
const { authenticate, requireRole } = require('../../middleware/auth');

router.use(authenticate);
router.use(requireRole('SCHOLARSHIP_ADMIN', 'SYSTEM_ADMIN'));

router.get('/overview', analyticsController.getOverview);
router.get('/by-department', analyticsController.getByDepartment);
router.get('/by-scholarship', analyticsController.getByScholarship);

module.exports = router;
