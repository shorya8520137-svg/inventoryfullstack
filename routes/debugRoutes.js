const express = require('express');
const router = express.Router();
const debugController = require('../controllers/debugController');
const { authenticateToken } = require('../middleware/auth');

/**
 * DEBUG ROUTES
 * Temporary routes for debugging dispatch dimensions issue
 */

// GET /api/debug/dispatch-dimensions/:barcode - Test dispatch dimensions for specific barcode
router.get('/dispatch-dimensions/:barcode?', 
    authenticateToken,
    debugController.testDispatchDimensions
);

module.exports = router;