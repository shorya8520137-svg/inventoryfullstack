const express = require('express');
const router = express.Router();
const selfTransferController = require('../controllers/selfTransferController');
const { authenticateToken, checkPermission } = require('../middleware/auth');

/**
 * =====================================================
 * SELF TRANSFER ROUTES (With Permission Checks)
 * =====================================================
 */

// Create new self transfer
router.post('/create', 
    authenticateToken, 
    checkPermission('operations.self_transfer'), 
    selfTransferController.createSelfTransfer
);

// Get all self transfers with filters
router.get('/', 
    authenticateToken, 
    checkPermission('operations.self_transfer'), 
    selfTransferController.getSelfTransfers
);

module.exports = router;
