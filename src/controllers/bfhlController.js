'use strict';

const { processHierarchyData } = require('../services/bfhlService');
const { sendSuccess } = require('../utils/responseHelper');
const { CANDIDATE } = require('../config/constants');

/**
 * POST /bfhl
 *
 * Accepts:
 *   { "data": ["A->B", "A->C", "B->D", ...] }
 *
 * Returns:
 *   {
 *     user_id: "",
 *     email_id: "",
 *     college_roll_number: "",
 *     hierarchies: [...],
 *     invalid_entries: [...],
 *     duplicate_edges: [...],
 *     summary: { total_trees, total_cycles, largest_tree_root }
 *   }
 */
const processHierarchyDataController = (req, res, next) => {
  try {
    const { data } = req.body;

    const result = processHierarchyData(data);

    return sendSuccess(res, {
      user_id: CANDIDATE.user_id,
      email_id: CANDIDATE.email_id,
      college_roll_number: CANDIDATE.college_roll_number,
      hierarchies: result.hierarchies,
      invalid_entries: result.invalid_entries,
      duplicate_edges: result.duplicate_edges,
      summary: result.summary,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /bfhl
 * Returns the operation code for health-check / discovery purposes.
 */
const handleGet = (req, res) => {
  return sendSuccess(res, { operation_code: 1 });
};

module.exports = { processHierarchyDataController, handleGet };
