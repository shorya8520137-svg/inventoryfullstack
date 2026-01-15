-- Create self_transfer table to store complete transfer details including dimensions
CREATE TABLE IF NOT EXISTS self_transfer (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    transfer_reference VARCHAR(255) NOT NULL UNIQUE,
    order_ref VARCHAR(100),
    transfer_type VARCHAR(50) NOT NULL, -- 'warehouse-to-warehouse', 'store-to-store', etc.
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

-- Create self_transfer_items table for individual products
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
