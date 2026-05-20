const pool = require('../../database/connection');
const UserProfile = require('./user.model');
const { AppError } = require('../../common/errors');

const getUserProfile = async (userId) => {
  const result = await pool.query(
    'SELECT address, account_id, name, surname, user_age, user_img, user_birthdate FROM account_detail WHERE account_id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    throw new AppError('User not found', 404);
  }

  return new UserProfile(result.rows[0]);
};

const updateProfileImage = async (accountId, imagePath) => {
  await pool.query(
    'UPDATE account_detail SET user_img = $1 WHERE account_id = $2',
    [imagePath, accountId]
  );

  return {
    message: 'Upload success',
    imageUrl: `http://localhost:3000/${imagePath.replace(/\\/g, '/')}`,
  };
};

module.exports = { getUserProfile, updateProfileImage };
