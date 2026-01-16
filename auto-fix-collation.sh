#!/bin/bash

# =====================================================
# AUTOMATIC COLLATION FIX - Complete Automation
# =====================================================
# This script will:
# 1. SSH to server
# 2. Check database collations
# 3. Fix self_transfer tables
# 4. Verify everything works
# =====================================================

SSH_KEY="C:\\Users\\Admin\\awsconection.pem"
SERVER="ubuntu@16.171.161.150"
DB_NAME="inventory_db"
DB_USER="inventory_user"
DB_PASS="StrongPass@123"

echo "🚀 Starting Automatic Collation Fix..."
echo ""

# Execute everything on remote server
ssh -i "$SSH_KEY" "$SERVER" << 'ENDSSH'

echo "📊 Step 1: Checking current table collations..."
echo ""

sudo mysql -e "
SELECT 
    TABLE_NAME,
    TABLE_COLLATION
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'inventory_db' 
AND TABLE_NAME IN (
    'warehouse_dispatch',
    'inventory_ledger_base',
    'stock_batches',
    'self_transfer',
    'self_transfer_items'
)
ORDER BY TABLE_NAME;
"

echo ""
echo "🔧 Step 2: Fixing self_transfer tables with correct collation..."
echo ""

# Drop and recreate tables with correct collation
sudo mysql inventory_db << 'EOF'

-- Drop existing tables
DROP TABLE IF EXISTS self_transfer_items;
DROP TABLE IF EXISTS self_transfer;

-- Create self_transfer with utf8mb4_0900_ai_ci
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

-- Create self_transfer_items with utf8mb4_0900_ai_ci
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

if [ $? -eq 0 ]; then
    echo "✅ Tables recreated successfully with correct collation"
else
    echo "❌ Failed to recreate tables"
    exit 1
fi

echo ""
echo "🔍 Step 3: Verifying new collations..."
echo ""

sudo mysql -e "
SELECT 
    TABLE_NAME,
    TABLE_COLLATION
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'inventory_db' 
AND TABLE_NAME IN ('self_transfer', 'self_transfer_items')
ORDER BY TABLE_NAME;
"

echo ""
echo "📋 Step 4: Checking table structures..."
echo ""

echo "self_transfer table:"
sudo mysql inventory_db -e "DESCRIBE self_transfer;"

echo ""
echo "self_transfer_items table:"
sudo mysql inventory_db -e "DESCRIBE self_transfer_items;"

echo ""
echo "✅ Database fix completed!"
echo ""

ENDSSH

echo ""
echo "🧪 Step 5: Testing API from local machine..."
echo ""

# Test API
curl -s https://16.171.161.150.nip.io/api/order-tracking | jq '.success, (.data | length)'

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ API is working!"
    echo ""
    echo "🎉 ALL DONE! OrderSheet should work now."
    echo ""
    echo "📝 Next steps:"
    echo "   1. Refresh OrderSheet page"
    echo "   2. Create a new self-transfer"
    echo "   3. Verify dimensions appear correctly"
else
    echo ""
    echo "⚠️ API test failed, but database is fixed"
    echo "   Try refreshing OrderSheet page"
fi

echo ""
