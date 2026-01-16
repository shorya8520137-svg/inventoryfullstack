#!/bin/bash

API_BASE="https://16.171.161.150.nip.io"

echo "=============================================="
echo "TIMELINE API TEST"
echo "Using: $API_BASE"
echo "=============================================="
echo ""

# Step 1: Login
echo "STEP 1: Login"
echo "----------------------------------------------"
curl -s -k -X POST "$API_BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin@123"}' > login.json

cat login.json
echo ""
echo ""

# Extract token
TOKEN=$(cat login.json | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: ${TOKEN:0:30}..."
echo ""

# Step 2: Test Product Timeline
echo "STEP 2: Product Timeline - 2251-999"
echo "=============================================="
curl -s -k "$API_BASE/api/timeline/2251-999" \
  -H "Authorization: Bearer $TOKEN" > timeline.json

cat timeline.json
echo ""
echo ""

# Step 3: Test Nested Timeline
echo "STEP 3: Nested Timeline - Dispatch ID 19"
echo "=============================================="
curl -s -k "$API_BASE/api/order-tracking/19/timeline" \
  -H "Authorization: Bearer $TOKEN" > nested.json

cat nested.json
echo ""
echo ""

echo "=============================================="
echo "DONE - Files saved"
echo "=============================================="
