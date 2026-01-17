-- ===============================================
-- CLEAN ALL USERS AND CREATE FRESH ADMIN USER
-- ===============================================

-- Step 1: Delete all existing users
DELETE FROM users;

-- Step 2: Reset auto increment
ALTER TABLE users AUTO_INCREMENT = 1;

-- Step 3: Create admin role if not exists (with all permissions)
INSERT IGNORE INTO roles (id, name, display_name, description, color, priority, is_active) 
VALUES (1, 'super_admin', 'Super Administrator', 'Full system access with all permissions', '#dc2626', 1, 1);

-- Step 4: Assign ALL permissions to admin role
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions WHERE is_active = true;

-- Step 5: Create fresh admin user with bcrypt hashed password
-- Password: admin@123 (bcrypt hash)
INSERT INTO users (
    id, 
    name, 
    email, 
    password, 
    role_id, 
    is_active, 
    created_at
) VALUES (
    1,
    'System Administrator',
    'admin@company.com',
    '$2b$10$GzM6cJby8wqamliTCdfAuuJ9zAoYGo.ex82UOU.eksB/6Psn/veGS',
    1,
    1,
    NOW()
);

-- Step 6: Verify the setup
SELECT 'ADMIN USER CREATED:' as status;
SELECT id, name, email, role_id, is_active FROM users WHERE email = 'admin@company.com';

SELECT 'ADMIN PERMISSIONS COUNT:' as status;
SELECT COUNT(*) as total_permissions FROM role_permissions WHERE role_id = 1;

SELECT 'ALL PERMISSIONS ASSIGNED:' as status;
SELECT p.name, p.display_name, p.category
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
WHERE rp.role_id = 1
ORDER BY p.category, p.name;