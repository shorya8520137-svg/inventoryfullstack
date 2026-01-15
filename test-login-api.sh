#!/bin/bash

echo "🧪 Testing Login API..."
echo ""

# Test 1: Login with username and password
echo "Test 1: Login with username/password"
curl -X POST https://localhost/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}' \
  -k -s | jq '.'
echo ""

# Test 2: Login with email and password
echo "Test 2: Login with email/password"
curl -X POST https://localhost/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  -k -s | jq '.'
echo ""

# Test 3: Login with empty body (should still work with our permissive auth)
echo "Test 3: Login with empty body"
curl -X POST https://localhost/auth/login \
  -H "Content-Type: application/json" \
  -d '{}' \
  -k -s | jq '.'
echo ""

# Test 4: Check response status code
echo "Test 4: Check status code"
STATUS=$(curl -X POST https://localhost/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}' \
  -k -s -o /dev/null -w '%{http_code}')
echo "Status Code: $STATUS"

if [ "$STATUS" = "200" ]; then
    echo "✅ Login API is working!"
else
    echo "❌ Login API returned status: $STATUS"
fi
