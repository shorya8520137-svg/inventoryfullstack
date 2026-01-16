# Backend API Testing Commands

## 🧪 Test All Important APIs

### 1. Order Tracking API (Self-Transfer Fix)
```bash
curl -s https://16.171.161.150.nip.io/api/order-tracking | jq '.'
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "source_type": "self_transfer",
      "id": 2704,
      "warehouse": "MUM_WH",
      "product_name": "HH_Bedding Cutie cat CC",
      "length": null,
      "width": null,
      "height": null,
      "actual_weight": null
    },
    {
      "source_type": "dispatch",
      "id": 6,
      "warehouse": "GGM_WH",
      "product_name": "HH_Bedding Cutie cat CC",
      "length": "1.00",
      "width": "1.00",
      "height": "1.00",
      "actual_weight": "11.000"
    }
  ]
}
```

---

### 2. Bulk Upload - Get Warehouses
```bash
curl -s https://16.171.161.150.nip.io/api/bulk-upload/warehouses | jq '.'
```

**Expected Response:**
```json
{
  "success": true,
  "warehouses": [
    {
      "w_id": 3,
      "warehouse_code": "AMD_WH",
      "Warehouse_name": "Ahmedabad Warehouse"
    },
    {
      "w_id": 5,
      "warehouse_code": "GGM_WH",
      "Warehouse_name": "Gurgaon Warehouse"
    },
    {
      "w_id": 1,
      "warehouse_code": "MUM_WH",
      "Warehouse_name": "Mumbai Warehouse"
    }
  ]
}
```

---

### 3. Products API
```bash
curl -s https://16.171.161.150.nip.io/api/products | jq '.data | length'
```

**Expected:** Number of products

---

### 4. Dispatch API - Get Warehouses
```bash
curl -s https://16.171.161.150.nip.io/api/dispatch/warehouses | jq '.'
```

---

### 5. Self-Transfer API
```bash
curl -s https://16.171.161.150.nip.io/api/self-transfer | jq '.'
```

---

### 6. Check Self-Transfer Tables
```bash
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "sudo mysql inventory_db -e 'SELECT * FROM self_transfer ORDER BY created_at DESC LIMIT 3;'"
```

---

### 7. Check Table Collations
```bash
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "sudo mysql information_schema -e 'SELECT TABLE_NAME, TABLE_COLLATION FROM TABLES WHERE TABLE_SCHEMA=\"inventory_db\" AND TABLE_NAME IN (\"warehouse_dispatch\", \"self_transfer\", \"inventory_ledger_base\") ORDER BY TABLE_NAME;'"
```

**Expected:**
```
warehouse_dispatch      utf8mb4_0900_ai_ci
self_transfer           utf8mb4_0900_ai_ci
inventory_ledger_base   utf8mb4_0900_ai_ci
```

---

### 8. Test Dispatch Timeline
```bash
curl -s https://16.171.161.150.nip.io/api/order-tracking/6/timeline | jq '.'
```

---

### 9. Test Dispatch Stats
```bash
curl -s https://16.171.161.150.nip.io/api/order-tracking/stats | jq '.'
```

---

### 10. Health Check
```bash
curl -s https://16.171.161.150.nip.io/health | jq '.'
```

---

## 🔥 Quick Test Script

Run this to test all APIs at once:

```bash
echo "Testing Backend APIs..."
echo ""

echo "1. Order Tracking:"
curl -s https://16.171.161.150.nip.io/api/order-tracking | jq '.success, (.data | length)'

echo ""
echo "2. Bulk Upload Warehouses:"
curl -s https://16.171.161.150.nip.io/api/bulk-upload/warehouses | jq '.success, (.warehouses | length)'

echo ""
echo "3. Products:"
curl -s https://16.171.161.150.nip.io/api/products | jq '.success, (.data | length)'

echo ""
echo "4. Dispatch Warehouses:"
curl -s https://16.171.161.150.nip.io/api/dispatch/warehouses | jq '.success'

echo ""
echo "5. Self-Transfer:"
curl -s https://16.171.161.150.nip.io/api/self-transfer | jq '.success'

echo ""
echo "✅ All tests completed!"
```

---

## 📊 Database Queries

### Check Self-Transfer Data
```sql
-- Check self_transfer table
SELECT * FROM self_transfer ORDER BY created_at DESC LIMIT 5;

-- Check self_transfer_items
SELECT * FROM self_transfer_items ORDER BY id DESC LIMIT 10;

-- Check order tracking query
SELECT 
    ilb.location_code as warehouse,
    st.order_ref,
    ilb.product_name,
    st.length,
    st.width,
    st.height,
    st.weight,
    ilb.direction
FROM inventory_ledger_base ilb
LEFT JOIN self_transfer st ON ilb.reference = st.transfer_reference
WHERE ilb.movement_type = 'SELF_TRANSFER'
AND ilb.direction = 'IN'
ORDER BY ilb.event_time DESC
LIMIT 5;
```

---

## 🐛 Debug Commands

### Check Server Logs
```bash
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack && tail -100 server.log"
```

### Check Server Status
```bash
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "ps aux | grep node"
```

### Restart Server (if needed)
```bash
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "pkill -9 node; sleep 2; cd inventoryfullstack && nohup node server.js > server.log 2>&1 &"
```

---

## ✅ Success Criteria

All APIs should return:
- `"success": true`
- Valid data in response
- No CORS errors
- Response time < 5 seconds

---

**Copy any command above and test directly in PowerShell or browser!**
