-- Safe Database Cleanup with Foreign Key Handling
USE inventory_db;

-- Disable foreign key checks temporarily
SET FOREIGN_KEY_CHECKS = 0;

SELECT 'Starting safe database cleanup...' as status;

-- =====================================================
-- STEP 1: BACKUP ADMIN USER DATA
-- =====================================================
SELECT 'Backing up admin user...' as status;

-- Store admin user info
CREATE TEMPORARY TABLE temp_admin_backup AS
SELECT * FROM users WHERE email = 'admin@company.com';

-- =====================================================
-- STEP 2: CLEAN UP RELATED TABLES FIRST
-- =====================================================
SELECT 'Cleaning up related tables...' as status;

-- Clean up conversation participants (if table exists)
DELETE FROM conversation_participants WHERE user_id NOT IN (
    SELECT id FROM users WHERE email = 'admin@company.com'
);

-- Clean up any other user-related foreign key references
-- Add more cleanup as needed based on your schema

-- =====================================================
-- STEP 3: DELETE ALL USERS EXCEPT ADMIN
-- =====================================================
SELECT 'Deleting all users except admin...' as status;

-- Delete all users except admin
DELETE FROM users WHERE email != 'admin@company.com';

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Verify only admin remains
SELECT COUNT(*) as remaining_users FROM users;
SELECT id, name, email, role_name FROM users;

-- =====================================================
-- STEP 4: CLEAN UP DUPLICATE PERMISSIONS
-- =====================================================
SELECT 'Cleaning up duplicate permissions...' as status;

-- Remove old format permissions (UPPERCASE duplicates)
DELETE FROM permissions WHERE name IN (
    'DASHBOARD_VIEW', 'DASHBOARD_STATS', 'DASHBOARD_CHARTS', 'DASHBOARD_EXPORT', 'DASHBOARD_CUSTOMIZE',
    'INVENTORY_VIEW', 'INVENTORY_CREATE', 'INVENTORY_EDIT', 'INVENTORY_DELETE', 'INVENTORY_BULK_UPLOAD',
    'INVENTORY_BULK_EXPORT', 'INVENTORY_TRANSFER', 'INVENTORY_ADJUST', 'INVENTORY_AUDIT', 'INVENTORY_TIMELINE', 'INVENTORY_REPORTS',
    'ORDERS_VIEW', 'ORDERS_CREATE', 'ORDERS_EDIT', 'ORDERS_DELETE', 'ORDERS_PROCESS', 'ORDERS_DISPATCH',
    'ORDERS_RETURNS', 'ORDERS_BULK_PROCESS', 'ORDERS_EXPORT', 'ORDERS_REPORTS',
    'PRODUCTS_VIEW', 'PRODUCTS_CREATE', 'PRODUCTS_EDIT', 'PRODUCTS_DELETE', 'PRODUCTS_BULK_IMPORT',
    'PRODUCTS_BULK_EXPORT', 'PRODUCTS_CATEGORIES', 'PRODUCTS_PRICING', 'PRODUCTS_REPORTS',
    'OPERATIONS_DAMAGE_RECORD', 'OPERATIONS_DAMAGE_RECOVER', 'OPERATIONS_WAREHOUSE_MANAGE',
    'OPERATIONS_STAFF_MANAGE', 'OPERATIONS_QUALITY_CONTROL', 'OPERATIONS_REPORTS',
    'SYSTEM_USER_MANAGEMENT', 'SYSTEM_ROLE_MANAGEMENT', 'SYSTEM_PERMISSION_MANAGEMENT',
    'SYSTEM_SETTINGS', 'SYSTEM_BACKUP', 'SYSTEM_RESTORE', 'SYSTEM_AUDIT_LOG',
    'SYSTEM_MAINTENANCE', 'SYSTEM_MONITORING', 'SYSTEM_INTEGRATION'
);

-- Remove permissions for disabled modules
DELETE FROM permissions WHERE category IN ('TRACKING', 'MESSAGES', 'DASHBOARD');

-- =====================================================
-- STEP 5: INSERT CLEAN PERMISSION STRUCTURE
-- =====================================================
SELECT 'Setting up clean permission structure...' as status;

-- Clear existing permissions and start fresh
DELETE FROM permissions;

-- Insert clean permission structure (28 permissions total)

-- Products (8 permissions)
INSERT INTO permissions (name, display_name, description, category, is_active) VALUES
('products.view', 'View Products', 'View product catalog and details', 'products', 1),
('products.create', 'Create Products', 'Add new products to catalog', 'products', 1),
('products.edit', 'Edit Products', 'Modify existing product information', 'products', 1),
('products.delete', 'Delete Products', 'Remove products from catalog', 'products', 1),
('products.categories', 'Manage Categories', 'Manage product categories and classifications', 'products', 1),
('products.bulk_import', 'Bulk Import Products', 'Import products in bulk via CSV', 'products', 1),
('products.export', 'Export Products', 'Export product data', 'products', 1),
('products.self_transfer', 'Self Transfer', 'Create self transfer operations', 'products', 1);

-- Inventory (6 permissions)
INSERT INTO permissions (name, display_name, description, category, is_active) VALUES
('inventory.view', 'View Inventory', 'View inventory items and stock levels', 'inventory', 1),
('inventory.timeline', 'View Timeline', 'View product movement timeline', 'inventory', 1),
('inventory.bulk_upload', 'Bulk Upload', 'Bulk upload inventory via CSV', 'inventory', 1),
('inventory.transfer', 'Transfer Stock', 'Transfer inventory between warehouses', 'inventory', 1),
('inventory.adjust', 'Adjust Inventory', 'Adjust inventory quantities', 'inventory', 1),
('inventory.export', 'Export Inventory', 'Export inventory data', 'inventory', 1);

-- Orders (6 permissions)
INSERT INTO permissions (name, display_name, description, category, is_active) VALUES
('orders.view', 'View Orders', 'View order list and details', 'orders', 1),
('orders.create', 'Create Orders', 'Create new orders', 'orders', 1),
('orders.edit', 'Edit Orders', 'Modify existing orders', 'orders', 1),
('orders.delete', 'Delete Orders', 'Cancel or delete orders', 'orders', 1),
('orders.status_update', 'Update Status', 'Update order status', 'orders', 1),
('orders.export', 'Export Orders', 'Export order data and reports', 'orders', 1);

-- Operations (5 permissions)
INSERT INTO permissions (name, display_name, description, category, is_active) VALUES
('operations.dispatch', 'Dispatch Operations', 'Create and manage dispatch operations', 'operations', 1),
('operations.damage', 'Damage Management', 'Handle damage reporting and recovery', 'operations', 1),
('operations.return', 'Return Processing', 'Process product returns', 'operations', 1),
('operations.bulk', 'Bulk Operations', 'Perform bulk inventory operations', 'operations', 1),
('operations.self_transfer', 'Self Transfer Operations', 'Self transfer operations via modal', 'operations', 1);

-- System (3 permissions)
INSERT INTO permissions (name, display_name, description, category, is_active) VALUES
('system.user_management', 'User Management', 'Manage system users and accounts', 'system', 1),
('system.role_management', 'Role Management', 'Manage user roles and permissions', 'system', 1),
('system.audit_log', 'Audit Log', 'View system audit logs and user activities', 'system', 1);

-- =====================================================
-- STEP 6: ENSURE SUPER_ADMIN ROLE EXISTS
-- =====================================================
SELECT 'Setting up super_admin role...' as status;

-- Ensure super_admin role exists
INSERT IGNORE INTO roles (name, display_name, description, color, priority) VALUES
('super_admin', 'Super Admin', 'Full system access with all permissions', '#dc2626', 1);

-- Get super_admin role ID
SET @super_admin_role_id = (SELECT id FROM roles WHERE name = 'super_admin');

-- =====================================================
-- STEP 7: ASSIGN ALL PERMISSIONS TO SUPER_ADMIN ROLE
-- =====================================================
SELECT 'Assigning all permissions to super_admin role...' as status;

-- Clear existing role permissions for super_admin
DELETE FROM role_permissions WHERE role_id = @super_admin_role_id;

-- Assign ALL permissions to super_admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT @super_admin_role_id, id FROM permissions WHERE is_active = 1;

-- =====================================================
-- STEP 8: ENSURE ADMIN USER HAS SUPER_ADMIN ROLE
-- =====================================================
SELECT 'Ensuring admin user has super_admin role...' as status;

-- Update admin user to have super_admin role
UPDATE users 
SET role_id = @super_admin_role_id,
    role_name = 'super_admin'
WHERE email = 'admin@company.com';

-- =====================================================
-- STEP 9: VERIFICATION
-- =====================================================
SELECT 'Verification Results:' as status;

-- Show final user count
SELECT COUNT(*) as total_users FROM users;

-- Show admin user details
SELECT id, name, email, role_name, role_id FROM users WHERE email = 'admin@company.com';

-- Show total permissions
SELECT COUNT(*) as total_permissions FROM permissions WHERE is_active = 1;

-- Show permissions by category
SELECT category, COUNT(*) as permission_count 
FROM permissions 
WHERE is_active = 1 
GROUP BY category 
ORDER BY category;

-- Show super_admin role permissions count
SELECT 
    r.name as role_name,
    r.display_name,
    COUNT(rp.permission_id) as assigned_permissions
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
WHERE r.name = 'super_admin'
GROUP BY r.id, r.name, r.display_name;

SELECT 'Database cleanup and permission setup completed successfully!' as final_status;