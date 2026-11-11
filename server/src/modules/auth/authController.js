const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config');
const { db } = require('../../database');

function generateToken(userId, role) {
  return jwt.sign({ userId, role }, config.jwtSecret, {
    expiresIn: config.tokenExpiration,
  });
}

function setAuthCookie(res, token) {
  res.cookie('scholarsync_token', token, {
    httpOnly: true,
    secure: config.env === 'production',
    sameSite: config.env === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

/**
 * Public Student Registration
 * STRICT: Role is hardcoded to 'STUDENT'. Body role is ignored.
 */
async function register(req, res, next) {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Full name, email, and password are required.' },
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: { code: 'WEAK_PASSWORD', message: 'Password must be at least 8 characters long.' },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = db.findUserByEmail(normalizedEmail);
    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'EMAIL_EXISTS', message: 'An account with this email already exists.' },
      });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Explicitly enforce role 'STUDENT'
    const newUser = db.createUser({
      full_name: full_name.trim(),
      email: normalizedEmail,
      password_hash,
      role: 'STUDENT',
      account_status: 'ACTIVE',
    });

    // Create initial blank student profile
    const student = db.upsertStudent(newUser.user_id, {
      program: 'B.Tech',
      department: '',
      study_year: 1,
      cgpa: 0,
      annual_family_income: 0,
    });

    db.recordAudit(newUser.user_id, 'USER_REGISTERED', 'User', newUser.user_id, 'SUCCESS', {
      role: 'STUDENT',
    });

    const token = generateToken(newUser.user_id, 'STUDENT');
    setAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      data: {
        user: {
          user_id: newUser.user_id,
          full_name: newUser.full_name,
          email: newUser.email,
          role: newUser.role,
        },
        student,
        token,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * User Login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Email and password are required.' },
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = db.findUserByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      });
    }

    if (user.account_status !== 'ACTIVE') {
      return res.status(403).json({
        success: false,
        error: { code: 'ACCOUNT_DISABLED', message: 'This account has been deactivated.' },
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      db.recordAudit(user.user_id, 'LOGIN_FAILED', 'User', user.user_id, 'FAILURE', {
        reason: 'Password mismatch',
      });
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' },
      });
    }

    db.updateUser(user.user_id, { last_login_at: new Date().toISOString() });
    db.recordAudit(user.user_id, 'LOGIN_SUCCESS', 'User', user.user_id, 'SUCCESS', {
      role: user.role,
    });

    const token = generateToken(user.user_id, user.role);
    setAuthCookie(res, token);

    const student = user.role === 'STUDENT' ? db.findStudentByUserId(user.user_id) : null;

    return res.json({
      success: true,
      data: {
        user: {
          user_id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
        },
        student,
        token,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Get current session user
 */
async function me(req, res) {
  const user = db.findUserById(req.user.userId);
  if (!user) {
    return res.status(404).json({ success: false, error: { message: 'User not found' } });
  }

  const student = user.role === 'STUDENT' ? db.findStudentByUserId(user.user_id) : null;

  return res.json({
    success: true,
    data: {
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
      student,
    },
  });
}

/**
 * Logout
 */
async function logout(req, res) {
  res.clearCookie('scholarsync_token', { path: '/' });
  return res.json({
    success: true,
    data: { message: 'Logged out successfully.' },
  });
}

module.exports = {
  register,
  login,
  me,
  logout,
};
