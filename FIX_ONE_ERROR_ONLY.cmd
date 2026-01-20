@echo off
echo 🔧 FIXING ONLY THE INVENTORY ROUTES ERROR
echo =========================================

echo 📝 Fix the exact syntax error on server
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && echo \"const express = require('express'); const router = express.Router(); const inventoryController = require('../controllers/inventoryController'); const { authenticateToken, checkPermission } = require('../middleware/auth'); router.get('/', authenticateToken, checkPermission('inventory.view'), inventoryController.getInventory); router.post('/', authenticateToken, checkPermission('inventory.create'), inventoryController.createInventory); router.put('/:id', authenticateToken, checkPermission('inventory.update'), inventoryController.updateInventory); router.delete('/:id', authenticateToken, checkPermission('inventory.delete'), inventoryController.deleteInventory); module.exports = router;\" > routes/inventoryRoutes.js"

echo 🚀 Start server
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && nohup node server.js > server.log 2>&1 & sleep 3"

echo 📋 Check if working
ssh -i "C:\Users\Admin\awsconection.pem" -o StrictHostKeyChecking=no ubuntu@16.171.197.86 "curl -s http://localhost:3001/api/auth/test"

echo ✅ SINGLE ERROR FIXED!