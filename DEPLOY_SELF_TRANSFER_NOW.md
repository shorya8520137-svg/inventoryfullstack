# Deploy Self-Transfer Fix - Quick Commands

## 🚀 DEPLOY NOW (Copy-Paste These Commands)

### Step 1: SSH to Server
```bash
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150
```

### Step 2: Navigate to Project
```bash
cd inventoryfullstack
```

### Step 3: Create Database Tables
```bash
mysql -u inventory_user -pStrongPass@123 inventory_db << 'EOF'
-- Create self_transfer table
CREATE TABLE IF NOT EXISTS self_transfer (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create self_transfer_items table
CREATE TABLE IF NOT EXISTS self_transfer_items (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    transfer_id INT UNSIGNED NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    barcode VARCHAR(100) NOT NULL,
    variant VARCHAR(255),
    qty INT UNSIGNED NOT NULL DEFAULT 1,
    FOREIGN KEY (transfer_id) REFERENCES self_transfer(id) ON DELETE CASCADE,
    INDEX idx_transfer_id (transfer_id),
    INDEX idx_barcode (barcode)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
EOF
```

### Step 4: Verify Tables Created
```bash
mysql -u inventory_user -pStrongPass@123 inventory_db -e "SHOW TABLES LIKE 'self_transfer%';"
```

### Step 5: Check Table Structure
```bash
mysql -u inventory_user -pStrongPass@123 inventory_db -e "DESCRIBE self_transfer;"
mysql -u inventory_user -pStrongPass@123 inventory_db -e "DESCRIBE self_transfer_items;"
```

### Step 6: Test API (Optional)
```bash
curl -s https://16.171.161.150.nip.io/api/order-tracking | jq '.success'
```

## ✅ VERIFICATION

After deployment, test by:

1. **Create a new self-transfer** from the frontend
2. **Check OrderSheet** - should show:
   - ✅ Dimensions (length, width, height, weight)
   - ✅ Only IN entry (no duplicates)

## 🔍 MANUAL DATABASE CHECK

```bash
# Check if new self-transfers are being saved
mysql -u inventory_user -pStrongPass@123 inventory_db -e "SELECT * FROM self_transfer ORDER BY created_at DESC LIMIT 3;"

# Check self-transfer items
mysql -u inventory_user -pStrongPass@123 inventory_db -e "SELECT * FROM self_transfer_items ORDER BY id DESC LIMIT 5;"

# Check order tracking query (should show dimensions)
mysql -u inventory_user -pStrongPass@123 inventory_db -e "
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
"
```

## 📝 WHAT THIS FIX DOES

### Before:
- Self-transfer shows: `NULL x NULL x NULL` dimensions
- Shows both IN and OUT entries (duplicates)

### After:
- Self-transfer shows: `30 x 20 x 15` dimensions (actual values)
- Shows only IN entries (no duplicates)

## ⚠️ IMPORTANT NOTES

1. **No server restart needed** - Code already deployed
2. **Old self-transfers** will still show NULL dimensions (expected)
3. **New self-transfers** will have complete dimension data
4. **Regular dispatches** are unaffected

## 🎯 SUCCESS CRITERIA

- [ ] Tables created without errors
- [ ] New self-transfer saves dimensions to database
- [ ] OrderSheet displays dimensions correctly
- [ ] Only IN entries appear (no OUT duplicates)
- [ ] Export CSV has separate dimension columns

## 🆘 IF SOMETHING GOES WRONG

Rollback:
```bash
mysql -u inventory_user -pStrongPass@123 inventory_db -e "DROP TABLE IF EXISTS self_transfer_items; DROP TABLE IF EXISTS self_transfer;"
```

Then contact for support.

---

**Ready to deploy? Copy the commands above and execute them on the server!**
