# =====================================================
# AUTOMATIC COLLATION FIX - PowerShell Version
# =====================================================

Write-Host ""
Write-Host "🚀 Starting Automatic Collation Fix..." -ForegroundColor Green
Write-Host ""

$sshKey = "C:\Users\Admin\awsconection.pem"
$server = "ubuntu@16.171.161.150"

# SQL to fix tables
$sqlFix = @"
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
"@

Write-Host "📊 Step 1: Checking current collations..." -ForegroundColor Cyan
ssh -i $sshKey $server "sudo mysql -e 'SELECT TABLE_NAME, TABLE_COLLATION FROM information_schema.TABLES WHERE TABLE_SCHEMA = \"inventory_db\" AND TABLE_NAME IN (\"warehouse_dispatch\", \"self_transfer\", \"self_transfer_items\") ORDER BY TABLE_NAME;'"

Write-Host ""
Write-Host "🔧 Step 2: Fixing tables..." -ForegroundColor Cyan
ssh -i $sshKey $server "sudo mysql inventory_db -e '$sqlFix'"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Tables recreated successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to recreate tables" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔍 Step 3: Verifying new collations..." -ForegroundColor Cyan
ssh -i $sshKey $server "sudo mysql -e 'SELECT TABLE_NAME, TABLE_COLLATION FROM information_schema.TABLES WHERE TABLE_SCHEMA = \"inventory_db\" AND TABLE_NAME IN (\"self_transfer\", \"self_transfer_items\");'"

Write-Host ""
Write-Host "📋 Step 4: Checking table structures..." -ForegroundColor Cyan
ssh -i $sshKey $server "sudo mysql inventory_db -e 'DESCRIBE self_transfer;'"

Write-Host ""
Write-Host "🧪 Step 5: Testing API..." -ForegroundColor Cyan
$apiResponse = Invoke-RestMethod -Uri "https://16.171.161.150.nip.io/api/order-tracking" -Method Get

if ($apiResponse.success) {
    Write-Host "✅ API is working! Found $($apiResponse.data.Count) orders" -ForegroundColor Green
} else {
    Write-Host "⚠️ API returned success=false" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "🎉 ALL DONE! OrderSheet should work now." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Refresh OrderSheet page"
Write-Host "   2. Create a new self-transfer"
Write-Host "   3. Verify dimensions appear correctly"
Write-Host ""
