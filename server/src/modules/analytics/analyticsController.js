const { db } = require('../../database');

async function getOverview(req, res, next) {
  try {
    const overview = db.getAnalyticsOverview();
    return res.json({
      success: true,
      data: overview,
    });
  } catch (err) {
    next(err);
  }
}

async function getByDepartment(req, res, next) {
  try {
    const deptMetrics = db.getAnalyticsByDepartment();
    return res.json({
      success: true,
      data: deptMetrics,
    });
  } catch (err) {
    next(err);
  }
}

async function getByScholarship(req, res, next) {
  try {
    const scholarshipMetrics = db.getAnalyticsByScholarship();
    return res.json({
      success: true,
      data: scholarshipMetrics,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getOverview,
  getByDepartment,
  getByScholarship,
};
