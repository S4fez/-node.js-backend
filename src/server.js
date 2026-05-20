const app = require('./app');
const pool = require('./database/connection');
const logger = require('./shared/logger/logger');

const PORT = process.env.PORT || 3000;

pool.connect()
  .then((client) => {
    client.release();
    logger.info('Connected to PostgreSQL');

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Database connection error:', err);
    process.exit(1);
  });
