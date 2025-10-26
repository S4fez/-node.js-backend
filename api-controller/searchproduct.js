// routes.js
require('dotenv').config();

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const dbConfig = require('../enviroment/dbconfig');
const bcrypt  = require('bcrypt');
const jwt = require('jsonwebtoken');

const pool = new Pool(dbConfig);

router.post("/search", async (req, res) => {
  const { name } = req.body; // /search?name=iphone

  if (!name) {
    return res.status(400).json({ message: "กรุณาระบุชื่อรุ่น (name)" });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM productdetail AS PD WHERE PD.nameproduct ILIKE '%' || $1 || '%'`,
      [name]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error" });
  }
});

module.exports = router;