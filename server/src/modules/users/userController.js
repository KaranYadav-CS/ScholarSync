const { db } = require('../../database');

async function listUsers(req, res, next) {
  try {
    const users = db.getAllUsers();
    return res.json({
      success: true,
      data: users,
    });
  } catch (err) {
    next(err);
  }
}

async function updateRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ['STUDENT', 'VERIFIER', 'SCHOLARSHIP_ADMIN', 'SYSTEM_ADMIN'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_ROLE', message: `Role must be one of: ${allowedRoles.join(', ')}` },
      });
    }

    const user = db.findUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found.' } });
    }

    const previousRole = user.role;
    db.updateUser(id, { role });

    db.recordAudit(req.user.userId, 'USER_ROLE_CHANGED', 'User', id, 'SUCCESS', {
      previousRole,
      newRole: role,
    });

    return res.json({
      success: true,
      data: { user_id: id, role, message: `User role updated to ${role}.` },
    });
  } catch (err) {
    next(err);
  }
}

async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { account_status } = req.body;

    if (!['ACTIVE', 'DISABLED'].includes(account_status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_STATUS', message: 'account_status must be ACTIVE or DISABLED.' },
      });
    }

    const user = db.findUserById(id);
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found.' } });
    }

    db.updateUser(id, { account_status });
    db.recordAudit(req.user.userId, 'USER_STATUS_CHANGED', 'User', id, 'SUCCESS', {
      account_status,
    });

    return res.json({
      success: true,
      data: { user_id: id, account_status, message: `Account status updated to ${account_status}.` },
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listUsers,
  updateRole,
  updateStatus,
};
