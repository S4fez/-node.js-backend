const userService = require('./user.service');
const { success } = require('../../helpers/response.helper');

const getUserProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserProfile(req.body.userId);
    success(res, user);
  } catch (err) {
    next(err);
  }
};

const uploadProfileImage = async (req, res, next) => {
  try {
    const { account_id } = req.body;
    const result = await userService.updateProfileImage(account_id, req.file.path);
    success(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = { getUserProfile, uploadProfileImage };
