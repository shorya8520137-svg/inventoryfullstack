#!/bin/bash

# Simple permissions API test using curl
SERVER_URL="http://localhost:5000"

echo "🔐 SIMPLE PERMISSIONS API TEST"
echo "=============================="
echo "Server: $SERVER_URL"
echo ""

# Test 1: Login to get token
echo "1️⃣ Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$SERVER_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}')

echo "Login Response:"
echo "$LOGIN_RESPONSE" | head -3
echo ""

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo "✅ Token received: ${TOKEN:0:30}..."
    echo ""
    
    # Test 2: Users API
    echo "2️⃣ Testing Users API..."
    curl -s -H "Authorization: Bearer $TOKEN" "$SERVER_URL/api/users" | head -5
    echo ""
    echo ""
    
    # Test 3: Roles API
    echo "3️⃣ Testing Roles API..."
    curl -s -H "Authorization: Bearer $TOKEN" "$SERVER_URL/api/roles" | head -5
    echo ""
    echo ""
    
    # Test 4: Permissions API
    echo "4️⃣ Testing Permissions API..."
    curl -s -H "Authorization: Bearer $TOKEN" "$SERVER_URL/api/permissions" | head -5
    echo ""
    echo ""
    
    # Test 5: User Permissions
    echo "5️⃣ Testing User Permissions..."
    curl -s -H "Authorization: Bearer $TOKEN" "$SERVER_URL/api/user-permissions" | head -5
    echo ""
    echo ""
    
    # Test 6: Audit Logs
    echo "6️⃣ Testing Audit Logs..."
    curl -s -H "Authorization: Bearer $TOKEN" "$SERVER_URL/api/audit-logs" | head -5
    echo ""
    echo ""
    
    echo "✅ All permissions API tests completed!"
else
    echo "❌ No valid token received - cannot test protected routes"
    echo "Login response: $LOGIN_RESPONSE"
fi

echo ""
echo "🎉 SIMPLE PERMISSIONS TEST COMPLETED!"