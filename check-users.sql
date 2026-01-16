USE inventory_db;

-- Check all users
SELECT id, name, email, role_id, is_active FROM users ORDER BY id DESC LIMIT 10;

-- Check admin users specifically
SELECT id, name, email, role_id, is_active FROM users WHERE email = 'admin@company.com';

-- Check roles
SELECT id, name, display_name FROM roles;