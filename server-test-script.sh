#!/bin/bash

echo "🔐 StockIQ API Test Script"
echo "=========================="
echo "Server: $(hostname)"
echo "Date: $(date)"
echo

# Test 1: Health Check
echo "1️⃣ Health Check..."
HEALTH_RESPONSE=$(curl -s http://localhost:5000/api/health)
if [ $? -eq 0 ]; then
    echo "✅ Server responding"
    echo "Response: $HEALTH_RESPONSE"
else
    echo "❌ Server not responding"
    exit 1
fi

echo

# Test 2: Admin Login
echo "2️⃣ Admin Login Test..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "admin@company.com", "password": "Admin@123"}')

if [ $? -eq 0 ]; then
    echo "✅ Login request successful"
    echo "Response: $LOGIN_RESPONSE"
    
    # Extract token using basic text processing
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    
    if [ ! -z "$TOKEN" ]; then
        echo "🎫 Token extracted: ${TOKEN:0:30}..."
        
        # Test 3: Protected Endpoint
        echo
        echo "3️⃣ Testing Protected Endpoint..."
        USERS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/users)
        
        if [ $? -eq 0 ]; then
            echo "✅ Protected endpoint accessible"
            echo "Users response: $USERS_RESPONSE"
        else
            echo "❌ Protected endpoint failed"
        fi
        
        # Test 4: More Endpoints
        echo
        echo "4️⃣ Testing Additional Endpoints..."
        
        ENDPOINTS=("products" "orders" "dispatch" "notifications" "2fa/status")
        
        for endpoint in "${ENDPOINTS[@]}"; do
            echo "Testing /$endpoint..."
            RESPONSE=$(curl -s -w "HTTP_CODE:%{http_code}" -H "Authorization: Bearer $TOKEN" "http://localhost:5000/api/$endpoint")
            HTTP_CODE=$(echo "$RESPONSE" | grep -o "HTTP_CODE:[0-9]*" | cut -d: -f2)
            BODY=$(echo "$RESPONSE" | sed 's/HTTP_CODE:[0-9]*$//')
            
            if [ "$HTTP_CODE" = "200" ]; then
                echo "✅ $endpoint: SUCCESS ($HTTP_CODE)"
            elif [ "$HTTP_CODE" = "404" ]; then
                echo "⚠️ $endpoint: NOT FOUND ($HTTP_CODE)"
            else
                echo "❌ $endpoint: FAILED ($HTTP_CODE)"
            fi
        done
        
    else
        echo "❌ No token found in response"
    fi
else
    echo "❌ Login request failed"
fi

echo
echo "5️⃣ Server Information..."
echo "Node.js processes:"
ps aux | grep node | grep -v grep

echo
echo "Port 5000 status:"
ss -tlnp | grep :5000 || netstat -tlnp | grep :5000 || echo "Port 5000 not found"

echo
echo "Database connection test:"
mysql -u inventory_user -pStrongPass@123 inventory_db -e "SELECT COUNT(*) as user_count FROM users;" 2>/dev/null || echo "Database connection failed"

echo
echo "Environment check:"
cd ~/inventoryfullstack
echo "Current directory: $(pwd)"
echo "Environment file exists: $(test -f .env && echo 'YES' || echo 'NO')"

echo
echo "🏁 Test Complete"