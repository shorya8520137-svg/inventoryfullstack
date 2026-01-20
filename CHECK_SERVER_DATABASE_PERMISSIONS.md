# 🔍 CHECK SERVER DATABASE PERMISSIONS

## 🚀 SSH INTO SERVER
```bash
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180
```

## 📊 CHECK DATABASE STRUCTURE

### 1. Connect to MySQL
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Connect to database
mysql -u inventory_user -p
# Password: StrongPass@123
```

### 2. Check Database and Tables
```sql
-- Show all databases
SHOW DATABASES;

-- Use the correct database
USE inventory_db;

-- Show all tables
SHOW TABLES;

-- Check if permission tables exist
SHOW TABLES LIKE '%permission%';
SHOW TABLES LIKE '%role%';
SHOW TABLES LIKE '%user%';
```

### 3. Check Current Admin User
```sql
-- Check admin user details
SELECT u.id, u.name, u.email, u.role_id, u.role, 
       r.name as role_name, r.display_name as role_display_name
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.email = 'admin@company.com';
```

### 4. Check Permissions System
```sql
-- Count total permissions
SELECT 'Total Permissions:' as info, COUNT(*) as count FROM permissions;

-- Count total roles
SELECT 'Total Roles:' as info, COUNT(*) as count FROM roles;

-- Count role_permissions mappings
SELECT 'Total Role-Permission Mappings:' as info, COUNT(*) as count FROM role_permissions;

-- Check admin's permissions count
SELECT 'Admin Permissions Count:' as info, COUNT(*) as count 
FROM role_permissions rp 
WHERE rp.role_id = 1;
```

### 5. Check Admin's Actual Permissions
```sql
-- Show admin's permissions (first 20)
SELECT p.name, p.display_name, p.category
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
WHERE rp.role_id = 1
ORDER BY p.category, p.name
LIMIT 20;
```

### 6. Check Database Structure
```sql
-- Check users table structure
DESCRIBE users;

-- Check permissions table structure
DESCRIBE permissions;

-- Check roles table structure
DESCRIBE roles;

-- Check role_permissions table structure
DESCRIBE role_permissions;
```

## 🔧 CHECK SERVER LOGS

### 1. Check Node.js Server Status
```bash
# Check if server is running
ps aux | grep node

# Check server logs
pm2 logs
# OR if using systemd
sudo journalctl -u your-app-name -f

# Check server directory
cd ~/inventoryfullstack
ls -la

# Check server.js
cat server.js | head -20
```

### 2. Check Database Connection
```bash
# Test database connection
mysql -u inventory_user -p -e "SELECT 'Database connection OK' as status;"
```

## 📋 REPORT BACK

After running these commands, report back:

1. **Database Status**: Does `inventory_db` exist?
2. **Tables Status**: Do `users`, `roles`, `permissions`, `role_permissions` tables exist?
3. **Admin User**: Does admin user exist? What's the role_id?
4. **Permissions Count**: How many permissions are in the system?
5. **Admin Permissions**: How many permissions does admin have?
6. **Server Status**: Is the Node.js server running?

## 🚨 QUICK DIAGNOSTIC SCRIPT

Create this file on server and run:

```bash
# Create diagnostic script
cat > check_permissions.sql << 'EOF'
USE inventory_db;

SELECT '=== DATABASE DIAGNOSTIC ===' as info;

SELECT 'Admin User:' as check_type;
SELECT u.id, u.name, u.email, u.role_id, 
       r.name as role_name, r.display_name
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
WHERE u.email = 'admin@company.com';

SELECT 'System Counts:' as check_type;
SELECT 'Permissions' as table_name, COUNT(*) as count FROM permissions
UNION ALL
SELECT 'Roles' as table_name, COUNT(*) as count FROM roles
UNION ALL
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Role-Permissions' as table_name, COUNT(*) as count FROM role_permissions;

SELECT 'Admin Permissions Sample:' as check_type;
SELECT p.name, p.category
FROM permissions p
JOIN role_permissions rp ON p.id = rp.permission_id
WHERE rp.role_id = 1
LIMIT 10;

SELECT '=== END DIAGNOSTIC ===' as info;
EOF

# Run diagnostic
mysql -u inventory_user -p < check_permissions.sql
```

This will give us the complete picture of what's actually on your server!