module.exports = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5555,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'example',
  database: process.env.DB_NAME || 'postgres',
};
