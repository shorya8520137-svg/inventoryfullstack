#!/bin/bash

echo "========================================"
echo "AUTOMATED DEPLOYMENT - SATURDAY VERSION"
echo "========================================"

# Step 1: Push to GitHub
echo ""
echo "📤 Step 1: Pushing code to GitHub..."
git add .
git commit -m "RESTORE: Saturday working version with updated API IP (13.53.54.181)"
git push origin main

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Failed to push to GitHub"
    exit 1
fi
echo "✅ SUCCESS: Code pushed to GitHub"

# Step 2: Deploy to server
echo ""
echo "📥 Step 2: Deploying to server..."

ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.53.54.181 << 'EOF'
cd ~/inventoryfullstack
echo "🛑 Stopping current server..."
pkill -f "node server.js" || true
sleep 2

echo "📥 Pulling latest code from GitHub..."
git fetch origin
git reset --hard origin/main

echo "📦 Installing dependencies..."
npm install

echo "🚀 Starting server..."
nohup node server.js > server.log 2>&1 &
sleep 3

echo "🧪 Testing server health..."
curl -X GET https://13.53.54.181.nip.io/ -k -s | head -1

echo "🔐 Testing admin login..."
curl -X POST https://13.53.54.181.nip.io/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"password"}' \
  -k -s | grep -o '"success":true' || echo "Login test failed"

echo "🎉 Server deployment completed!"
EOF

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Server deployment failed"
    exit 1
fi

echo ""
echo "========================================"
echo "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
echo "========================================"
echo "🌐 Frontend: http://localhost:3000"
echo "🔗 Backend: https://13.53.54.181.nip.io"
echo "👤 Login: admin@company.com / password"
echo "========================================"