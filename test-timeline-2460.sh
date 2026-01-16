#!/bin/bash

API_BASE="https://16.171.161.150.nip.io"

echo "=============================================="
echo "TIMELINE API TEST - Barcode 2460-3499"
echo "=============================================="
echo ""

# Step 1: Login
echo "STEP 1: Login"
echo "----------------------------------------------"
TOKEN=$(curl -s -k -X POST "$API_BASE/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin@123"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Token: ${TOKEN:0:30}..."
echo ""

# Step 2: Test Product Timeline with barcode 2460-3499
echo "STEP 2: Product Timeline - Barcode 2460-3499"
echo "=============================================="
curl -s -k "$API_BASE/api/timeline/2460-3499" \
  -H "Authorization: Bearer $TOKEN" > timeline_2460.json

echo "Response saved to timeline_2460.json"
echo ""
echo "Summary:"
cat timeline_2460.json | grep -o '"summary":{[^}]*}' | head -1
echo ""
echo ""

# Step 3: Extract first DISPATCH event AWB
echo "STEP 3: Extract DISPATCH Events"
echo "=============================================="
echo "DISPATCH events found:"
cat timeline_2460.json | grep -o '"type":"DISPATCH"[^}]*"reference":"[^"]*"' | grep -o '"reference":"[^"]*"' | cut -d'"' -f4
echo ""

# Get first dispatch reference
DISPATCH_REF=$(cat timeline_2460.json | grep -o '"type":"DISPATCH"[^}]*"reference":"[^"]*"' | grep -o '"reference":"[^"]*"' | cut -d'"' -f4 | head -1)
echo "First DISPATCH reference: $DISPATCH_REF"

# Extract dispatch ID from reference
if [[ $DISPATCH_REF == DISPATCH_DELETE_* ]]; then
    DISPATCH_ID=$(echo $DISPATCH_REF | cut -d'_' -f3)
elif [[ $DISPATCH_REF == DISPATCH_* ]]; then
    DISPATCH_ID=$(echo $DISPATCH_REF | cut -d'_' -f2)
fi

echo "Extracted Dispatch ID: $DISPATCH_ID"
echo ""

# Step 4: Test Nested Timeline with extracted dispatch ID
echo "STEP 4: Nested Dispatch Timeline"
echo "=============================================="
echo "GET /api/order-tracking/$DISPATCH_ID/timeline"
echo ""

curl -s -k "$API_BASE/api/order-tracking/$DISPATCH_ID/timeline" \
  -H "Authorization: Bearer $TOKEN" > nested_$DISPATCH_ID.json

echo "Response saved to nested_$DISPATCH_ID.json"
echo ""
echo "Dispatch Details:"
cat nested_$DISPATCH_ID.json | grep -o '"dispatch":{[^}]*}' | head -1
echo ""
echo ""

echo "=============================================="
echo "COMPLETE RESPONSES"
echo "=============================================="
echo ""
echo "Product Timeline (2460-3499):"
cat timeline_2460.json
echo ""
echo ""
echo "Nested Timeline (Dispatch $DISPATCH_ID):"
cat nested_$DISPATCH_ID.json
echo ""
