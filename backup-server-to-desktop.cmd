@echo off
REM =====================================================
REM STOCKIQ INVENTORY - COMPLETE SERVER BACKUP SCRIPT
REM =====================================================
REM This script backs up both project files and database
REM from AWS server to local desktop
REM =====================================================

echo 🚀 Starting StockIQ Complete Server Backup...
echo ========================================================

REM Set backup directory on desktop
set BACKUP_DIR=%USERPROFILE%\Desktop\StockIQ_Backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%
set BACKUP_DIR=%BACKUP_DIR: =0%

echo 📁 Creating backup directory: %BACKUP_DIR%
mkdir "%BACKUP_DIR%"
mkdir "%BACKUP_DIR%\project"
mkdir "%BACKUP_DIR%\database"

echo ========================================================
echo 📦 STEP 1: Backing up project files from server...
echo ========================================================

REM Download project files using SCP
echo 📥 Downloading inventoryfullstack project...
scp -i "C:\Users\Admin\awsconection.pem" -r ubuntu@16.171.197.86:~/inventoryfullstack "%BACKUP_DIR%\project\"

echo ========================================================
echo 🗄️ STEP 2: Backing up MySQL database...
echo ========================================================

REM Create database backup on server first, then download
echo 💾 Creating database dump on server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "mysqldump -u root -p inventory_system > ~/stockiq_database_backup.sql"

echo 📥 Downloading database backup...
scp -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86:~/stockiq_database_backup.sql "%BACKUP_DIR%\database\"

echo ========================================================
echo 📋 STEP 3: Creating backup documentation...
echo ========================================================

REM Create backup info file
echo Creating backup information file...
(
echo StockIQ Inventory Management System - Complete Backup
echo =====================================================
echo Backup Date: %date% %time%
echo Server: ubuntu@16.171.197.86
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
echo    - Run: npm run dev (development) or npm run build + npm start (production)
echo.
echo 2. Database:
echo    - Create new MySQL database: CREATE DATABASE inventory_system;
echo    - Import backup: mysql -u root -p inventory_system ^< stockiq_database_backup.sql
echo    - Update connection settings in project
echo.
echo 3. Dependencies:
echo    - Node.js 16+
echo    - MySQL 8.0+
echo    - PM2 (for production)
echo.
echo LIVE DEPLOYMENTS:
echo ================
echo Frontend: https://stockiqfullstacktest.vercel.app
echo Backend: AWS EC2 (16.171.197.86:5000)
echo.
echo GITHUB REPOSITORIES:
echo ===================
echo Primary: https://github.com/shorya8520137-svg/inventoryfullstack
echo Secondary: https://github.com/shoryasingh-creator/hunyhunyinventory
echo.
echo ADMIN CREDENTIALS:
echo =================
echo Email: admin@company.com
echo Password: admin@123
echo.
echo BACKUP COMPLETED: %date% %time%
) > "%BACKUP_DIR%\BACKUP_INFO.txt"

echo ========================================================
echo 🧹 STEP 4: Cleaning up server temporary files...
echo ========================================================

REM Clean up temporary database file on server
echo 🗑️ Removing temporary database file from server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "rm -f ~/stockiq_database_backup.sql"

echo ========================================================
echo ✅ BACKUP COMPLETED SUCCESSFULLY!
echo ========================================================
echo 📍 Backup Location: %BACKUP_DIR%
echo.
echo 📊 BACKUP CONTENTS:
echo ├── project/
echo │   └── inventoryfullstack/          (Complete project files)
echo ├── database/
echo │   └── stockiq_database_backup.sql  (MySQL database dump)
echo └── BACKUP_INFO.txt                  (Restoration instructions)
echo.
echo 🔄 TO RESTORE:
echo 1. Copy project files to desired location
echo 2. Import database using MySQL
echo 3. Configure environment variables
echo 4. Run npm install and start application
echo.
echo 💾 Your complete StockIQ system is now safely backed up!

REM Open backup folder
echo 📂 Opening backup folder...
explorer "%BACKUP_DIR%"

pause