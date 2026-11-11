const { db } = require('../../database');

async function getProfile(req, res, next) {
  try {
    const student = db.findStudentByUserId(req.user.userId);
    if (!student) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Student profile not found.' },
      });
    }

    return res.json({
      success: true,
      data: student,
    });
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const {
      student_number,
      department,
      program,
      study_year,
      cgpa,
      annual_family_income,
      domicile_state,
      category,
    } = req.body;

    // Validations
    if (cgpa !== undefined && (Number(cgpa) < 0 || Number(cgpa) > 10)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_CGPA', message: 'CGPA must be between 0.00 and 10.00.' },
      });
    }

    if (study_year !== undefined && (Number(study_year) < 1 || Number(study_year) > 6)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_YEAR', message: 'Study year must be between 1 and 6.' },
      });
    }

    if (annual_family_income !== undefined && Number(annual_family_income) < 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INCOME', message: 'Annual family income cannot be negative.' },
      });
    }

    const updated = db.upsertStudent(req.user.userId, {
      student_number,
      department,
      program,
      study_year: study_year !== undefined ? Number(study_year) : undefined,
      cgpa: cgpa !== undefined ? Number(cgpa) : undefined,
      annual_family_income: annual_family_income !== undefined ? Number(annual_family_income) : undefined,
      domicile_state,
      category,
    });

    db.recordAudit(req.user.userId, 'PROFILE_UPDATED', 'Student', updated.student_id, 'SUCCESS');

    return res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProfile,
  updateProfile,
};
