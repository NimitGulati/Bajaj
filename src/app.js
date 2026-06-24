'use strict';

const express = require('express');
const cors = require('cors');
const bfhlRoutes = require('./routes/bfhlRoutes');
const { errorHandler } = require('./middleware/errorHandler');
const { bfhlLimiter } = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

const app = express();

// ── Global middleware ──────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, _res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/bfhl', bfhlLimiter, bfhlRoutes);

// 404 catch-all
app.use((req, res) => {
  res.status(404).json({ is_success: false, message: 'Route not found.' });
});

// ── Global error handler (must be last) ────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
