#!/bin/bash
# DEPLOY AUDIT SYSTEM FIXES

echo "🚀 Deploying Audit System Fixes to Server"
echo "=========================================="

# 1. Upload files to server
echo "📤 Step 1: Uploading files to server..."
scp -i "C:\Users\Admin\awsconection.pem" EventAuditLogger.js ubuntu@16.171.5.50:/home/ubuntu/inventoryfullstack/
scp -i "C:\Users\Admin\awsconection.pem" middleware/auth.js ubuntu@16.171.5.50:/home/ubuntu/inventoryfullstack/middleware/
scp -i "C:\Users\Admin\awsconection.pem" controllers/dispatchController.js ubuntu@16.171.5.50:/home/ubuntu/inventoryfullstack/controllers/

# 2. SSH into server and restart
echo "🔧 Step 2: Restarting server..."
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.5.50 << 'EOF'
cd /home/ubuntu/inventoryfullstack
echo "📁 Current directory: $(pwd)"
echo "📋 Files in directory:"
ls -la

echo "🔄 Restarting server..."
pm2 restart server || node server.js &

echo "✅ Server restarted"
echo "🔍 Checking server status..."
pm2 status
EOF

echo "🎉 Deployment complete!"
echo "🧪 Run test-complete-user-journey-fixed.js to verify"