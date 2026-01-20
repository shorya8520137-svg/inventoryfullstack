#!/bin/bash

echo "🔧 Fixing JWT Token Authentication Issue..."
echo "=========================================="

SERVER_IP="16.171.197.86"
SSH_KEY="C:/Users/Admin/awsconection.pem"

echo "📤 Uploading fixed permissions routes to server..."

# Upload the fixed permissions routes file
scp -i "$SSH_KEY" routes/permissionsRoutes.js ubuntu@$SERVER_IP:~/inventoryfullstack/routes/

echo "🔄 Restarting server to apply changes..."

# Restart the server
ssh -i "$SSH_KEY" ubuntu@$SERVER_IP << 'EOF'
cd ~/inventoryfullstack

# Kill existing server process
pkill -f "node server.js" || true
pkill -f "npm start" || true

# Wait a moment
sleep 2

# Start server in background
nohup node server.js > server.log 2>&1 &

# Wait for server to start
sleep 3

echo "✅ Server restarted"
EOF

echo "🧪 Testing JWT token authentication..."

# Test the fix
node test-jwt-token-issue.js

echo ""
echo "🎉 JWT Token Authentication Fix Complete!"
echo "The /api/users endpoint should now work properly with valid JWT tokens."