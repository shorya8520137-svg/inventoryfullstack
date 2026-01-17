#!/bin/bash

echo "🔐 Testing admin login..."
curl -s -X POST https://13.51.56.188.nip.io/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin@123"}' | jq .

echo ""
echo "🧪 Testing API access..."

# Get token
TOKEN=$(curl -s -X POST https://13.51.56.188.nip.io/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin@123"}' | jq -r .token)

echo "Token: $TOKEN"

if [ "$TOKEN" != "null" ] && [ "$TOKEN" != "" ]; then
    echo "✅ Token received, testing API access..."
    curl -s -H "Authorization: Bearer $TOKEN" https://13.51.56.188.nip.io/api/products | jq .
else
    echo "❌ No token received"
fi