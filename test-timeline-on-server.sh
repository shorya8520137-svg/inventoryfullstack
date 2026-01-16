#!/bin/bash

# Timeline API Test Script
# Run this on your server to test both timeline APIs

echo "=============================================="
echo "TIMELINE API TEST"
echo "=============================================="
echo ""

# Get auth token
echo "Step 1: Login to get token"
echo "-------------------------------------------"
LOGIN_RESPONSE=$(curl -s -k -X POST https://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Login failed"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Login successful"
echo "Token: ${TOKEN:0:20}..."
echo ""

# Test Product Timeline
echo "Step 2: Test Product Timeline"
echo "=============================================="
echo "GET /api/timeline/2460-3499"
echo ""

TIMELINE_RESPONSE=$(curl -s -k -X GET "https://localhost:3001/api/timeline/2460-3499" \
  -H "Authorization: Bearer $TOKEN")

echo "Response:"
echo "$TIMELINE_RESPONSE" | jq '.'
echo ""

# Extract dispatch ID from timeline
echo "Step 3: Extract Dispatch ID from Timeline"
echo "-------------------------------------------"
DISPATCH_REF=$(echo "$TIMELINE_RESPONSE" | jq -r '.data.timeline[] | select(.type=="DISPATCH") | .reference' | head -1)
echo "First DISPATCH reference: $DISPATCH_REF"

if [ -z "$DISPATCH_REF" ]; then
    echo "⚠️  No DISPATCH events found, trying alternate barcode..."
    echo ""
    echo "GET /api/timeline/2251-999"
    TIMELINE_RESPONSE=$(curl -s -k -X GET "https://localhost:3001/api/timeline/2251-999" \
      -H "Authorization: Bearer $TOKEN")
    DISPATCH_REF=$(echo "$TIMELINE_RESPONSE" | jq -r '.data.timeline[] | select(.type=="DISPATCH") | .reference' | head -1)
    echo "DISPATCH reference: $DISPATCH_REF"
fi

# Extract dispatch ID (format: DISPATCH_22_898989 or DISPATCH_DELETE_22)
if [[ $DISPATCH_REF == DISPATCH_DELETE_* ]]; then
    DISPATCH_ID=$(echo $DISPATCH_REF | cut -d'_' -f3)
else
    DISPATCH_ID=$(echo $DISPATCH_REF | cut -d'_' -f2)
fi

echo "Extracted Dispatch ID: $DISPATCH_ID"
echo ""

# Test Nested Timeline
echo "Step 4: Test Nested Dispatch Timeline"
echo "=============================================="
echo "GET /api/order-tracking/$DISPATCH_ID/timeline"
echo ""

NESTED_RESPONSE=$(curl -s -k -w "\nHTTP_STATUS:%{http_code}" -X GET "https://localhost:3001/api/order-tracking/$DISPATCH_ID/timeline" \
  -H "Authorization: Bearer $TOKEN")

HTTP_STATUS=$(echo "$NESTED_RESPONSE" | grep "HTTP_STATUS" | cut -d':' -f2)
NESTED_BODY=$(echo "$NESTED_RESPONSE" | sed '/HTTP_STATUS/d')

echo "Status Code: $HTTP_STATUS"
echo ""
echo "Response:"
echo "$NESTED_BODY" | jq '.'
echo ""

# Summary
echo "=============================================="
echo "TEST SUMMARY"
echo "=============================================="
echo "1. Product Timeline: $(echo $TIMELINE_RESPONSE | jq -r '.success')"
echo "2. Nested Timeline: HTTP $HTTP_STATUS"
echo ""

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Both APIs working!"
    echo ""
    echo "Dispatch Details:"
    echo "$NESTED_BODY" | jq '.data.dispatch'
    echo ""
    echo "Timeline Events Count:"
    echo "$NESTED_BODY" | jq '.data.timeline | length'
else
    echo "⚠️  Nested timeline returned $HTTP_STATUS"
    echo "This dispatch ID may not exist"
fi
