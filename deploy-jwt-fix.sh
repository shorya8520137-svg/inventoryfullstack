#!/bin/bash

echo "🚀 Deploying JWT Authentication Fix..."

# Upload fixed server.js
echo "📤 Uploading fixed server.js..."
scp -i "C:\Users\Admin\awsconection.pem" server.js ubuntu@16.171.161.150:~/inventoryfullstack/

# Restart server
echo "🔄 Restarting server..."
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack && pkill -9 node; sleep 2; nohup node server.js > server.log 2>&1 &"

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Test server health
echo "🏥 Testing server health..."
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "curl -s https://16.171.161.150.nip.io/ | head -5"

# Test JWT login endpoint
echo "🔐 Testing JWT login endpoint..."
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "curl -s -X POST https://16.171.161.150.nip.io/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@company.com\",\"password\":\"admin@123\"}' | head -10"

echo "✅ JWT Authentication Fix Deployed!"
echo ""
echo "🔗 Test URLs:"
echo "   Health Check: https://16.171.161.150.nip.io/"
echo "   Login API: https://16.171.161.150.nip.io/api/auth/login"
echo ""
echo "📋 Next Steps:"
echo "   1. Test login with admin credentials"
echo "   2. Update frontend login page"
echo "   3. Add JWT token to API calls"