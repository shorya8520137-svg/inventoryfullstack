#!/bin/bash

echo "🔍 Testing ALL APIs..."
echo "========================================"

BASE_URL="http://localhost:5000"

# Test 1: Auth Login
echo ""
echo "1️⃣ Testing /auth/login"
curl -s -X POST $BASE_URL/auth/login -H "Content-Type: application/json" -d '{"email":"admin","password":"admin"}' | head -c 200
echo ""

# Test 2: Roles API
echo ""
echo "2️⃣ Testing /api/roles"
curl -s $BASE_URL/api/roles | head -c 200
echo ""

# Test 3: Permissions API
echo ""
echo "3️⃣ Testing /api/permissions"
curl -s $BASE_URL/api/permissions | head -c 200
echo ""

# Test 4: Products API
echo ""
echo "4️⃣ Testing /api/products"
curl -s "$BASE_URL/api/products?page=1&limit=5" | head -c 200
echo ""

# Test 5: Inventory API
echo ""
echo "5️⃣ Testing /api/inventory"
curl -s "$BASE_URL/api/inventory?limit=5" | head -c 200
echo ""

# Test 6: Dispatch Warehouses
echo ""
echo "6️⃣ Testing /api/dispatch/warehouses"
curl -s $BASE_URL/api/dispatch/warehouses | head -c 200
echo ""

# Test 7: Dispatch Logistics
echo ""
echo "7️⃣ Testing /api/dispatch/logistics"
curl -s $BASE_URL/api/dispatch/logistics | head -c 200
echo ""

# Test 8: Dispatch Payment Modes
echo ""
echo "8️⃣ Testing /api/dispatch/payment-modes"
curl -s $BASE_URL/api/dispatch/payment-modes | head -c 200
echo ""

# Test 9: Dispatch Search Products
echo ""
echo "9️⃣ Testing /api/dispatch/search-products"
curl -s "$BASE_URL/api/dispatch/search-products?query=test" | head -c 200
echo ""

# Test 10: Dispatch Create (with proper data)
echo ""
echo "🔟 Testing /api/dispatch/create"
curl -s -X POST $BASE_URL/api/dispatch/create \
  -H "Content-Type: application/json" \
  -d '{
    "warehouse": "GGM_WH",
    "order_ref": "TEST001",
    "customer": "Test Customer",
    "product_name": "Test Product",
    "qty": 1,
    "barcode": "TEST123",
    "awb": "AWB123456",
    "logistics": "Delhivery",
    "payment_mode": "Prepaid"
  }' | head -c 200
echo ""

# Test 11: Returns API
echo ""
echo "1️⃣1️⃣ Testing /api/returns"
curl -s "$BASE_URL/api/returns?page=1&limit=5" | head -c 200
echo ""

# Test 12: Timeline API
echo ""
echo "1️⃣2️⃣ Testing /api/timeline"
curl -s "$BASE_URL/api/timeline?warehouse=GGM_WH&dateFrom=2025-01-01&dateTo=2026-12-31" | head -c 200
echo ""

# Test 13: Damage Recovery API
echo ""
echo "1️⃣3️⃣ Testing /api/damage-recovery"
curl -s "$BASE_URL/api/damage-recovery?page=1&limit=5" | head -c 200
echo ""

# Test 14: Self Transfer API
echo ""
echo "1️⃣4️⃣ Testing /api/self-transfer"
curl -s "$BASE_URL/api/self-transfer?page=1&limit=5" | head -c 200
echo ""

# Test 15: Order Tracking API
echo ""
echo "1️⃣5️⃣ Testing /api/order-tracking"
curl -s "$BASE_URL/api/order-tracking?page=1&limit=5" | head -c 200
echo ""

echo ""
echo "========================================"
echo "✅ All API Tests Complete"
echo "Check above for any errors (look for 'success':false or 500 errors)"
