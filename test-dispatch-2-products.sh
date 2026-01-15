#!/bin/bash

echo "🔍 Testing Dispatch with 2 Different Products..."
echo "========================================"

# First, get 2 products with available stock
echo "Getting products with available stock..."
mysql -u inventory_user -pStrongPass@123 inventory_db -N -e "SELECT barcode, product_name FROM stock_batches WHERE status='active' AND qty_available > 0 LIMIT 2;" 2>/dev/null > /tmp/products.txt

# Read the products
PRODUCT1_BARCODE=$(sed -n '1p' /tmp/products.txt | awk '{print $1}')
PRODUCT1_NAME=$(sed -n '1p' /tmp/products.txt | cut -f2-)
PRODUCT2_BARCODE=$(sed -n '2p' /tmp/products.txt | awk '{print $1}')
PRODUCT2_NAME=$(sed -n '2p' /tmp/products.txt | cut -f2-)

echo "Product 1: $PRODUCT1_NAME | Barcode: $PRODUCT1_BARCODE"
echo "Product 2: $PRODUCT2_NAME | Barcode: $PRODUCT2_BARCODE"
echo ""

# Test dispatch with frontend form format (multiple products)
echo "Testing dispatch create with 2 products..."
curl -s -X POST http://localhost:5000/api/dispatch/create \
  -H "Content-Type: application/json" \
  -d "{
    \"selectedWarehouse\": \"GGM_WH\",
    \"orderRef\": \"TEST$(date +%s)\",
    \"customerName\": \"Test Customer Multi\",
    \"awbNumber\": \"AWB$(date +%s)\",
    \"selectedLogistics\": \"Delhivery\",
    \"selectedPaymentMode\": \"Prepaid\",
    \"parcelType\": \"Forward\",
    \"selectedExecutive\": \"Admin\",
    \"invoiceAmount\": \"2000\",
    \"weight\": \"2\",
    \"dimensions\": {
      \"length\": \"20\",
      \"width\": \"15\",
      \"height\": \"10\"
    },
    \"remarks\": \"Test with 2 products\",
    \"products\": [
      {
        \"name\": \"$PRODUCT1_NAME | | $PRODUCT1_BARCODE\",
        \"qty\": 1,
        \"variant\": \"\",
        \"selling_price\": 1000
      },
      {
        \"name\": \"$PRODUCT2_NAME | | $PRODUCT2_BARCODE\",
        \"qty\": 1,
        \"variant\": \"\",
        \"selling_price\": 1000
      }
    ]
  }" | python3 -m json.tool

echo ""
echo "========================================"
echo "Checking warehouse_dispatch table..."
mysql -u inventory_user -pStrongPass@123 inventory_db -e "SELECT id, order_ref, customer, product_name, qty, awb FROM warehouse_dispatch ORDER BY id DESC LIMIT 1;" 2>/dev/null

echo ""
echo "Checking warehouse_dispatch_items table..."
mysql -u inventory_user -pStrongPass@123 inventory_db -e "SELECT dispatch_id, product_name, barcode, qty, selling_price FROM warehouse_dispatch_items ORDER BY id DESC LIMIT 2;" 2>/dev/null

echo ""
echo "✅ Test Complete"
