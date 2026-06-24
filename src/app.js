'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
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

// ── API Routes ─────────────────────────────────────────────────────────────────
app.use('/bfhl', bfhlLimiter, bfhlRoutes);

// ── Serve React frontend (production build) ────────────────────────────────────
const distPath = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(distPath));

// All non-API routes → React app
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// ── Global error handler (must be last) ────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
