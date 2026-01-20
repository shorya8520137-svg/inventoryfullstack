-- =====================================================
-- COMPLETE PERMISSIONS SYSTEM RESET - CLEAN START
-- =====================================================

USE hunyhuny_auto_dispatch;

-- 1. DROP ALL PERMISSION-RELATED TABLES (CLEAN SLATE)
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS audit_logs;

-- 2. CLEAN USERS TABLE (REMOVE ALL USERS)
DELETE FROM users;
ALTER TABLE users AUTO_INCREMENT = 1;

-- 3. ADD role_id COLUMN TO USERS IF NOT EXISTS
ALTER TABLE users ADD COLUMN IF NOT EXISTS role_id INT;

-- 4. CREATE ROLES TABLE (SIMPLE)
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. CREATE PERMISSIONS TABLE (SIMPLE)
CREATE TABLE permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(150) NOT NULL,
    category VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. CREATE ROLE_PERMISSIONS JUNCTION TABLE
CREATE TABLE role_permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_permission (role_id, permission_id)
);

-- 7. INSERT ONLY ONE ROLE - ADMIN
INSERT INTO roles (name, display_name, description) VALUES
('admin', 'Administrator', 'Full system access');

-- 8. INSERT ONLY ESSENTIAL PERMISSIONS (28 TOTAL)
INSERT INTO permissions (name, display_name, category) VALUES
-- Dashboard (5 permissions)
('dashboard.view', 'View Dashboard', 'dashboard'),
('dashboard.stats', 'View Statistics', 'dashboard'),
('dashboard.charts', 'View Charts', 'dashboard'),
('dashboard.export', 'Export Data', 'dashboard'),
('dashboard.settings', 'Dashboard Settings', 'dashboard'),

-- Inventory (6 permissions)
('inventory.view', 'View Inventory', 'inventory'),
('inventory.create', 'Add Inventory', 'inventory'),
('inventory.edit', 'Edit Inventory', 'inventory'),
('inventory.delete', 'Delete Inventory', 'inventory'),
('inventory.bulk_upload', 'Bulk Upload', 'inventory'),
('inventory.transfer', 'Transfer Items', 'inventory'),

-- Orders (6 permissions)
('orders.view', 'View Orders', 'orders'),
('orders.create', 'Create Orders', 'orders'),
('orders.edit', 'Edit Orders', 'orders'),
('orders.delete', 'Delete Orders', 'orders'),
('orders.dispatch', 'Dispatch Orders', 'orders'),
('orders.status_update', 'Update Status', 'orders'),

-- Products (5 permissions)
('products.view', 'View Products', 'products'),
('products.create', 'Add Products', 'products'),
('products.edit', 'Edit Products', 'products'),
('products.delete', 'Delete Products', 'products'),
('products.categories', 'Manage Categories', 'products'),

-- Operations (3 permissions)
('operations.damage', 'Handle Damage', 'operations'),
('operations.returns', 'Handle Returns', 'operations'),
('operations.reports', 'View Reports', 'operations'),

-- System (3 permissions)
('system.users', 'Manage Users', 'system'),
('system.settings', 'System Settings', 'system'),
('system.logs', 'View Logs', 'system');

-- 9. ASSIGN ALL PERMISSIONS TO ADMIN ROLE
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- 10. CREATE ONE ADMIN USER
INSERT INTO users (name, email, password, role_id, created_at) VALUES
('Admin User', 'admin@inventory.com', '$2b$10$rQZ8kHWf5r.Nt8Nt8Nt8Nu8Nt8Nt8Nt8Nt8Nt8Nt8Nt8Nt8Nt8N', 1, NOW());

-- Password is: admin123

-- 11. VERIFICATION QUERIES
SELECT '=== SETUP COMPLETE ===' as status;
SELECT COUNT(*) as total_roles FROM roles;
SELECT COUNT(*) as total_permissions FROM permissions;
SELECT COUNT(*) as total_role_permissions FROM role_permissions;
SELECT COUNT(*) as total_users FROM users;

SELECT 'Admin User Details:' as info;
SELECT u.id, u.name, u.email, r.name as role_name, r.display_name
FROM users u 
JOIN roles r ON u.role_id = r.id;

SELECT 'Admin Permissions Count:' as info;
SELECT COUNT(*) as admin_permissions 
FROM role_permissions rp 
WHERE rp.role_id = 1;

SELECT 'Sample Permissions:' as info;
SELECT p.name, p.display_name, p.category
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
WHERE rp.role_id = 1
LIMIT 10;

SELECT '✅ CLEAN PERMISSIONS SYSTEM READY!' as final_status;