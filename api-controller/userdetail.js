// routes.js
require('dotenv').config();
const UserProfile = require('../model/user.model.js');

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const dbConfig = require('../enviroment/dbconfig.js');
const bcrypt  = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const pool = new Pool(dbConfig);


// ตั้งค่า multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // โฟลเดอร์เก็บไฟล์
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // ตั้งชื่อใหม่กันซ้ำ
  }
});

const upload = multer({ storage });

// POST /api/upload
router.post('/uploads', upload.single('image'), async (req, res) => {
  try {
    const { account_id } = req.body;
    const imagePath = req.file.path; // ได้ path เช่น uploads/17299239012.png

    // บันทึก path ลง DB
    await pool.query(
      'UPDATE account_detail SET user_img = $1 WHERE account_id = $2',
      [imagePath, account_id]
    );

    res.json({
      message: 'Upload success',
      imageUrl: `http://localhost:3000/${imagePath}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Upload failed' });
  }
});

router.post('/userprofile', async (req, res) => {
    const userId = req.body.userId; // สมมติว่า userId ถูกตั้งค่าใน middleware การตรวจสอบโทเค็น
    // console.log('userId',userId);
    try {
        const result = await pool.query(
            'SELECT address,account_id,name,surname,user_age,user_img,user_birthdate FROM account_detail WHERE account_id = $1',
            [userId]
        );  
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = new UserProfile(result.rows[0]);   
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


module.exports = router;