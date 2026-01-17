#!/bin/bash

echo "🔐 Testing admin login directly..."

# Test login with curl
echo "Testing with curl..."
curl -k -X POST https://16.171.161.150.nip.io/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin@123"}' \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "🔄 Testing with Node.js script..."

# Test with Node.js script
node test-all-apis-with-token.js