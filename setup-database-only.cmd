@echo off
echo ========================================
echo 🗄️ Database Setup Only
echo ========================================
echo 📊 Database: inventory_db
echo 🖥️ Server: 18.143.102.115
echo 🔑 Key: C:\Users\Admin\e2c.pem
echo 📁 Backup: C:\Users\Admin\Downloads\inventory_db_compressed (1).sql
echo ========================================

REM Check if backup file exists
set "BACKUP_FILE=C:\Users\Admin\Downloads\inventory_db_compressed (1).sql"
if not exist "%BACKUP_FILE%" (
    echo ❌ Backup file not found!
    echo Please check: %BACKUP_FILE%
    pause
    exit /b 1
)

echo.
echo 🔍 Step 1: Testing SSH Connection
echo ----------------------------------------
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@18.143.102.115 "echo 'SSH connection successful'"

if %ERRORLEVEL% neq 0 (
    echo ❌ SSH connection failed!
    pause
    exit /b 1
)

echo.
echo 📤 Step 2: Uploading Database Backup
echo ----------------------------------------
scp -i "C:\Users\Admin\e2c.pem" "%BACKUP_FILE%" ubuntu@18.143.102.115:~/database_backup.sql

if %ERRORLEVEL% neq 0 (
    echo ❌ File upload failed!
    pause
    exit /b 1
)

echo ✅ Database backup uploaded

echo.
echo 🗄️ Step 3: Setting Up Database
echo ----------------------------------------
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@18.143.102.115 "
echo '🔍 Checking MySQL installation...'
if ! command -v mysql >/dev/null 2>&1; then
    echo '📦 Installing MySQL...'
    sudo apt update
    sudo apt install -y mysql-server
    sudo systemctl start mysql
    sudo systemctl enable mysql
fi

echo '🔄 Starting MySQL service...'
sudo systemctl start mysql

echo '🏗️ Creating database and user...'
sudo mysql -e \"
CREATE DATABASE IF NOT EXISTS inventory_db;
CREATE USER IF NOT EXISTS 'inventory_user'@'localhost' IDENTIFIED BY 'StrongPass@123';
CREATE USER IF NOT EXISTS 'inventory_user'@'127.0.0.1' IDENTIFIED BY 'StrongPass@123';
GRANT ALL PRIVILEGES ON inventory_db.* TO 'inventory_user'@'localhost';
GRANT ALL PRIVILEGES ON inventory_db.* TO 'inventory_user'@'127.0.0.1';
FLUSH PRIVILEGES;
\"

echo '📥 Restoring database from backup...'
mysql -u inventory_user -pStrongPass@123 inventory_db < ~/database_backup.sql

if [ \$? -eq 0 ]; then
    echo '✅ Database restored successfully!'
    
    echo '📊 Database verification:'
    mysql -u inventory_user -pStrongPass@123 inventory_db -e \"
    SELECT 'Database Tables:' as info;
    SHOW TABLES;
    SELECT 'Total Tables:' as info, COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'inventory_db';
    \"
    
    echo '🔍 Testing connection:'
    mysql -u inventory_user -pStrongPass@123 inventory_db -e \"SELECT 'Connection successful!' as status;\"
    
else
    echo '❌ Database restoration failed!'
    exit 1
fi

echo '🧹 Cleaning up backup file...'
rm -f ~/database_backup.sql

echo '🎉 Database setup completed!'
"

echo.
echo ========================================
echo 🎉 DATABASE SETUP COMPLETE!
echo ========================================
echo ✅ Database: inventory_db
echo ✅ User: inventory_user
echo ✅ Password: StrongPass@123
echo ✅ Host: 127.0.0.1:3306
echo ✅ Server: 18.143.102.115
echo ========================================

pause