const express = require('express');
const router = express.Router();
const auditController = require('./auditController');
const { authenticate, requireRole } = require('../../middleware/auth');

router.use(authenticate);
router.use(requireRole('SCHOLARSHIP_ADMIN', 'SYSTEM_ADMIN'));

router.get('/', auditController.getAuditLogs);

module.exports = router;
