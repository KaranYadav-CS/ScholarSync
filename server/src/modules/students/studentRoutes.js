const express = require('express');
const router = express.Router();
const studentController = require('./studentController');
const { authenticate, requireRole } = require('../../middleware/auth');

router.use(authenticate);
router.use(requireRole('STUDENT'));

router.get('/me', studentController.getProfile);
router.put('/me', studentController.updateProfile);

module.exports = router;
