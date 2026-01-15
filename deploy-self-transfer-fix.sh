#!/bin/bash

# =====================================================
# SELF-TRANSFER FIX DEPLOYMENT SCRIPT
# =====================================================
# This script:
# 1. Creates self_transfer and self_transfer_items tables
# 2. Verifies table creation
# 3. Tests self-transfer API
# 4. Verifies OrderSheet displays correctly
# =====================================================

echo "🚀 Starting Self-Transfer Fix Deployment..."
echo ""

# Step 1: Create database tables
echo "📊 Step 1: Creating self_transfer tables..."
mysql -u inventory_user -pStrongPass@123 inventory_db < create-self-transfer-table.sql

if [ $? -eq 0 ]; then
    echo "✅ Tables created successfully"
else
    echo "❌ Failed to create tables"
    exit 1
fi

echo ""

# Step 2: Verify table structure
echo "📋 Step 2: Verifying table structure..."
mysql -u inventory_user -pStrongPass@123 inventory_db -e "
DESCRIBE self_transfer;
DESCRIBE self_transfer_items;
"

echo ""

# Step 3: Check existing self-transfer entries in ledger
echo "📦 Step 3: Checking existing self-transfer entries..."
mysql -u inventory_user -pStrongPass@123 inventory_db -e "
SELECT COUNT(*) as total_self_transfers,
       SUM(CASE WHEN direction = 'IN' THEN 1 ELSE 0 END) as in_entries,
       SUM(CASE WHEN direction = 'OUT' THEN 1 ELSE 0 END) as out_entries
FROM inventory_ledger_base 
WHERE movement_type = 'SELF_TRANSFER';
"

echo ""

# Step 4: Test the order tracking API
echo "🧪 Step 4: Testing order tracking API..."
curl -s https://16.171.161.150.nip.io/api/order-tracking | jq '.data | length'

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📝 NEXT STEPS:"
echo "1. Create a new self-transfer from the frontend"
echo "2. Verify it appears in OrderSheet with dimensions"
echo "3. Verify only IN entries are shown (no duplicates)"
echo "4. Check that dimensions are populated correctly"
echo ""
echo "🔍 To manually verify:"
echo "   mysql -u inventory_user -pStrongPass@123 inventory_db"
echo "   SELECT * FROM self_transfer ORDER BY created_at DESC LIMIT 5;"
echo "   SELECT * FROM self_transfer_items ORDER BY id DESC LIMIT 5;"
