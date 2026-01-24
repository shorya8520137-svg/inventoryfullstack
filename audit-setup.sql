-- Audit System Setup for inventory_db
-- Run this on your server: mysql -u inventory_user -p inventory_db < audit-setup.sql

USE inventory_db;

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    
    -- User Information
    user_id INT,
    user_name VARCHAR(255),
    user_email VARCHAR(255),
    user_role VARCHAR(100),
    
    -- Action Details
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(50),
    resource_name VARCHAR(255),
    
    -- Human-readable description
    description TEXT NOT NULL,
    
    -- Detailed information (JSON)
    details JSON,
    
    -- Request Information
    ip_address VARCHAR(45),
    user_agent TEXT,
    request_method VARCHAR(10),
    request_url VARCHAR(500),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes for performance
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_resource (resource_type, resource_id),
    INDEX idx_created_at (created_at),
    INDEX idx_user_action (user_id, action)
);

-- Insert sample audit data with realistic examples
INSERT INTO audit_logs (
    user_name, user_email, user_role, action, resource_type, resource_id, 
    resource_name, description, details, ip_address
) VALUES 
(
    'Shorya', 'shorya@company.com', 'Manager', 'DISPATCH', 'product', '123',
    'Samsung Galaxy S24', 'Shorya dispatched 50 units of Samsung Galaxy S24 to Delhi warehouse',
    '{"quantity": 50, "warehouse": "Delhi", "awb_number": "AWB123456789", "courier": "BlueDart"}',
    '192.168.1.100'
),
(
    'Admin', 'admin@company.com', 'Administrator', 'RETURN', 'product', '456',
    'iPhone 15 Pro', 'Admin processed return of 10 units of iPhone 15 Pro',
    '{"quantity": 10, "reason": "Customer complaint - Screen defect", "awb_number": "AWB987654321", "refund_amount": 120000}',
    '192.168.1.101'
),
(
    'Rajesh', 'rajesh@company.com', 'Operator', 'DAMAGE', 'product', '789',
    'MacBook Air M2', 'Rajesh reported damage for 2 units of MacBook Air M2',
    '{"quantity": 2, "reason": "Water damage during transport", "location": "Warehouse Mumbai", "estimated_loss": 200000}',
    '192.168.1.102'
),
(
    'Priya', 'priya@company.com', 'Manager', 'BULK_UPLOAD', 'inventory', 'bulk_001',
    'January Inventory Upload', 'Priya uploaded bulk inventory file with 1,500 items',
    '{"filename": "inventory_jan_2025.xlsx", "total_items": 1500, "processed": 1485, "errors": 15}',
    '192.168.1.103'
),
(
    'Amit', 'amit@company.com', 'Warehouse Staff', 'TRANSFER', 'product', '321',
    'OnePlus 12', 'Amit self-transferred 25 units from Mumbai to Delhi',
    '{"quantity": 25, "from_warehouse": "Mumbai", "to_warehouse": "Delhi", "transfer_id": "TRF2025001"}',
    '192.168.1.104'
),
(
    'Admin', 'admin@company.com', 'Administrator', 'LOGIN', 'session', 'sess_001',
    'User Login', 'Admin logged into the system',
    '{"browser": "Chrome 120.0", "os": "Windows 11", "login_time": "2025-01-24 14:30:00"}',
    '192.168.1.100'
);

-- Verify the setup
SELECT 'Audit table created successfully' as status;
SELECT COUNT(*) as sample_records FROM audit_logs;
SELECT action, COUNT(*) as count FROM audit_logs GROUP BY action;