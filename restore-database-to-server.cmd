@echo off
echo ========================================
echo 🗄️ StockIQ Database Restoration Script
echo ========================================
echo 📊 Database: inventory_db
echo 🖥️ Server: 18.143.102.115
echo 🔑 Key: C:\Users\Admin\e2c.pem
echo 📁 Backup: C:\Users\Admin\Downloads\inventory_db_compressed (1).sql
echo ========================================

REM Check if backup file exists
if not exist "C:\Users\Admin\Downloads\inventory_db_compressed (1).sql" (
    echo ❌ Backup file not found!
    echo Please ensure the file exists at: C:\Users\Admin\Downloads\inventory_db_compressed (1).sql
    pause
    exit /b 1
)

echo.
echo 🔍 Step 1: Testing SSH Connection
echo ----------------------------------------
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@18.143.102.115 "echo '✅ SSH connection successful'"

if %ERRORLEVEL% neq 0 (
    echo ❌ SSH connection failed!
    echo Please check:
    echo   - Server IP: 18.143.102.115
    echo   - Key file: C:\Users\Admin\e2c.pem
    echo   - Key permissions
    pause
    exit /b 1
)

echo.
echo 📤 Step 2: Uploading Database Backup
echo ----------------------------------------
echo Uploading backup file to server...
scp -i "C:\Users\Admin\e2c.pem" "C:\Users\Admin\Downloads\inventory_db_compressed (1).sql" ubuntu@18.143.102.115:~/inventory_backup.sql

if %ERRORLEVEL% neq 0 (
    echo ❌ File upload failed!
    pause
    exit /b 1
)

echo ✅ Backup file uploaded successfully

echo.
echo 🔍 Step 3: Checking MySQL Installation
echo ----------------------------------------
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@18.143.102.115 "which mysql && mysql --version"

echo.
echo 🗄️ Step 4: Setting Up Database
echo ----------------------------------------
echo Creating database restoration script on server...

ssh -i "C:\Users\Admin\e2c.pem" ubuntu@18.143.102.115 "cat > ~/restore_db.sh << 'EOF'
#!/bin/bash
echo '🗄️ Database Restoration Script'
echo '=============================='

# Check if MySQL is running
if ! systemctl is-active --quiet mysql; then
    echo '🔄 Starting MySQL service...'
    sudo systemctl start mysql
    sudo systemctl enable mysql
fi

# Check MySQL status
echo '📊 MySQL Status:'
sudo systemctl status mysql --no-pager -l

# Create database and user
echo '🏗️ Setting up database and user...'
sudo mysql -e \"
CREATE DATABASE IF NOT EXISTS inventory_db;
CREATE USER IF NOT EXISTS 'inventory_user'@'localhost' IDENTIFIED BY 'StrongPass@123';
CREATE USER IF NOT EXISTS 'inventory_user'@'127.0.0.1' IDENTIFIED BY 'StrongPass@123';
GRANT ALL PRIVILEGES ON inventory_db.* TO 'inventory_user'@'localhost';
GRANT ALL PRIVILEGES ON inventory_db.* TO 'inventory_user'@'127.0.0.1';
FLUSH PRIVILEGES;
\"

if [ \$? -eq 0 ]; then
    echo '✅ Database and user created successfully'
else
    echo '❌ Failed to create database and user'
    exit 1
fi

# Check if backup file exists
if [ ! -f ~/inventory_backup.sql ]; then
    echo '❌ Backup file not found!'
    exit 1
fi

# Get backup file size
backup_size=\$(du -h ~/inventory_backup.sql | cut -f1)
echo \"📁 Backup file size: \$backup_size\"

# Restore database
echo '📥 Restoring database from backup...'
mysql -u inventory_user -pStrongPass@123 inventory_db < ~/inventory_backup.sql

if [ \$? -eq 0 ]; then
    echo '✅ Database restored successfully!'
    
    # Show database info
    echo '📊 Database Information:'
    mysql -u inventory_user -pStrongPass@123 -e \"
    USE inventory_db;
    SELECT 'Tables in database:' as info;
    SHOW TABLES;
    SELECT 'Database size:' as info;
    SELECT 
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)',
        COUNT(*) as 'Table Count'
    FROM information_schema.tables 
    WHERE table_schema = 'inventory_db';
    \"
    
    # Test connection with credentials
    echo '🔍 Testing database connection...'
    mysql -u inventory_user -pStrongPass@123 inventory_db -e \"SELECT 'Database connection successful!' as status;\"
    
else
    echo '❌ Database restoration failed!'
    exit 1
fi

# Cleanup
echo '🧹 Cleaning up backup file...'
rm -f ~/inventory_backup.sql

echo '🎉 Database restoration completed successfully!'
echo '📊 Database: inventory_db'
echo '👤 User: inventory_user'
echo '🔑 Password: StrongPass@123'
echo '🏠 Host: 127.0.0.1:3306'
EOF"

echo.
echo 🚀 Step 5: Running Database Restoration
echo ----------------------------------------
echo Making script executable and running...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@18.143.102.115 "chmod +x ~/restore_db.sh && ~/restore_db.sh"

if %ERRORLEVEL% neq 0 (
    echo ❌ Database restoration failed!
    echo.
    echo 🔧 Manual troubleshooting steps:
    echo 1. SSH to server: ssh -i "C:\Users\Admin\e2c.pem" ubuntu@18.143.102.115
    echo 2. Check MySQL: sudo systemctl status mysql
    echo 3. Install MySQL if needed: sudo apt update && sudo apt install mysql-server
    echo 4. Run restoration manually: ~/restore_db.sh
    pause
    exit /b 1
)

echo.
echo 🔍 Step 6: Verifying Database Setup
echo ----------------------------------------
echo Testing database connection and showing table structure...

ssh -i "C:\Users\Admin\e2c.pem" ubuntu@18.143.102.115 "
echo '🔍 Final Database Verification:'
mysql -u inventory_user -pStrongPass@123 inventory_db -e \"
SELECT 'Database verification:' as info;
SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema = 'inventory_db';
SELECT 'Sample tables:' as info;
SHOW TABLES LIMIT 10;
SELECT 'Users table check:' as info;
SELECT COUNT(*) as user_count FROM users LIMIT 1;
\"
"

echo.
echo ========================================
echo 🎉 DATABASE RESTORATION COMPLETE!
echo ========================================
echo ✅ Database: inventory_db restored successfully
echo ✅ User: inventory_user configured
echo ✅ Connection: 127.0.0.1:3306
echo ✅ Server: 18.143.102.115 ready
echo.
echo 🔄 Next Steps:
echo 1. Update your application's .env file if needed
echo 2. Pull latest code changes (including 2FA)
echo 3. Restart your application server
echo 4. Test the application
echo ========================================

pause