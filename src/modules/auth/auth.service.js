const pool = require('../../database/connection');
const { hashPassword, comparePassword } = require('../../helpers/bcrypt.helper');
const { signToken } = require('../../helpers/jwt.helper');
const { AppError } = require('../../common/errors');

const login = async (username, password) => {
  const result = await pool.query(
    'SELECT * FROM account WHERE username_hash = $1',
    [username]
  );

  if (result.rowCount === 0) {
    throw new AppError('Invalid username or password', 401);
  }

  const account = result.rows[0];
  const isMatch = await comparePassword(password, account.password_hash);

  if (!isMatch) {
    throw new AppError('Invalid username or password', 401);
  }

  const token = signToken({
    userId: account.user_id,
    username: account.username_hash,
    sys_role: account.sys_role,
  });

  return {
    token,
    userId: account.account_id,
    email: account.email,
    sys_role: account.sys_role,
  };
};

const register = async (usernamehash, passwordhash, email) => {
  const existing = await pool.query(
    'SELECT * FROM account WHERE username_hash = $1',
    [usernamehash]
  );

  if (existing.rows.length > 0) {
    throw new AppError('This username has already been used', 400);
  }

  const hashedPassword = await hashPassword(passwordhash);
  const result = await pool.query(
    'INSERT INTO account (username_hash, password_hash, email) VALUES ($1, $2, $3)',
    [usernamehash, hashedPassword, email]
  );

  if (result.rowCount === 0) {
    throw new AppError('Failed to register user', 500);
  }

  return { message: 'User registered successfully' };
};

module.exports = { login, register };
