-- Create New Super Admin User with All Permissions
-- This will work immediately for your demo

-- Step 1: Create a new super admin user with hashed password
INSERT INTO users (name, email, password, password_hash, role_id, is_active) 
VALUES ('Super Admin', 'superadmin@company.com', NULL, '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 33, 1);

-- Step 2: Get the user ID we just created
SET @new_user_id = LAST_INSERT_ID();

-- Step 3: Make sure role 33 has all permissions (copy from admin role if exists)
-- First, let's ensure role 33 exists and has all permissions
INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT 33, id FROM permissions WHERE is_active = true;

-- Step 4: Verify the new user
SELECT 'New Super Admin User Created:' as status;
SELECT id, name, email, password, password_hash, role_id, is_active FROM users WHERE email = 'superadmin@company.com';

-- Step 5: Check permissions count for role 33
SELECT 'Role 33 permissions count:' as status;
SELECT COUNT(*) as permission_count FROM role_permissions WHERE role_id = 33;

-- Step 6: Show all users for verification
SELECT 'All users:' as status;
SELECT id, name, email, role_id, is_active FROM users ORDER BY id;