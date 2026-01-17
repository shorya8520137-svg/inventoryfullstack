-- FINAL PERMISSION CLEANUP - Remove ALL duplicates and set clean 28 permissions
-- This will ensure the permissions tab shows clean data

-- Step 1: Backup current permissions (just in case)
CREATE TABLE IF NOT EXISTS permissions_backup_final AS 
SELECT * FROM permissions WHERE is_active = true;

-- Step 2: Remove ALL existing permissions and role_permissions
DELETE FROM role_permissions;
DELETE FROM permissions;

-- Step 3: Insert ONLY the clean 28 permissions
INSERT INTO permissions (name, display_name, category, description, is_active) VALUES
-- Products permissions (8)
('products.view', 'View Products', 'products', 'View product catalog and details', true),
('products.create', 'Create Products', 'products', 'Add new products to catalog', true),
('products.edit', 'Edit Products', 'products', 'Modify existing product information', true),
('products.delete', 'Delete Products', 'products', 'Remove products from catalog', true),
('products.categories', 'Manage Categories', 'products', 'Manage product categories and classifications', true),
('products.bulk_import', 'Bulk Import Products', 'products', 'Import products in bulk via CSV', true),
('products.export', 'Export Products', 'products', 'Export product data', true),
('products.self_transfer', 'Product Self Transfer', 'products', 'Create self transfer operations', true),

-- Inventory permissions (6)
('inventory.view', 'View Inventory', 'inventory', 'View inventory items and stock levels', true),
('inventory.timeline', 'View Timeline', 'inventory', 'View product movement timeline', true),
('inventory.bulk_upload', 'Bulk Upload Inventory', 'inventory', 'Bulk upload inventory via CSV', true),
('inventory.transfer', 'Transfer Inventory', 'inventory', 'Transfer inventory between warehouses', true),
('inventory.adjust', 'Adjust Inventory', 'inventory', 'Adjust inventory quantities', true),
('inventory.export', 'Export Inventory', 'inventory', 'Export inventory data', true),

-- Orders permissions (6)
('orders.view', 'View Orders', 'orders', 'View order list and details', true),
('orders.create', 'Create Orders', 'orders', 'Create new orders', true),
('orders.edit', 'Edit Orders', 'orders', 'Modify existing orders', true),
('orders.delete', 'Delete Orders', 'orders', 'Cancel or delete orders', true),
('orders.status_update', 'Update Order Status', 'orders', 'Update order status', true),
('orders.export', 'Export Orders', 'orders', 'Export order data and reports', true),

-- Operations permissions (5)
('operations.dispatch', 'Dispatch Operations', 'operations', 'Create and manage dispatch operations', true),
('operations.damage', 'Damage Management', 'operations', 'Handle damage reporting and recovery', true),
('operations.return', 'Return Processing', 'operations', 'Process product returns', true),
('operations.bulk', 'Bulk Operations', 'operations', 'Perform bulk inventory operations', true),
('operations.self_transfer', 'Self Transfer Operations', 'operations', 'Self transfer operations via modal', true),

-- System permissions (3)
('system.user_management', 'User Management', 'system', 'Manage system users and accounts', true),
('system.role_management', 'Role Management', 'system', 'Manage user roles and permissions', true),
('system.audit_log', 'Audit Logs', 'system', 'View system audit logs and user activities', true);

-- Step 4: Assign ALL 28 permissions to super_admin role (role_id = 1)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions WHERE is_active = true;

-- Step 5: Verify the cleanup
SELECT 'VERIFICATION RESULTS:' as status;

SELECT 
    'Total Permissions:' as metric,
    COUNT(*) as value
FROM permissions 
WHERE is_active = true;

SELECT 
    'Permissions by Category:' as metric,
    category,
    COUNT(*) as count
FROM permissions 
WHERE is_active = true
GROUP BY category
ORDER BY category;

SELECT 
    'Super Admin Permissions:' as metric,
    COUNT(*) as value
FROM role_permissions rp
JOIN permissions p ON rp.permission_id = p.id
WHERE rp.role_id = 1 AND p.is_active = true;

SELECT 
    'Duplicate Check:' as metric,
    name,
    COUNT(*) as duplicates
FROM permissions 
WHERE is_active = true
GROUP BY name
HAVING COUNT(*) > 1;

-- If no duplicates found, this should return no rows
SELECT 'No duplicates found - SUCCESS!' as result
WHERE NOT EXISTS (
    SELECT 1 FROM permissions 
    WHERE is_active = true
    GROUP BY name
    HAVING COUNT(*) > 1
);