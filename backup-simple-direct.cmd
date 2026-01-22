@echo off
echo ========================================
echo StockIQ Simple Direct Backup
echo ========================================

REM Set backup directory
set BACKUP_DIR=C:\Users\Admin\Desktop\StockIQ_Backup_Direct

echo Removing old backup if exists...
if exist "%BACKUP_DIR%" rmdir /s /q "%BACKUP_DIR%"

echo Creating fresh backup directory...
mkdir "%BACKUP_DIR%"

echo.
echo ========================================
echo Step 1: Download Project (Direct Copy)
echo ========================================
echo Downloading inventoryfullstack project...
scp -i "C:\Users\Admin\awsconection.pem" -r ubuntu@16.171.197.86:~/inventoryfullstack "%BACKUP_DIR%/"

echo.
echo ========================================
echo Step 2: Download Database
echo ========================================
echo Creating database backup on server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "mysqldump -u root -p --single-transaction --routines --triggers inventory_db > ~/stockiq_db.sql"

echo Downloading database file...
scp -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86:~/stockiq_db.sql "%BACKUP_DIR%/"

echo.
echo ========================================
echo Step 3: Cleanup Server
echo ========================================
echo Removing temporary database file from server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "rm -f ~/stockiq_db.sql"

echo.
echo ========================================
echo Creating Restore Instructions
echo ========================================
echo Creating restore guide...
echo STOCKIQ COMPLETE BACKUP > "%BACKUP_DIR%\README.txt"
echo ======================= >> "%BACKUP_DIR%\README.txt"
echo. >> "%BACKUP_DIR%\README.txt"
echo FILES: >> "%BACKUP_DIR%\README.txt"
echo - inventoryfullstack/  (Complete project) >> "%BACKUP_DIR%\README.txt"
echo - stockiq_db.sql       (Database backup) >> "%BACKUP_DIR%\README.txt"
echo. >> "%BACKUP_DIR%\README.txt"
echo TO RESTORE: >> "%BACKUP_DIR%\README.txt"
echo 1. Copy inventoryfullstack folder anywhere >> "%BACKUP_DIR%\README.txt"
echo 2. npm install >> "%BACKUP_DIR%\README.txt"
echo 3. CREATE DATABASE inventory_db; >> "%BACKUP_DIR%\README.txt"
echo 4. mysql -u root -p inventory_db ^< stockiq_db.sql >> "%BACKUP_DIR%\README.txt"
echo 5. Configure .env and start app >> "%BACKUP_DIR%\README.txt"
echo. >> "%BACKUP_DIR%\README.txt"
echo ADMIN: admin@company.com / admin@123 >> "%BACKUP_DIR%\README.txt"

echo.
echo ========================================
echo BACKUP COMPLETED!
echo ========================================
echo.
echo Location: %BACKUP_DIR%
echo.
echo Contents:
echo ✓ inventoryfullstack/ (project files)
echo ✓ stockiq_db.sql (database)
echo ✓ README.txt (instructions)
echo.

explorer "%BACKUP_DIR%"

echo Press any key to exit...
pause > nul