'use strict';

const config = require('../config/env');

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const currentLevel = config.nodeEnv === 'production' ? LEVELS.warn : LEVELS.debug;

const fmt = (level, msg, meta) => {
  const ts = new Date().toISOString();
  const base = `[${ts}] [${level.toUpperCase()}] ${msg}`;
  return meta ? `${base} ${JSON.stringify(meta)}` : base;
};

const logger = {
  error: (msg, meta) => LEVELS.error <= currentLevel && console.error(fmt('error', msg, meta)),
  warn:  (msg, meta) => LEVELS.warn  <= currentLevel && console.warn(fmt('warn',  msg, meta)),
  info:  (msg, meta) => LEVELS.info  <= currentLevel && console.log(fmt('info',  msg, meta)),
  debug: (msg, meta) => LEVELS.debug <= currentLevel && console.log(fmt('debug', msg, meta)),
};

module.exports = logger;
