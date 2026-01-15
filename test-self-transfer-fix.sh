#!/bin/bash

# =====================================================
# SELF-TRANSFER FIX TEST SCRIPT
# =====================================================
# This script tests the self-transfer fix by:
# 1. Creating a test self-transfer
# 2. Verifying data in database
# 3. Checking API response
# =====================================================

echo "🧪 Testing Self-Transfer Fix..."
echo ""

# Test data
SOURCE_WAREHOUSE="Gurgaon"
DEST_WAREHOUSE="Delhi"
ORDER_REF="TEST_ST_$(date +%s)"
AWB="AWB_TEST_$(date +%s)"

echo "📦 Test Parameters:"
echo "   Source: $SOURCE_WAREHOUSE"
echo "   Destination: $DEST_WAREHOUSE"
echo "   Order Ref: $ORDER_REF"
echo "   AWB: $AWB"
echo ""

# Step 1: Create a test self-transfer via API
echo "🔄 Step 1: Creating test self-transfer..."
RESPONSE=$(curl -s -X POST https://16.171.161.150.nip.io/api/self-transfer \
  -H "Content-Type: application/json" \
  -d "{
    \"transferType\": \"warehouse-to-warehouse\",
    \"sourceWarehouse\": \"$SOURCE_WAREHOUSE\",
    \"destinationWarehouse\": \"$DEST_WAREHOUSE\",
    \"orderRef\": \"$ORDER_REF\",
    \"awbNumber\": \"$AWB\",
    \"selectedLogistics\": \"Test Logistics\",
    \"selectedPaymentMode\": \"Prepaid\",
    \"selectedExecutive\": \"Test User\",
    \"invoiceAmount\": 1000,
    \"weight\": 5.5,
    \"dimensions\": {
      \"length\": 30,
      \"width\": 20,
      \"height\": 15
    },
    \"remarks\": \"Test self-transfer for dimension fix\",
    \"products\": [
      {
        \"name\": \"Test Product | 123-456\",
        \"qty\": 2,
        \"variant\": \"Standard\"
      }
    ]
  }")

echo "$RESPONSE" | jq '.'

# Extract transfer_id from response
TRANSFER_ID=$(echo "$RESPONSE" | jq -r '.transfer_id')

if [ "$TRANSFER_ID" != "null" ] && [ -n "$TRANSFER_ID" ]; then
    echo "✅ Self-transfer created with ID: $TRANSFER_ID"
else
    echo "❌ Failed to create self-transfer"
    echo "Response: $RESPONSE"
    exit 1
fi

echo ""

# Step 2: Verify data in self_transfer table
echo "📊 Step 2: Verifying self_transfer table..."
mysql -u inventory_user -pStrongPass@123 inventory_db -e "
SELECT id, transfer_reference, order_ref, source_location, destination_location,
       length, width, height, weight, awb_number, status
FROM self_transfer 
WHERE id = $TRANSFER_ID;
"

echo ""

# Step 3: Verify data in self_transfer_items table
echo "📦 Step 3: Verifying self_transfer_items table..."
mysql -u inventory_user -pStrongPass@123 inventory_db -e "
SELECT id, transfer_id, product_name, barcode, variant, qty
FROM self_transfer_items 
WHERE transfer_id = $TRANSFER_ID;
"

echo ""

# Step 4: Check inventory_ledger_base entries
echo "📝 Step 4: Checking ledger entries..."
mysql -u inventory_user -pStrongPass@123 inventory_db -e "
SELECT id, event_time, movement_type, barcode, product_name, location_code, qty, direction
FROM inventory_ledger_base 
WHERE reference LIKE '%$ORDER_REF%'
ORDER BY event_time DESC;
"

echo ""

# Step 5: Test order tracking API (should show only IN entry with dimensions)
echo "🔍 Step 5: Testing order tracking API..."
echo "Fetching order tracking data..."
curl -s "https://16.171.161.150.nip.io/api/order-tracking?warehouse=$DEST_WAREHOUSE" | \
  jq ".data[] | select(.order_ref == \"$ORDER_REF\") | {
    order_ref: .order_ref,
    warehouse: .warehouse,
    length: .length,
    width: .width,
    height: .height,
    weight: .actual_weight,
    awb: .awb,
    source_type: .source_type
  }"

echo ""
echo "✅ Test completed!"
echo ""
echo "📝 VERIFICATION CHECKLIST:"
echo "   ✓ Self-transfer record created in self_transfer table"
echo "   ✓ Product items created in self_transfer_items table"
echo "   ✓ Ledger entries created (both IN and OUT)"
echo "   ✓ Order tracking API returns dimensions"
echo "   ✓ Only IN entry should appear in OrderSheet"
echo ""
echo "🌐 Check frontend: https://stockiqfullstacktest-l4zybrcuw-test-tests-projects-d6b8ba0b.vercel.app/order"
