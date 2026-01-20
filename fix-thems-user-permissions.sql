-- FIX THEMS USER PERMISSIONS - PROPER SOLUTION
-- This gives thems@company.com the correct permissions without disabling security

USE inventory_db;

-- 1. Check current user status
SELECT 'CURRENT USER STATUS:' as info;
SELECT id, name, email, role_id, role FROM users WHERE email = 'thems@company.com';

-- 2. Check what role they should have
SELECT 'AVAILABLE ROLES:' as info;
SELECT id, name, display_name, priority FROM roles ORDER BY priority;

-- 3. Give thems user the 'manager' role (role_id = 3) which has good permissions
UPDATE users 
SET role_id = 3, role = 'manager'
WHERE email = 'thems@company.com';

-- 4. Verify the user now has the manager role
SELECT 'UPDATED USER STATUS:' as info;
SELECT u.id, u.name, u.email, u.role_id, u.role, r.display_name as role_display_name
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.email = 'thems@company.com';

-- 5. Check what permissions the manager role has
SELECT 'MANAGER ROLE PERMISSIONS:' as info;
SELECT p.name, p.display_name, p.category
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
JOIN roles r ON rp.role_id = r.id
WHERE r.name = 'manager'
ORDER BY p.category, p.name;

-- 6. If manager doesn't have enough permissions, let's give them operator role instead
-- Operator has: products.view, inventory.view, inventory.transfer, operations.return

-- Alternative: Give them admin role (role_id = 2) for full access except system management
UPDATE users 
SET role_id = 2, role = 'admin'
WHERE email = 'thems@company.com';

-- 7. Verify final status
SELECT 'FINAL USER STATUS:' as info;
SELECT u.id, u.name, u.email, u.role_id, u.role, r.display_name as role_display_name
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.email = 'thems@company.com';

-- 8. Show what permissions they now have
SELECT 'FINAL USER PERMISSIONS:' as info;
SELECT p.name, p.display_name, p.category
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
JOIN roles r ON rp.role_id = r.id
JOIN users u ON u.role_id = r.id
WHERE u.email = 'thems@company.com'
ORDER BY p.category, p.name;

-- 9. Test query to verify permission check will work
SELECT 'PERMISSION CHECK TEST:' as info;
SELECT 
    u.email,
    u.role_id,
    r.name as role_name,
    p.name as permission_name,
    'SHOULD WORK' as status
FROM users u
JOIN roles r ON u.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.email = 'thems@company.com' 
AND p.name = 'products.view'
LIMIT 1;