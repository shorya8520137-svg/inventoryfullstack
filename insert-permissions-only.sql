-- =====================================================
-- INSERT PERMISSIONS DATA ONLY
-- =====================================================

-- Insert permissions using existing table structure
INSERT INTO permissions (name, display_name, description, category) VALUES
-- Dashboard
('dashboard.view', 'View Dashboard', 'View dashboard', 'dashboard'),
-- Products
('products.view', 'View Products', 'View products', 'products'),
('products.create', 'Create Products', 'Create new products', 'products'),
('products.edit', 'Edit Products', 'Edit existing products', 'products'),
('products.delete', 'Delete Products', 'Delete products', 'products'),
-- Inventory
('inventory.view', 'View Inventory', 'View inventory', 'inventory'),
('inventory.add', 'Add Inventory', 'Add inventory stock', 'inventory'),
('inventory.adjust', 'Adjust Inventory', 'Adjust inventory quantities', 'inventory'),
('inventory.bulk_upload', 'Bulk Upload', 'Bulk upload inventory', 'inventory'),
-- Dispatch
('dispatch.view', 'View Dispatches', 'View dispatches', 'dispatch'),
('dispatch.create', 'Create Dispatch', 'Create new dispatch', 'dispatch'),
('dispatch.edit', 'Edit Dispatch', 'Edit dispatch details', 'dispatch'),
('dispatch.delete', 'Delete Dispatch', 'Delete dispatch', 'dispatch'),
('dispatch.status_update', 'Update Status', 'Update dispatch status', 'dispatch'),
-- Order Tracking
('orders.view', 'View Orders', 'View order tracking', 'orders'),
('orders.timeline', 'View Timeline', 'View order timeline', 'orders'),
('orders.export', 'Export Orders', 'Export order data', 'orders'),
-- Self Transfer
('self_transfer.view', 'View Self Transfers', 'View self transfers', 'self_transfer'),
('self_transfer.create', 'Create Self Transfer', 'Create self transfer', 'self_transfer'),
-- Damage Recovery
('damage.view', 'View Damage', 'View damage records', 'damage'),
('damage.report', 'Report Damage', 'Report damage', 'damage'),
('damage.recover', 'Recover Damage', 'Recover from damage', 'damage'),
-- Returns
('returns.view', 'View Returns', 'View returns', 'returns'),
('returns.process', 'Process Returns', 'Process returns', 'returns'),
-- Users & Permissions
('users.view', 'View Users', 'View users', 'users'),
('users.create', 'Create Users', 'Create new users', 'users'),
('users.edit', 'Edit Users', 'Edit user details', 'users'),
('users.delete', 'Delete Users', 'Delete users', 'users'),
('permissions.manage', 'Manage Permissions', 'Manage permissions', 'permissions')
ON DUPLICATE KEY UPDATE display_name = VALUES(display_name), description = VALUES(description);

-- Get admin role ID
SET @admin_role_id = (SELECT id FROM roles WHERE name = 'admin' LIMIT 1);

-- Assign ALL permissions to admin role
INSERT INTO role_permissions (role_id, permission_id)
SELECT @admin_role_id, id FROM permissions
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- Verification
SELECT '✅ Permissions inserted' as status, COUNT(*) as count FROM permissions;
SELECT '✅ Admin permissions assigned' as status, COUNT(*) as count FROM role_permissions WHERE role_id = @admin_role_id;
SELECT '✅ Setup completed!' as status;
