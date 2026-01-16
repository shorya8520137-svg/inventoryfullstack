@echo off
REM =====================================================
REM AUTOMATIC COLLATION FIX - Windows CMD Version
REM =====================================================

echo.
echo Starting Automatic Collation Fix...
echo.

ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "sudo mysql inventory_db -e 'DROP TABLE IF EXISTS self_transfer_items; DROP TABLE IF EXISTS self_transfer; CREATE TABLE self_transfer (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, transfer_reference VARCHAR(255) NOT NULL UNIQUE, order_ref VARCHAR(100), transfer_type VARCHAR(50) NOT NULL, source_location VARCHAR(100) NOT NULL, destination_location VARCHAR(100) NOT NULL, awb_number VARCHAR(100), logistics VARCHAR(100), payment_mode VARCHAR(50), executive VARCHAR(100), invoice_amount DECIMAL(12,2) DEFAULT 0.00, length DECIMAL(10,2), width DECIMAL(10,2), height DECIMAL(10,2), weight DECIMAL(10,3), remarks TEXT, status VARCHAR(50) DEFAULT \"Completed\", created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_transfer_ref (transfer_reference), INDEX idx_order_ref (order_ref), INDEX idx_source (source_location), INDEX idx_destination (destination_location), INDEX idx_created (created_at)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci; CREATE TABLE self_transfer_items (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, transfer_id INT UNSIGNED NOT NULL, product_name VARCHAR(255) NOT NULL, barcode VARCHAR(100) NOT NULL, variant VARCHAR(255), qty INT UNSIGNED NOT NULL DEFAULT 1, FOREIGN KEY (transfer_id) REFERENCES self_transfer(id) ON DELETE CASCADE, INDEX idx_transfer_id (transfer_id), INDEX idx_barcode (barcode)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;'"

echo.
echo Tables recreated!
echo.

echo Verifying...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "sudo mysql -e 'SELECT TABLE_NAME, TABLE_COLLATION FROM information_schema.TABLES WHERE TABLE_SCHEMA = \"inventory_db\" AND TABLE_NAME IN (\"self_transfer\", \"self_transfer_items\");'"

echo.
echo Testing API...
curl -s https://16.171.161.150.nip.io/api/order-tracking

echo.
echo.
echo ========================================
echo DONE! OrderSheet should work now.
echo ========================================
echo.
pause
