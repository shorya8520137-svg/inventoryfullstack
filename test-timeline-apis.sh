#!/bin/bash

# Timeline API Test Script
# Upload this to server and run: bash test-timeline-apis.sh

echo "=============================================="
echo "TIMELINE API COMPREHENSIVE TEST"
echo "=============================================="
echo ""

# Step 1: Login
echo "STEP 1: Login"
echo "----------------------------------------------"
LOGIN_RESPONSE=$(curl -s -k -X POST https://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq '.'
echo ""

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
    echo "❌ Login failed - no token received"
    exit 1
fi

echo "✅ Token received: ${TOKEN:0:30}..."
echo ""
echo ""

# Step 2: Test Product Timeline - Barcode 2460-3499
echo "STEP 2: Product Timeline - Barcode 2460-3499"
echo "=============================================="
echo "GET /api/timeline/2460-3499"
echo ""

TIMELINE1=$(curl -s -k -w "\nHTTP_CODE:%{http_code}" \
  "https://localhost:3001/api/timeline/2460-3499" \
  -H "Authorization: Bearer $TOKEN")

HTTP_CODE1=$(echo "$TIMELINE1" | grep "HTTP_CODE" | cut -d':' -f2)
BODY1=$(echo "$TIMELINE1" | sed '/HTTP_CODE/d')

echo "Status Code: $HTTP_CODE1"
echo ""
echo "Response:"
echo "$BODY1" | jq '.'
echo ""

if [ "$HTTP_CODE1" = "200" ]; then
    echo "✅ API Working"
    echo ""
    echo "Summary:"
    echo "$BODY1" | jq '.data.summary'
    echo ""
    echo "Timeline Events Count:"
    echo "$BODY1" | jq '.data.timeline | length'
    echo ""
    echo "First 3 Events:"
    echo "$BODY1" | jq '.data.timeline[0:3]'
else
    echo "❌ API Failed with status $HTTP_CODE1"
fi

echo ""
echo ""

# Step 3: Test Product Timeline - Barcode 2251-999
echo "STEP 3: Product Timeline - Barcode 2251-999"
echo "=============================================="
echo "GET /api/timeline/2251-999"
echo ""

TIMELINE2=$(curl -s -k -w "\nHTTP_CODE:%{http_code}" \
  "https://localhost:3001/api/timeline/2251-999" \
  -H "Authorization: Bearer $TOKEN")

HTTP_CODE2=$(echo "$TIMELINE2" | grep "HTTP_CODE" | cut -d':' -f2)
BODY2=$(echo "$TIMELINE2" | sed '/HTTP_CODE/d')

echo "Status Code: $HTTP_CODE2"
echo ""

if [ "$HTTP_CODE2" = "200" ]; then
    echo "✅ API Working"
    echo ""
    echo "Summary:"
    echo "$BODY2" | jq '.data.summary'
    echo ""
    echo "Timeline Events Count:"
    echo "$BODY2" | jq '.data.timeline | length'
    echo ""
    
    # Extract first DISPATCH event
    DISPATCH_REF=$(echo "$BODY2" | jq -r '.data.timeline[] | select(.type=="DISPATCH") | .reference' | head -1)
    echo "First DISPATCH Reference: $DISPATCH_REF"
    
    # Extract dispatch ID
    if [[ $DISPATCH_REF == DISPATCH_DELETE_* ]]; then
        DISPATCH_ID=$(echo $DISPATCH_REF | cut -d'_' -f3)
    else
        DISPATCH_ID=$(echo $DISPATCH_REF | cut -d'_' -f2)
    fi
    echo "Extracted Dispatch ID: $DISPATCH_ID"
else
    echo "❌ API Failed with status $HTTP_CODE2"
    DISPATCH_ID="19"  # Fallback to known ID
fi

echo ""
echo ""

# Step 4: Test Nested Dispatch Timeline
echo "STEP 4: Nested Dispatch Timeline"
echo "=============================================="
echo "GET /api/order-tracking/$DISPATCH_ID/timeline"
echo ""

NESTED=$(curl -s -k -w "\nHTTP_CODE:%{http_code}" \
  "https://localhost:3001/api/order-tracking/$DISPATCH_ID/timeline" \
  -H "Authorization: Bearer $TOKEN")

HTTP_CODE3=$(echo "$NESTED" | grep "HTTP_CODE" | cut -d':' -f2)
BODY3=$(echo "$NESTED" | sed '/HTTP_CODE/d')

echo "Status Code: $HTTP_CODE3"
echo ""

if [ "$HTTP_CODE3" = "200" ]; then
    echo "✅ API Working"
    echo ""
    echo "=== DISPATCH DETAILS ==="
    echo "$BODY3" | jq '.data.dispatch'
    echo ""
    echo "=== KEY FIELDS CHECK ==="
    echo "Customer: $(echo "$BODY3" | jq -r '.data.dispatch.customer')"
    echo "AWB: $(echo "$BODY3" | jq -r '.data.dispatch.awb')"
    echo "Order Ref: $(echo "$BODY3" | jq -r '.data.dispatch.order_ref')"
    echo "Logistics: $(echo "$BODY3" | jq -r '.data.dispatch.logistics')"
    echo "Payment Mode: $(echo "$BODY3" | jq -r '.data.dispatch.payment_mode')"
    echo "Invoice Amount: $(echo "$BODY3" | jq -r '.data.dispatch.invoice_amount')"
    echo ""
    echo "=== TIMELINE EVENTS ==="
    echo "Count: $(echo "$BODY3" | jq '.data.timeline | length')"
    echo ""
    echo "First 3 Events:"
    echo "$BODY3" | jq '.data.timeline[0:3]'
    echo ""
    echo "=== SUMMARY ==="
    echo "$BODY3" | jq '.data.summary'
elif [ "$HTTP_CODE3" = "404" ]; then
    echo "⚠️  Dispatch ID $DISPATCH_ID not found (404)"
    echo "Response:"
    echo "$BODY3" | jq '.'
    echo ""
    echo "Trying with dispatch ID 19..."
    
    NESTED_ALT=$(curl -s -k -w "\nHTTP_CODE:%{http_code}" \
      "https://localhost:3001/api/order-tracking/19/timeline" \
      -H "Authorization: Bearer $TOKEN")
    
    HTTP_CODE_ALT=$(echo "$NESTED_ALT" | grep "HTTP_CODE" | cut -d':' -f2)
    BODY_ALT=$(echo "$NESTED_ALT" | sed '/HTTP_CODE/d')
    
    echo "Status Code: $HTTP_CODE_ALT"
    if [ "$HTTP_CODE_ALT" = "200" ]; then
        echo "✅ Dispatch ID 19 found!"
        echo ""
        echo "Dispatch Details:"
        echo "$BODY_ALT" | jq '.data.dispatch'
    fi
else
    echo "❌ API Failed with status $HTTP_CODE3"
    echo "Response:"
    echo "$BODY3" | jq '.'
fi

echo ""
echo ""

# Summary
echo "=============================================="
echo "TEST SUMMARY"
echo "=============================================="
echo "1. Product Timeline (2460-3499): HTTP $HTTP_CODE1"
echo "2. Product Timeline (2251-999): HTTP $HTTP_CODE2"
echo "3. Nested Timeline (Dispatch $DISPATCH_ID): HTTP $HTTP_CODE3"
echo ""

if [ "$HTTP_CODE1" = "200" ] && [ "$HTTP_CODE2" = "200" ] && [ "$HTTP_CODE3" = "200" ]; then
    echo "✅ ALL TESTS PASSED"
elif [ "$HTTP_CODE1" = "200" ] && [ "$HTTP_CODE2" = "200" ]; then
    echo "⚠️  Product Timeline working, Nested Timeline needs checking"
else
    echo "❌ SOME TESTS FAILED"
fi

echo ""
echo "=============================================="
echo "SAVE RESPONSES TO FILES"
echo "=============================================="
echo "$BODY1" > timeline_2460-3499.json
echo "$BODY2" > timeline_2251-999.json
echo "$BODY3" > nested_timeline_$DISPATCH_ID.json

echo "✅ Responses saved to:"
echo "  - timeline_2460-3499.json"
echo "  - timeline_2251-999.json"
echo "  - nested_timeline_$DISPATCH_ID.json"
echo ""
echo "You can view them with: cat timeline_2460-3499.json | jq '.'"
