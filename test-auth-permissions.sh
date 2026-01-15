#!/bin/bash

echo "🔍 Testing Auth and Permissions APIs..."
echo "========================================"

# Test 1: Auth Login
echo ""
echo "1️⃣ Testing /auth/login"
curl -s -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' | python3 -m json.tool

# Test 2: Roles API
echo ""
echo "2️⃣ Testing /api/roles"
curl -s http://localhost:5000/api/roles | python3 -m json.tool

# Test 3: Permissions API
echo ""
echo "3️⃣ Testing /api/permissions"
curl -s http://localhost:5000/api/permissions | python3 -m json.tool

echo ""
echo "========================================"
echo "✅ Tests Complete"
