-- ADD TRACKING PERMISSIONS TO DATABASE
-- Run this script on the server to add tracking permissions

USE inventory_db;

-- Add tracking permissions
INSERT IGNORE INTO permissions (name, display_name, description, category, created_at) VALUES
('TRACKING_VIEW', 'View Tracking', 'View tracking information and status', 'tracking', NOW()),
('TRACKING_CREATE', 'Create Tracking', 'Create new tracking entries', 'tracking', NOW()),
('TRACKING_EDIT', 'Edit Tracking', 'Edit existing tracking information', 'tracking', NOW()),
('TRACKING_DELETE', 'Delete Tracking', 'Delete tracking entries', 'tracking', NOW()),
('TRACKING_EXPORT', 'Export Tracking', 'Export tracking data and reports', 'tracking', NOW()),
('TRACKING_TIMELINE', 'Tracking Timeline', 'View tracking timeline and history', 'tracking', NOW()),
('TRACKING_BULK', 'Bulk Tracking Operations', 'Perform bulk tracking operations', 'tracking', NOW());

-- Get super_admin role ID and assign all tracking permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, NOW()
FROM roles r
CROSS JOIN permissions p
WHERE (r.name = 'super_admin' OR r.name = 'Super Admin')
AND (p.category = 'tracking' OR p.name LIKE 'TRACKING_%');

-- Verify the permissions were added
SELECT 'TRACKING PERMISSIONS ADDED:' as status;
SELECT name, display_name, description, category 
FROM permissions 
WHERE category = 'tracking' OR name LIKE 'TRACKING_%'
ORDER BY name;

-- Verify super admin has the permissions
SELECT 'SUPER ADMIN TRACKING PERMISSIONS:' as status;
SELECT p.name, p.display_name
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
JOIN roles r ON rp.role_id = r.id
WHERE (r.name = 'super_admin' OR r.name = 'Super Admin')
AND (p.category = 'tracking' OR p.name LIKE 'TRACKING_%')
ORDER BY p.name;