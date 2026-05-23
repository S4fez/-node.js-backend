const authService = require('./auth.service');
const { success, created } = require('../../helpers/response.helper');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    success(res, result);
  } catch (err) {
    next(err);
  }
};

const register = async (req, res, next) => {
  try {
    const { usernamehash, passwordhash, email } = req.body;
    const result = await authService.register(usernamehash, passwordhash, email);
    created(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = { login, register };
