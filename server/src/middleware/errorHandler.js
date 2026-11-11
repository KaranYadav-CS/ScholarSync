const config = require('../config');

/**
 * Centralized error handler. Prevents leaking stack traces or credentials to clients.
 */
function errorHandler(err, req, res, next) {
  const correlationId = req.headers['x-correlation-id'] || 'req-' + Date.now();
  console.error(`[Error] [${correlationId}]`, err);

  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred.',
    },
    meta: {
      correlationId,
      timestamp: new Date().toISOString(),
    },
  };

  if (config.env === 'development' && statusCode === 500) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

module.exports = errorHandler;
