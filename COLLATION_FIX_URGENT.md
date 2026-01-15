# 🚨 URGENT: Collation Fix Required

## Problem
The self_transfer tables were created with wrong collation (`utf8mb4_unicode_ci`) but existing tables use `utf8mb4_0900_ai_ci`. This causes the JOIN to fail with error:
```
Illegal mix of collations (utf8mb4_0900_ai_ci,IMPLICIT) and (utf8mb4_unicode_ci,IMPLICIT)
```

## Solution
Recreate the tables with correct collation.

---

## 🚀 QUICK FIX (Copy-Paste on Server)

### Step 1: SSH to Server
```bash
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150
```

### Step 2: Navigate to Project
```bash
cd inventoryfullstack
```

### Step 3: Pull Latest Code
```bash
git pull origin main
```

### Step 4: Run Fix Script
```bash
bash fix-collation-issue.sh
```

---

## 📋 OR Run SQL Directly

If the script doesn't work, run these SQL commands:

```bash
sudo mysql inventory_db << 'EOF'
DROP TABLE IF EXISTS self_transfer_items;
DROP TABLE IF EXISTS self_transfer;

CREATE TABLE self_transfer (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    transfer_reference VARCHAR(255) NOT NULL UNIQUE,
    order_ref VARCHAR(100),
    transfer_type VARCHAR(50) NOT NULL,
    source_location VARCHAR(100) NOT NULL,
    destination_location VARCHAR(100) NOT NULL,
    awb_number VARCHAR(100),
    logistics VARCHAR(100),
    payment_mode VARCHAR(50),
    executive VARCHAR(100),
    invoice_amount DECIMAL(12,2) DEFAULT 0.00,
    length DECIMAL(10,2),
    width DECIMAL(10,2),
    height DECIMAL(10,2),
    weight DECIMAL(10,3),
    remarks TEXT,
    status VARCHAR(50) DEFAULT 'Completed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_transfer_ref (transfer_reference),
    INDEX idx_order_ref (order_ref),
    INDEX idx_source (source_location),
    INDEX idx_destination (destination_location),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE self_transfer_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    transfer_id INT UNSIGNED NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    barcode VARCHAR(100) NOT NULL,
    variant VARCHAR(255),
    qty INT UNSIGNED NOT NULL DEFAULT 1,
    FOREIGN KEY (transfer_id) REFERENCES self_transfer(id) ON DELETE CASCADE,
    INDEX idx_transfer_id (transfer_id),
    INDEX idx_barcode (barcode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
EOF
```

---

## ✅ Verify Fix

```bash
# Check collations match
sudo mysql -e "
SELECT TABLE_NAME, TABLE_COLLATION 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'inventory_db' 
AND TABLE_NAME IN ('warehouse_dispatch', 'self_transfer', 'self_transfer_items');"

# Test API
curl -s https://16.171.161.150.nip.io/api/order-tracking | jq '.success'
```

Expected output:
```
warehouse_dispatch      utf8mb4_0900_ai_ci
self_transfer           utf8mb4_0900_ai_ci
self_transfer_items     utf8mb4_0900_ai_ci

true
```

---

## 🎯 What Changed

### Before (Wrong):
```sql
COLLATE=utf8mb4_unicode_ci  ❌
```

### After (Correct):
```sql
COLLATE=utf8mb4_0900_ai_ci  ✅
```

---

## ⏱️ Time Required
- **2 minutes** to run the fix
- **Zero downtime** (tables are empty anyway)

---

## 📝 Notes
- Tables are dropped and recreated (safe because they're empty)
- No data loss (tables were just created)
- All existing dispatches unaffected
- OrderSheet will work immediately after fix

---

**Run the fix now and OrderSheet will work!**
