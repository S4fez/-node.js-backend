const logger = require('../shared/logger/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  logger.error(`${req.method} ${req.path} → ${statusCode}: ${message}`, err);

  res.status(statusCode).json({ message });
};

module.exports = errorHandler;
