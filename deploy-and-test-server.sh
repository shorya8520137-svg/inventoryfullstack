#!/bin/bash

echo "🚀 DEPLOYING TO SERVER AND TESTING USER CRUD"
echo "=================================================="

# SSH connection details
SSH_KEY="C:/Users/Admin/awsconection.pem"
SERVER_USER="ubuntu"
SERVER_IP="13.51.56.188"

echo ""
echo "📡 Connecting to server: $SERVER_USER@$SERVER_IP"

# Execute commands on remote server
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" << 'EOF'
echo "🔄 Navigating to project directory..."
cd inventoryfullstack

echo "📥 Pulling latest changes from GitHub..."
git pull origin main

echo "🛑 Stopping old server process..."
pkill -f "node server.js" || true
sleep 3

echo "🚀 Starting server with new code..."
nohup node server.js > server.log 2>&1 &
sleep 5

echo "✅ Checking if server is running..."
ps aux | grep "node server.js" | grep -v grep

echo "🏥 Testing server health..."
curl -s https://13.51.56.188.nip.io/api/health

echo "🧪 Running CRUD test..."
node test-table-structure.js

echo "📋 Showing recent server logs..."
tail -20 server.log

echo "✅ Deployment and testing completed!"
EOF

echo ""
echo "🎉 Server deployment and testing completed!"
echo ""
echo "📝 Next steps:"
echo "1. Check the test output above for CRUD results"
echo "2. If update still fails, check server logs for specific error"
echo "3. The status column issue should now be fixed"