'use strict';

/**
 * Send a standardised success response.
 * @param {import('express').Response} res
 * @param {object} data
 * @param {number} [statusCode=200]
 */
const sendSuccess = (res, data, statusCode = 200) => {
  return res.status(statusCode).json(data);
};

/**
 * Send a standardised error response.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} [statusCode=500]
 */
const sendError = (res, message, statusCode = 500) => {
  return res.status(statusCode).json({
    is_success: false,
    message,
  });
};

module.exports = { sendSuccess, sendError };
