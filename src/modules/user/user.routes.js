const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const upload = require('../../middleware/upload.middleware');

router.post('/userprofile', userController.getUserProfile);
router.post('/uploads', upload.single('image'), userController.uploadProfileImage);

module.exports = router;
