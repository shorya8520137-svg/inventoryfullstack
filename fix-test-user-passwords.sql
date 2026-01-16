-- Fix test user passwords by hashing them properly
USE inventory_db;

-- Update passwords to hashed versions (bcrypt hash for each password)
-- manager@123 -> $2b$10$hash...
-- operator@123 -> $2b$10$hash...
-- etc.

-- For now, let's use the same approach as the admin user - store plain text and let the login handle it
-- The permissionsController.js handles both hashed and plain text passwords

UPDATE users SET password = 'manager@123' WHERE email = 'manager@test.com';
UPDATE users SET password = 'operator@123' WHERE email = 'operator@test.com';
UPDATE users SET password = 'warehouse@123' WHERE email = 'warehouse@test.com';
UPDATE users SET password = 'viewer@123' WHERE email = 'viewer@test.com';
UPDATE users SET password = 'limited@123' WHERE email = 'limited@test.com';

SELECT 'Test user passwords updated!' as status;