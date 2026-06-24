'use strict';

const { sendError } = require('../utils/responseHelper');

/**
 * Validates that the request body contains the required `data` array field.
 */
const validateBfhlRequest = (req, res, next) => {
  const { data } = req.body;

  if (!req.body || data === undefined) {
    return sendError(res, 'Request body is missing the "data" field.', 400);
  }

  if (!Array.isArray(data)) {
    return sendError(res, '"data" must be an array.', 400);
  }

  next();
};

module.exports = { validateBfhlRequest };
