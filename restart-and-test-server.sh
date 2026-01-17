#!/bin/bash

echo "🔄 RESTART SERVER AND RUN COMPREHENSIVE TEST"
echo "============================================"

# Navigate to project directory
cd /home/ubuntu/inventoryfullstack

echo "📍 Current directory: $(pwd)"
echo ""

# Step 1: Stop the server
echo "🛑 STEP 1: STOPPING SERVER"
echo "=========================="
echo "Finding and killing node processes..."
pkill -f "node server.js" 2>/dev/null || echo "No node server.js process found"
pkill -f "node.*server" 2>/dev/null || echo "No node server process found"
sleep 2

# Check if any node processes are still running
echo "Checking for remaining node processes..."
ps aux | grep node | grep -v grep || echo "No node processes running"
echo ""

# Step 2: Start the server
echo "🚀 STEP 2: STARTING SERVER"
echo "=========================="
echo "Starting server in background..."
nohup node server.js > server.log 2>&1 &
SERVER_PID=$!
echo "Server started with PID: $SERVER_PID"
echo "Waiting 3 seconds for server to initialize..."
sleep 3

# Check if server is running
echo "Checking server status..."
ps aux | grep "node server.js" | grep -v grep || echo "❌ Server not running!"
echo ""

# Step 3: Test server health
echo "🏥 STEP 3: HEALTH CHECK"
echo "======================"
echo "Testing server health..."
curl -s --max-time 5 http://localhost:5000/ || echo "❌ Health check failed"
echo ""
echo ""

# Step 4: Database analysis
echo "📊 STEP 4: DATABASE ANALYSIS"
echo "============================"

echo "4.1 Testing database connection..."
mysql -u inventory_user -pStrongPass@123 -e "SELECT 'Database OK' as status;" 2>/dev/null || echo "❌ Database connection failed"
echo ""

echo "4.2 Checking users table..."
mysql -u inventory_user -pStrongPass@123 inventory_db -e "SELECT COUNT(*) as total_users FROM users;" 2>/dev/null || echo "❌ Cannot count users"
echo ""

echo "4.3 Sample users (if any)..."
mysql -u inventory_user -pStrongPass@123 inventory_db -e "SELECT id, username, email, role FROM users LIMIT 3;" 2>/dev/null || echo "❌ Cannot fetch users"
echo ""

echo "4.4 Checking roles..."
mysql -u inventory_user -pStrongPass@123 inventory_db -e "SELECT COUNT(*) as total_roles FROM roles;" 2>/dev/null || echo "❌ Cannot count roles"
echo ""

echo "4.5 Checking permissions..."
mysql -u inventory_user -pStrongPass@123 inventory_db -e "SELECT COUNT(*) as total_permissions FROM permissions;" 2>/dev/null || echo "❌ Cannot count permissions"
echo ""

# Step 5: API Testing
echo "🧪 STEP 5: API TESTING"
echo "======================"

echo "5.1 Testing login API..."
echo "Trying admin@admin.com..."
LOGIN_RESPONSE=$(curl -s --max-time 5 -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}' 2>/dev/null)

echo "Login response:"
echo "$LOGIN_RESPONSE"
echo ""

# Try to extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4 2>/dev/null)

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ] && [ ${#TOKEN} -gt 10 ]; then
    echo "✅ Token received: ${TOKEN:0:30}..."
    echo ""
    
    echo "5.2 Testing protected APIs with token..."
    
    echo "📦 Products API:"
    curl -s --max-time 5 -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/products | head -3
    echo ""
    echo ""
    
    echo "👥 Users API:"
    curl -s --max-time 5 -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/users | head -3
    echo ""
    echo ""
    
    echo "🎭 Roles API:"
    curl -s --max-time 5 -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/roles | head -3
    echo ""
    echo ""
    
    echo "🔒 Permissions API:"
    curl -s --max-time 5 -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/permissions | head -3
    echo ""
    echo ""
    
else
    echo "❌ No valid token received - trying alternative login methods..."
    
    echo "Trying with username field..."
    LOGIN_RESPONSE2=$(curl -s --max-time 5 -X POST http://localhost:5000/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"username":"admin","password":"admin123"}' 2>/dev/null)
    echo "Response: $LOGIN_RESPONSE2"
    echo ""
fi

# Step 6: Server logs
echo "📋 STEP 6: SERVER LOGS"
echo "======================"
echo "Recent server logs:"
tail -20 server.log 2>/dev/null || echo "No server.log file found"
echo ""

# Step 7: Summary
echo "📊 STEP 7: SUMMARY"
echo "=================="
echo "✅ Server restart: Completed"
echo "✅ Health check: $(curl -s --max-time 2 http://localhost:5000/ >/dev/null 2>&1 && echo 'PASSED' || echo 'FAILED')"
echo "✅ Database: $(mysql -u inventory_user -pStrongPass@123 -e 'SELECT 1;' >/dev/null 2>&1 && echo 'CONNECTED' || echo 'FAILED')"
echo "✅ Authentication: $([ -n "$TOKEN" ] && [ ${#TOKEN} -gt 10 ] && echo 'WORKING' || echo 'FAILED')"
echo ""

echo "🎯 RESTART AND TEST COMPLETED!"
echo "=============================="

# Keep server running
echo "Server is running in background with PID: $SERVER_PID"
echo "To stop: kill $SERVER_PID"
echo "To view logs: tail -f server.log"