#!/bin/bash

echo "🔍 Testing Dispatch Create API..."
echo "========================================"

# Test dispatch create with proper data
curl -X POST http://localhost:5000/api/dispatch/create \
  -H "Content-Type: application/json" \
  -d '{
    "selectedWarehouse": "GGM_WH",
    "orderRef": "TEST001",
    "customerName": "Test Customer",
    "awbNumber": "AWB123456",
    "selectedLogistics": "Delhivery",
    "selectedPaymentMode": "Prepaid",
    "parcelType": "Forward",
    "selectedExecutive": "Admin",
    "invoiceAmount": "1000",
    "weight": "1",
    "dimensions": {
      "length": "10",
      "width": "10",
      "height": "10"
    },
    "remarks": "Test dispatch",
    "products": [
      {
        "barcode": "2788-500",
        "product_name": "Assembly Charge",
        "qty": 1,
        "variant": ""
      }
    ]
  }'

echo ""
echo "========================================"
echo "✅ Test Complete"
