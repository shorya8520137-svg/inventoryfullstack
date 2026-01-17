#!/bin/bash

echo "🚀 DEPLOYING CONTROLLER FIX AND RUNNING TEST ON SERVER"
echo "========================================================"

# Server details
SERVER_IP="16.171.161.150"
SERVER_USER="ubuntu"
SERVER_PATH="/home/ubuntu/inventoryfullstack"

echo "📤 Step 1: Uploading fixed controller to server..."
scp -i ~/.ssh/your-key.pem controllers/permissionsController.js $SERVER_USER@$SERVER_IP:$SERVER_PATH/controllers/

echo "📤 Step 2: Uploading fixed test file to server..."
scp -i ~/.ssh/your-key.pem comprehensive-nested-user-journey-test.js $SERVER_USER@$SERVER_IP:$SERVER_PATH/

echo "🔧 Step 3: Connecting to server and running commands..."
ssh -i ~/.ssh/your-key.pem $SERVER_USER@$SERVER_IP << 'EOF'
cd /home/ubuntu/inventoryfullstack

echo "🛑 Stopping existing server processes..."
pkill -f "node server.js" || true
sleep 2

echo "📦 Installing missing dependencies..."
npm install bcryptjs axios --save

echo "🚀 Starting server..."
nohup node server.js > server.log 2>&1 &
sleep 5

echo "🧪 Running comprehensive test..."
node comprehensive-nested-user-journey-test.js

echo "📋 Server status:"
ps aux | grep "node server.js" | grep -v grep

echo "📄 Recent server logs:"
tail -20 server.log

EOF

echo "✅ Deployment and test completed!"