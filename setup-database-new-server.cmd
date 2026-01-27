@echo off
echo ========================================
echo Database Setup Script for New Server
echo ========================================
echo Server: 54.179.63.233
echo Database: inventory_db
echo SSH Key: C:\Users\Admin\e2c.pem
echo Backup: C:\Users\Admin\Downloads\inventory_db_compressed (1).sql\inventory_db_compressed (1).sql
echo ========================================

echo.
echo Step 1: Testing SSH Connection...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "echo 'SSH connection successful'"

if %ERRORLEVEL% neq 0 (
    echo ERROR: SSH connection failed
    echo Please check:
    echo 1. SSH key path: C:\Users\Admin\e2c.pem
    echo 2. Server IP: 54.179.63.233
    echo 3. Network connectivity
    pause
    exit /b 1
)

echo.
echo Step 2: Uploading database backup...
echo Source: "C:\Users\Admin\Downloads\inventory_db_compressed (1).sql\inventory_db_compressed (1).sql"
echo Target: ubuntu@54.179.63.233:~/backup.sql

scp -i "C:\Users\Admin\e2c.pem" "C:\Users\Admin\Downloads\inventory_db_compressed (1).sql\inventory_db_compressed (1).sql" ubuntu@54.179.63.233:~/backup.sql

if %ERRORLEVEL% neq 0 (
    echo ERROR: File upload failed
    echo Please check:
    echo 1. File exists at: C:\Users\Admin\Downloads\inventory_db_compressed (1).sql\inventory_db_compressed (1).sql
    echo 2. SSH key permissions
    echo 3. Server connectivity
    pause
    exit /b 1
)

echo.
echo Step 3: Setting up MySQL and database on server...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "
echo '=== Installing MySQL Server ==='
sudo apt update
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

echo '=== Creating Database and User ==='
sudo mysql -e \"CREATE DATABASE IF NOT EXISTS inventory_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\"
sudo mysql -e \"CREATE USER IF NOT EXISTS 'inventory_user'@'localhost' IDENTIFIED BY 'StrongPass@123';\"
sudo mysql -e \"GRANT ALL PRIVILEGES ON inventory_db.* TO 'inventory_user'@'localhost';\"
sudo mysql -e \"FLUSH PRIVILEGES;\"

echo '=== Checking backup file ==='
ls -la ~/backup.sql

echo '=== Restoring database from backup ==='
mysql -u inventory_user -pStrongPass@123 inventory_db < ~/backup.sql

echo '=== Verifying database setup ==='
mysql -u inventory_user -pStrongPass@123 inventory_db -e \"SHOW TABLES;\"

echo '=== Checking specific tables ==='
mysql -u inventory_user -pStrongPass@123 inventory_db -e \"SELECT COUNT(*) as user_count FROM users;\"
mysql -u inventory_user -pStrongPass@123 inventory_db -e \"SELECT COUNT(*) as product_count FROM products;\"

echo '=== Cleaning up backup file ==='
rm ~/backup.sql

echo '=== Database setup completed successfully! ==='
"

echo.
echo ========================================
echo Database Setup Complete!
echo ========================================
echo Database: inventory_db
echo User: inventory_user
echo Password: StrongPass@123
echo Host: 127.0.0.1:3306
echo Server: 54.179.63.233
echo ========================================
echo.
echo Next steps:
echo 1. Update server.js database connection
echo 2. Install Node.js dependencies on server
echo 3. Start the backend server
echo ========================================

pause