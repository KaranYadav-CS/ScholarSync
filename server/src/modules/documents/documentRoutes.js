const express = require('express');
const router = express.Router();
const documentController = require('./documentController');
const { authenticate, requireRole } = require('../../middleware/auth');

router.use(authenticate);

// Student upload to application
router.post(
  '/applications/:id/documents',
  requireRole('STUDENT'),
  documentController.uploadMiddleware,
  documentController.uploadFile
);

// Authorized download
router.get('/:documentId/download', documentController.downloadFile);

module.exports = router;
