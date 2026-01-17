#!/bin/bash

echo "🔐 Testing admin login..."

# Test login
RESPONSE=$(curl -k -s -X POST https://13.51.56.188.nip.io/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin@123"}')

echo "Login response: $RESPONSE"

# Extract token
TOKEN=$(echo $RESPONSE | jq -r '.token // empty')

if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo "✅ Token received: ${TOKEN:0:50}..."
    
    echo "🧪 Testing API access..."
    API_RESPONSE=$(curl -k -s -H "Authorization: Bearer $TOKEN" https://13.51.56.188.nip.io/api/products)
    echo "API response: $API_RESPONSE"
else
    echo "❌ No token received"
fi