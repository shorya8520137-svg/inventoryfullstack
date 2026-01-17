-- Fix Admin Password Issue
-- The admin user exists but password validation is failing

-- Step 1: Check current admin user
SELECT 'Current admin user:' as status;
SELECT id, name, email, password, password_hash, role_id FROM users WHERE email = 'admin@company.com';

-- Step 2: Update admin password to plain text (temporary for testing)
UPDATE users SET password = 'admin@123', password_hash = NULL WHERE email = 'admin@company.com';

-- Step 3: Verify the update
SELECT 'Updated admin user:' as status;
SELECT id, name, email, password, password_hash, role_id FROM users WHERE email = 'admin@company.com';

-- Step 4: Also check if user has proper role
SELECT 'Admin user role info:' as status;
SELECT u.id, u.name, u.email, u.role_id, r.name as role_name, r.display_name 
FROM users u 
JOIN roles r ON u.role_id = r.id 
WHERE u.email = 'admin@company.com';

-- Step 5: Ensure admin role exists and has ID 1
SELECT 'Admin role check:' as status;
SELECT id, name, display_name FROM roles WHERE id = 1 OR name LIKE '%admin%';

-- Step 6: If admin role doesn't exist with ID 1, create it
INSERT IGNORE INTO roles (id, name, display_name, description, color, priority, is_active) 
VALUES (1, 'super_admin', 'Super Admin', 'System Administrator with full access', '#dc2626', 1, 1);

-- Step 7: Update admin user to use role ID 1
UPDATE users SET role_id = 1 WHERE email = 'admin@company.com';

-- Step 8: Final verification
SELECT 'Final admin user verification:' as status;
SELECT u.id, u.name, u.email, u.password, u.role_id, r.name as role_name, r.display_name 
FROM users u 
JOIN roles r ON u.role_id = r.id 
WHERE u.email = 'admin@company.com';