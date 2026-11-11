const multer = require('multer');
const path = require('path');
const { db } = require('../../database');
const storageAdapter = require('./storageAdapter');

// Multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedExts = ['.pdf', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowedExts.includes(ext)) {
      return cb(new Error('Invalid file type. Allowed formats: PDF, PNG, JPG, JPEG.'));
    }
    cb(null, true);
  },
});

async function uploadFile(req, res, next) {
  try {
    const { id: applicationId } = req.params;
    const { document_type } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        error: { code: 'FILE_REQUIRED', message: 'Please select a file to upload.' },
      });
    }

    if (!document_type) {
      return res.status(400).json({
        success: false,
        error: { code: 'DOCUMENT_TYPE_REQUIRED', message: 'Document type is required (e.g., Income Certificate, Transcript).' },
      });
    }

    const app = db.getApplicationById(applicationId);
    if (!app) {
      return res.status(404).json({ success: false, error: { message: 'Application not found.' } });
    }

    const student = db.findStudentByUserId(req.user.userId);
    if (!student || app.student_id !== student.student_id) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You can only upload documents to your own applications.' },
      });
    }

    // Save bytes using storage adapter
    const uploadResult = await storageAdapter.uploadDocument({
      buffer: file.buffer,
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    });

    // Record document metadata in database
    const doc = db.addDocument({
      application_id: applicationId,
      uploaded_by_user_id: req.user.userId,
      document_type,
      blob_name: uploadResult.blobName,
      original_file_name: path.basename(file.originalname),
      content_type: file.mimetype,
      size_bytes: file.size,
    });

    db.recordAudit(req.user.userId, 'DOCUMENT_UPLOADED', 'Document', doc.document_id, 'SUCCESS', {
      application_id: applicationId,
      document_type,
    });

    return res.status(201).json({
      success: true,
      data: doc,
      message: 'Document uploaded successfully.',
    });
  } catch (err) {
    next(err);
  }
}

async function downloadFile(req, res, next) {
  try {
    const { documentId } = req.params;
    const doc = db.findDocumentById(documentId);

    if (!doc) {
      return res.status(404).json({ success: false, error: { message: 'Document not found.' } });
    }

    const app = db.getApplicationById(doc.application_id);
    if (!app) {
      return res.status(404).json({ success: false, error: { message: 'Parent application not found.' } });
    }

    const { role, userId } = req.user;

    // Authorization check
    if (role === 'STUDENT') {
      const student = db.findStudentByUserId(userId);
      if (!student || app.student_id !== student.student_id) {
        return res.status(403).json({ success: false, error: { message: 'Access denied.' } });
      }
    } else if (role === 'VERIFIER') {
      if (app.assigned_verifier_user_id !== userId) {
        return res.status(403).json({ success: false, error: { message: 'Access denied to unassigned case document.' } });
      }
    }

    const stream = await storageAdapter.getDocumentStream(doc.blob_name);

    res.setHeader('Content-Type', doc.content_type || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${doc.original_file_name}"`);
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadMiddleware: upload.single('file'),
  uploadFile,
  downloadFile,
};
