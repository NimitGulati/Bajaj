'use strict';

const { Router } = require('express');
const { processHierarchyDataController, handleGet } = require('../controllers/bfhlController');
const { validateBfhlRequest } = require('../middleware/validateRequest');

const router = Router();

// GET  /bfhl – operation-code endpoint
router.get('/', handleGet);

// POST /bfhl – main hierarchy processing endpoint
router.post('/', validateBfhlRequest, processHierarchyDataController);

module.exports = router;
