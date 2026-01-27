@echo off
echo Starting StockIQ Server Backup...
echo ========================================

REM Create backup directory with simple name
set BACKUP_DIR=%USERPROFILE%\Desktop\StockIQ_Backup
if exist "%BACKUP_DIR%" rmdir /s /q "%BACKUP_DIR%"
mkdir "%BACKUP_DIR%"
mkdir "%BACKUP_DIR%\project"
mkdir "%BACKUP_DIR%\database"

echo Created backup directory: %BACKUP_DIR%

echo ========================================
echo STEP 1: Downloading project files...
echo ========================================

REM Download project files
scp -i "C:\Users\Admin\awsconection.pem" -r ubuntu@16.171.197.86:inventoryfullstack "%BACKUP_DIR%\project\"

echo ========================================
echo STEP 2: Creating database backup...
echo ========================================

REM Create database backup on server with correct database name
echo Creating backup of database: inventory_db
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "sudo mysqldump -u root -p inventory_db > stockiq_database_backup.sql"

REM Download database backup
scp -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86:stockiq_database_backup.sql "%BACKUP_DIR%\database\"

echo ========================================
echo STEP 3: Creating backup info...
echo ========================================

REM Create backup information file
echo Creating backup documentation...
(
echo StockIQ Inventory Management System - Complete Backup
echo =====================================================
echo Backup Date: %date% %time%
echo Server: ubuntu@16.171.197.86
echo Database: inventory_db
echo.
echo CONTENTS:
echo =========
echo 1. PROJECT FILES: /project/inventoryfullstack/
echo    - Complete Next.js frontend
echo    - Node.js backend with all controllers
echo    - API routes and middleware
echo    - Documentation and configuration
echo.
echo 2. DATABASE: /database/stockiq_database_backup.sql
echo    - Complete MySQL database dump
echo    - Database name: inventory_db
echo    - All tables with data
echo    - User accounts and permissions
echo    - Inventory and order data
echo.
echo RESTORATION INSTRUCTIONS:
echo ========================
echo 1. Project Files:
echo    - Copy inventoryfullstack folder to desired location
echo    - Run: npm install
echo    - Configure .env file with database credentials
echo    - Run: npm run dev or npm run build + npm start
echo.
echo 2. Database:
echo    - Create new MySQL database: CREATE DATABASE inventory_db;
echo    - Import backup: mysql -u root -p inventory_db ^< stockiq_database_backup.sql
echo    - Update connection settings in project
echo.
echo LIVE DEPLOYMENTS:
echo ================
echo Frontend: https://stockiqfullstacktest.vercel.app
echo Backend: AWS EC2 16.171.197.86:5000
echo.
echo ADMIN CREDENTIALS:
echo =================
echo Email: admin@company.com
echo Password: admin@123
echo.
echo BACKUP COMPLETED: %date% %time%
) > "%BACKUP_DIR%\BACKUP_INFO.txt"

echo ========================================
echo STEP 4: Cleaning up server...
echo ========================================

REM Remove temporary file from server
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "rm -f stockiq_database_backup.sql"

echo ========================================
echo BACKUP COMPLETED SUCCESSFULLY!
echo ========================================
echo Location: %BACKUP_DIR%
echo.
echo Contents:
echo - project\inventoryfullstack (complete project)
echo - database\stockiq_database_backup.sql (database: inventory_db)
echo - BACKUP_INFO.txt (restoration instructions)
echo.
echo Your complete StockIQ system is now backed up!

REM Open backup folder
explorer "%BACKUP_DIR%"

pause