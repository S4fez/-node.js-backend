require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./modules/auth/auth.routes');
const productRoutes = require('./modules/product/product.routes');
const userRoutes = require('./modules/user/user.routes');
const authMiddleware = require('./middleware/auth.middleware');
const errorHandler = require('./middleware/errorHandler.middleware');

const app = express();

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// public routes — no auth required
app.use('/api', authRoutes);

// protected routes — auth required
app.use('/api', authMiddleware, productRoutes);
app.use('/api', authMiddleware, userRoutes);

app.use(errorHandler);

module.exports = app;
