// app.js
const { Pool } = require('pg');
const dbConfig = require('./dbconfig'); // นำเข้าการตั้งค่าฐานข้อมูล
const cors = require('cors');

const express = require('express');
const routes = require('./routes');
const searchproduct = require('./searchproduct');

const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();


app.use(express.json());
app.use(cors());
// Use the routes defined in the routes module

// Start the server
// Start the server
const PORT = 3000;

// ตั้งค่าการเชื่อมต่อฐานข้อมูล
const pool = new Pool({
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
  port: process.env.port
});

// เชื่อมต่อฐานข้อมูลก่อนเริ่มเซิร์ฟเวอร์
pool.connect()
  .then(client => {
    console.log(" Connected to PostgreSQL");

    client.release();

    app.listen(PORT, () => {
      console.log(` Server is running on port ${PORT}`);
    });

  })
  .catch(err => {
    console.error("Database connection error:", err);
    process.exit(1); 
  });
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    // console.log(req.path)
    if (req.path === '/login' || req.path === '/register') {
        return next();
    }
    // Get the token from the Authorization header
    if (!authHeader) {
        return res.status(403).json({ message: 'No token provided.' });
    }
    const token = req.headers.authorization.split(' ')[1];
    const secret = process.env.JWT_SECRET
    // console.log('token',token)
    if (!token) {
      return res.status(403).send({ message: 'No token provided.' });
    }
  
    // Verify the token
    jwt.verify(token, secret, (err, decoded) => {
        console.log(err)
      if (err) {
        // Handle specific error cases
        if (err.name === 'TokenExpiredError') {
          return res.status(401).send({ message: 'Token has expired.' });
        } 
        else {
          return res.status(401).send({ message: 'Unauthorized: Invalid token.' });
        }
      }
  
      // Save decoded info to request object (optional, e.g., req.user)
      req.user = decoded;
      next(); // Proceed to the next middleware or route handler
    });
  }

app.use('/api',verifyToken, routes,);
app.use('/api', searchproduct);