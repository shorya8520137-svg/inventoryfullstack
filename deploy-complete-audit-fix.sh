#!/bin/bash
# DEPLOY COMPLETE AUDIT SYSTEM FIX

echo "🚀 Deploying Complete Audit System Fix"
echo "======================================"

echo "📤 Step 1: Uploading fixed files..."
scp -i "C:\Users\Admin\awsconection.pem" routes/permissionsRoutes-fixed.js ubuntu@16.171.5.50:/home/ubuntu/inventoryfullstack/routes/permissionsRoutes.js
scp -i "C:\Users\Admin\awsconection.pem" controllers/permissionsController-fixed.js ubuntu@16.171.5.50:/home/ubuntu/inventoryfullstack/controllers/permissionsController.js

echo "🔄 Step 2: Restarting server..."
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.5.50 "cd /home/ubuntu/inventoryfullstack && pm2 restart server"

echo "✅ Deployment complete!"
echo "🧪 Test with: node test-complete-user-journey-fixed.js"