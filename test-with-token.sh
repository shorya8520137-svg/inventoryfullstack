#!/bin/bash

echo "🔍 Testing Auth and Permissions APIs with Token..."
echo "========================================"

# Test 1: Login and get token
echo "1️⃣ Getting auth token..."
RESPONSE=$(curl -s -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}')

TOKEN=$(echo $RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")
echo "Token: $TOKEN"

# Test 2: Roles API with token
echo ""
echo "2️⃣ Testing /api/roles with token"
curl -s http://localhost:5000/api/roles \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# Test 3: Permissions API with token
echo ""
echo "3️⃣ Testing /api/permissions with token"
curl -s http://localhost:5000/api/permissions \
  -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

echo ""
echo "========================================"
echo "✅ Tests Complete"
