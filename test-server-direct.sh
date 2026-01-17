#!/bin/bash

# Simple script to test server directly with curl
# Update with your server IP
SERVER_IP="your-server-ip"  # Replace with actual server IP
SERVER_URL="http://$SERVER_IP:5000"

echo "🔍 DIRECT SERVER TEST WITH CURL"
echo "==============================="
echo "Testing: $SERVER_URL"
echo ""

# Test 1: Health Check
echo "1️⃣ Health Check..."
echo "curl -s $SERVER_URL/"
curl -s -w "\nHTTP Status: %{http_code}\n" "$SERVER_URL/" | head -5
echo ""

# Test 2: Login
echo "2️⃣ Login Test..."
echo "curl -X POST $SERVER_URL/api/auth/login"
LOGIN_RESPONSE=$(curl -s -X POST "$SERVER_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -w "\nHTTP Status: %{http_code}")

echo "Response:"
echo "$LOGIN_RESPONSE"
echo ""

# Extract token
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo "✅ Token received: ${TOKEN:0:30}..."
    echo ""
    
    # Test 3: Protected Route
    echo "3️⃣ Protected Route Test..."
    echo "curl -H 'Authorization: Bearer TOKEN' $SERVER_URL/api/products"
    curl -s -H "Authorization: Bearer $TOKEN" "$SERVER_URL/api/products" \
         -w "\nHTTP Status: %{http_code}\n" | head -10
    echo ""
    
    echo "✅ Server appears to be working!"
else
    echo "❌ No valid token received"
    echo "Check server logs and authentication"
fi

echo ""
echo "🔍 Additional Checks:"
echo "===================="
echo "If tests fail, check on server:"
echo "1. sudo systemctl status stockiq-backend"
echo "2. sudo netstat -tlnp | grep :5000"
echo "3. sudo journalctl -u stockiq-backend -f"