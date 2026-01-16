#!/bin/bash

echo "=============================================="
echo "TIMELINE API TEST"
echo "=============================================="
echo ""

# Step 1: Login
echo "STEP 1: Login"
echo "----------------------------------------------"
curl -s -k -X POST https://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' > login.json

cat login.json
echo ""
echo ""

# Step 2: Test Product Timeline
echo "STEP 2: Product Timeline - 2251-999"
echo "=============================================="
TOKEN=$(cat login.json | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Using token: ${TOKEN:0:30}..."
echo ""

curl -s -k "https://localhost:3001/api/timeline/2251-999" \
  -H "Authorization: Bearer $TOKEN" > timeline.json

cat timeline.json
echo ""
echo ""

# Step 3: Test Nested Timeline
echo "STEP 3: Nested Timeline - Dispatch ID 19"
echo "=============================================="

curl -s -k "https://localhost:3001/api/order-tracking/19/timeline" \
  -H "Authorization: Bearer $TOKEN" > nested.json

cat nested.json
echo ""
echo ""

echo "=============================================="
echo "Files saved: login.json, timeline.json, nested.json"
echo "=============================================="
