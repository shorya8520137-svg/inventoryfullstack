# 🔍 COMPLETE SERVER TEST COMMANDS

You're already in MySQL! Perfect. Run these commands step by step:

## 📊 **Step 1: Database Analysis (In MySQL)**

```sql
-- Switch to inventory database
USE inventory_db;

-- Check users table
SELECT COUNT(*) as total_users FROM users;
SELECT id, username, email, role, created_at FROM users LIMIT 5;

-- Check roles table
SELECT COUNT(*) as total_roles FROM roles;
SELECT * FROM roles LIMIT 5;

-- Check permissions table
SELECT COUNT(*) as total_permissions FROM permissions;
SELECT * FROM permissions LIMIT 10;

-- Check if admin user exists
SELECT * FROM users WHERE email LIKE '%admin%' OR username LIKE '%admin%';

-- Exit MySQL
EXIT;
```

## 🧪 **Step 2: API Testing (In Terminal)**

After exiting MySQL, run these commands:

```bash
# Go to project directory
cd /home/ubuntu/inventoryfullstack

# Test server health
echo "=== HEALTH CHECK ==="
curl -s http://localhost:5000/

# Test login API
echo -e "\n=== LOGIN TEST ==="
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}'

# If login fails, try with username
echo -e "\n=== LOGIN TEST 2 ==="
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Check server logs
echo -e "\n=== SERVER LOGS ==="
tail -20 server.log 2>/dev/null || echo "No server.log found"

# Check auth controller
echo -e "\n=== AUTH CONTROLLER ==="
head -20 controllers/authController.js
```

## 🎯 **Step 3: If Login Works, Test Protected APIs**

If you get a token from login, replace `YOUR_TOKEN_HERE` with the actual token:

```bash
TOKEN="YOUR_TOKEN_HERE"

# Test Users API
echo "=== USERS API ==="
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/users

# Test Roles API
echo -e "\n=== ROLES API ==="
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/roles

# Test Permissions API
echo -e "\n=== PERMISSIONS API ==="
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/permissions

# Test Products API
echo -e "\n=== PRODUCTS API ==="
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/products
```

## 📋 **What to Look For:**

1. **Users table** - How many users? Any admin users?
2. **Roles table** - What roles exist?
3. **Permissions table** - What permissions are defined?
4. **Login API** - Does it return a token or error?
5. **Protected APIs** - Do they work with token?

## 🔧 **Expected Issues & Solutions:**

### If No Users Found:
```sql
-- Create admin user (run in MySQL)
USE inventory_db;
INSERT INTO users (username, email, password, role, created_at) 
VALUES ('admin', 'admin@admin.com', '$2b$10$hashedpassword', 'admin', NOW());
```

### If Login Fails:
- Check authController.js for expected field names
- Check if password hashing is working
- Check JWT_SECRET in .env

### If No Roles/Permissions:
```sql
-- Create basic roles
INSERT INTO roles (name, description) VALUES 
('admin', 'Administrator'),
('manager', 'Manager'),
('user', 'Regular User');

-- Create basic permissions
INSERT INTO permissions (name, description) VALUES 
('read_users', 'Read users'),
('write_users', 'Write users'),
('read_products', 'Read products'),
('write_products', 'Write products');
```

Run these commands and let me know what you find! This will give us the complete picture.