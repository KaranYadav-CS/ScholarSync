const { db } = require('../../database');

async function getAuditLogs(req, res, next) {
  try {
    const { limit = 100 } = req.query;
    const logs = db.getAuditLogs(Number(limit));
    return res.json({
      success: true,
      data: logs,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAuditLogs,
};
