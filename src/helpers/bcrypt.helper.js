const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const hashPassword = (plainText) => bcrypt.hash(plainText, SALT_ROUNDS);

const comparePassword = (plainText, hash) => bcrypt.compare(plainText, hash);

module.exports = { hashPassword, comparePassword };
