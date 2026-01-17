#!/bin/bash

# Update with your server IP
SERVER_URL="http://your-server-ip:5000"  # Replace with actual server IP

echo "🔍 TESTING SERVER WITH CURL"
echo "=========================="
echo "Server: $SERVER_URL"
echo ""

# Test 1: Health Check
echo "1️⃣ Health Check..."
curl -s -w "Status: %{http_code}\n" "$SERVER_URL/" | head -10
echo ""

# Test 2: Login
echo "2️⃣ Login Test..."
LOGIN_RESPONSE=$(curl -s -X POST "$SERVER_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

echo "Login Response:"
echo "$LOGIN_RESPONSE" | head -5
echo ""

# Extract token (basic extraction)
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo "✅ Token received: ${TOKEN:0:20}..."
    echo ""
    
    # Test 3: Protected Route
    echo "3️⃣ Protected Route Test..."
    curl -s -H "Authorization: Bearer $TOKEN" "$SERVER_URL/api/products" | head -10
    echo ""
    echo "✅ Server is working!"
else
    echo "❌ No token received - check login"
fi

echo ""
echo "🔍 Server Status Check:"
echo "======================"