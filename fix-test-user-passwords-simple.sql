-- Fix test user passwords to ensure they match exactly
UPDATE users SET password = 'admin@123' WHERE email = 'admin@company.com';
UPDATE users SET password = 'manager@123' WHERE email = 'manager@test.com';
UPDATE users SET password = 'operator@123' WHERE email = 'operator@test.com';
UPDATE users SET password = 'warehouse@123' WHERE email = 'warehouse@test.com';
UPDATE users SET password = 'viewer@123' WHERE email = 'viewer@test.com';
UPDATE users SET password = 'limited@123' WHERE email = 'limited@test.com';

SELECT 'Passwords updated' as status;
SELECT id, email, password FROM users WHERE id >= 85 AND id <= 90;
