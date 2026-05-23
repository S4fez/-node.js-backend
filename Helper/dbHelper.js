// dbHelper.js
const pool = require('./db'); // import pool 

const db = {
  // ดึงข้อมูลทั้งหมด
  async toList(query, params = []) {
    const result = await pool.query(query, params);
    return result.rows;
  },

  // ดึงแถวเดียว
  async firstOrDefault(query, params = []) {
    const result = await pool.query(query + ' LIMIT 1', params);
    return result.rows[0] || null;
  },

  // ใช้ execute สำหรับคำสั่ง INSERT/UPDATE/DELETE
  async execute(query, params = []) {
    const result = await pool.query(query, params);
    return result.rowCount;
  }
};

module.exports = db;
