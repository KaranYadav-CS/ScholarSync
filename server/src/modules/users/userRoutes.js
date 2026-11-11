const express = require('express');
const router = express.Router();
const userController = require('./userController');
const { authenticate, requireRole } = require('../../middleware/auth');

router.use(authenticate);
router.use(requireRole('SYSTEM_ADMIN'));

router.get('/', userController.listUsers);
router.put('/:id/role', userController.updateRole);
router.put('/:id/status', userController.updateStatus);

module.exports = router;
