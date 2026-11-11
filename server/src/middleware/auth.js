const jwt = require('jsonwebtoken');
const config = require('../config');
const { db } = require('../database');

/**
 * Authenticate incoming request via signed cookie or Bearer header
 */
function authenticate(req, res, next) {
  let token = req.cookies?.scholarsync_token;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required. Please sign in.' },
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    const user = db.findUserById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User account no longer exists.' },
      });
    }

    if (user.account_status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_DISABLED', message: 'Your account is deactivated. Contact an administrator.' },
      });
    }

    req.user = {
      userId: user.user_id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
    };

    if (user.role === 'STUDENT') {
      const student = db.findStudentByUserId(user.user_id);
      req.student = student || null;
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Session expired or invalid. Please sign in again.' },
    });
  }
}

/**
 * Require one of the specified roles
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required.' },
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      db.recordAudit(
        req.user.userId,
        'ACCESS_DENIED_ROLE',
        'Endpoint',
        req.originalUrl,
        'FAILURE',
        { required: allowedRoles, actual: req.user.role }
      );

      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: `Access denied. Requires one of: ${allowedRoles.join(', ')}`,
        },
      });
    }

    next();
  };
}

module.exports = {
  authenticate,
  requireRole,
};
