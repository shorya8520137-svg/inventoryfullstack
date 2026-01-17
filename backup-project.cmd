@echo off
echo 🚀 CREATING COMPLETE PROJECT BACKUP
echo =====================================

set timestamp=%date:~-4,4%-%date:~-10,2%-%date:~-7,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%
set timestamp=%timestamp: =0%
set BackupRoot=C:\InventoryBackups\Backup_%timestamp%

echo 📁 Creating backup directories...
mkdir "%BackupRoot%\1_Local_Project" 2>nul
mkdir "%BackupRoot%\2_Server_Project" 2>nul
mkdir "%BackupRoot%\3_Database" 2>nul
mkdir "%BackupRoot%\4_Documentation" 2>nul

echo ✅ Directories created: %BackupRoot%

echo.
echo 💾 Backing up local project...
robocopy . "%BackupRoot%\1_Local_Project" /E /XD node_modules .next .git uploads temp_messages /NFL /NDL /NJH /NJS
echo ✅ Local project backup completed

echo.
echo 🌐 Backing up server project...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "cd /home/ubuntu && tar -czf /tmp/server_backup_%timestamp%.tar.gz --exclude='node_modules' --exclude='.git' --exclude='uploads' inventoryfullstack"

if %errorlevel% equ 0 (
    echo ✅ Server archive created
    scp -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188:/tmp/server_backup_%timestamp%.tar.gz "%BackupRoot%\2_Server_Project\"
    if %errorlevel% equ 0 (
        echo ✅ Server project downloaded
        ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "rm -f /tmp/server_backup_%timestamp%.tar.gz"
    ) else (
        echo ❌ Failed to download server project
    )
) else (
    echo ❌ Failed to create server archive
)

echo.
echo 🗄️ Backing up database...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "mysqldump -u inventory_user -p'Inventory@2024!' inventory_db > /tmp/db_backup_%timestamp%.sql"

if %errorlevel% equ 0 (
    echo ✅ Database dump created
    scp -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188:/tmp/db_backup_%timestamp%.sql "%BackupRoot%\3_Database\"
    if %errorlevel% equ 0 (
        echo ✅ Database backup downloaded
        ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "rm -f /tmp/db_backup_%timestamp%.sql"
    ) else (
        echo ❌ Failed to download database backup
    )
) else (
    echo ❌ Failed to create database dump
)

echo.
echo 📚 Creating documentation...
echo # Complete Inventory System Backup > "%BackupRoot%\README.md"
echo. >> "%BackupRoot%\README.md"
echo ## Contents >> "%BackupRoot%\README.md"
echo 1. Local Project - Complete source code >> "%BackupRoot%\README.md"
echo 2. Server Project - Production server files >> "%BackupRoot%\README.md"
echo 3. Database - Complete MySQL database dump >> "%BackupRoot%\README.md"
echo 4. Documentation - Setup instructions >> "%BackupRoot%\README.md"
echo. >> "%BackupRoot%\README.md"
echo ## Quick Start >> "%BackupRoot%\README.md"
echo 1. Extract server project from 2_Server_Project/ >> "%BackupRoot%\README.md"
echo 2. Import database from 3_Database/ >> "%BackupRoot%\README.md"
echo 3. Configure environment variables >> "%BackupRoot%\README.md"
echo 4. Run: npm install and start server >> "%BackupRoot%\README.md"
echo. >> "%BackupRoot%\README.md"
echo Created: %timestamp% >> "%BackupRoot%\README.md"

echo # Local Project Setup > "%BackupRoot%\1_Local_Project\SETUP.md"
echo 1. Install Node.js v18+ >> "%BackupRoot%\1_Local_Project\SETUP.md"
echo 2. Install MySQL 8.0+ >> "%BackupRoot%\1_Local_Project\SETUP.md"
echo 3. Run: npm install >> "%BackupRoot%\1_Local_Project\SETUP.md"
echo 4. Configure .env file >> "%BackupRoot%\1_Local_Project\SETUP.md"
echo 5. Import database from ../3_Database/ >> "%BackupRoot%\1_Local_Project\SETUP.md"
echo 6. Run: npm run dev or node server.js >> "%BackupRoot%\1_Local_Project\SETUP.md"

echo # Database Restore Instructions > "%BackupRoot%\3_Database\RESTORE.md"
echo 1. Create database: CREATE DATABASE inventory_db; >> "%BackupRoot%\3_Database\RESTORE.md"
echo 2. Create user: CREATE USER 'inventory_user'@'localhost' IDENTIFIED BY 'Inventory@2024!'; >> "%BackupRoot%\3_Database\RESTORE.md"
echo 3. Grant permissions: GRANT ALL ON inventory_db.* TO 'inventory_user'@'localhost'; >> "%BackupRoot%\3_Database\RESTORE.md"
echo 4. Import: mysql -u inventory_user -p inventory_db ^< db_backup_%timestamp%.sql >> "%BackupRoot%\3_Database\RESTORE.md"

echo ✅ Documentation created

echo.
echo 🎉 BACKUP COMPLETED SUCCESSFULLY!
echo =====================================
echo 📁 Backup Location: %BackupRoot%
echo 📖 Check README.md for instructions
echo 💾 Keep this backup safe!
echo.
pause