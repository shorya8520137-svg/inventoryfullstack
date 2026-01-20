@echo off
echo 🚨 EMERGENCY FIX - DISPATCH ROUTES SYNTAX
echo ========================================

echo 📝 Creating correct dispatchRoutes.js on server
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack/routes && cat > dispatchRoutes.js << 'EOF'
const express = require('express');
const router = express.Router();
const { authenticateToken, checkPermission } = require('../middleware/auth');
const dispatchController = require('../controllers/dispatchController');

// Create dispatch
router.post('/', authenticateToken, checkPermission('operations.dispatch'), dispatchController.createDispatch);

// Get all dispatches
router.get('/', authenticateToken, checkPermission('operations.dispatch'), dispatchController.getDispatches);

// Update dispatch status
router.put('/:id', authenticateToken, checkPermission('operations.dispatch'), dispatchController.updateDispatchStatus);

// Get warehouses
router.get('/warehouses', authenticateToken, checkPermission('operations.dispatch'), dispatchController.getWarehouses);

// Get logistics
router.get('/logistics', authenticateToken, checkPermission('operations.dispatch'), dispatchController.getLogistics);

// Get processed persons
router.get('/processed-persons', authenticateToken, checkPermission('operations.dispatch'), dispatchController.getProcessedPersons);

// Check inventory
router.get('/check-inventory', authenticateToken, checkPermission('operations.dispatch'), dispatchController.checkInventory);

// Get payment modes
router.get('/payment-modes', authenticateToken, checkPermission('operations.dispatch'), dispatchController.getPaymentModes);

// Search products
router.get('/search-products', authenticateToken, checkPermission('operations.dispatch'), dispatchController.searchProducts);

module.exports = router;
EOF"

echo 🚀 Restart server
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && pkill -f node && nohup node server.js > server.log 2>&1 &"

echo ⏳ Wait 3 seconds
timeout /t 3 /nobreak > nul

echo 🧪 Test server
node QUICK_SERVER_TEST.js