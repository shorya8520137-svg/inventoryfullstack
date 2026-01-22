@echo off
echo ========================================
echo StockIQ Backup (No node_modules)
echo ========================================

REM Set backup directory
set BACKUP_DIR=C:\Users\Admin\Desktop\StockIQ_Clean_Backup

echo Creating backup directory...
if exist "%BACKUP_DIR%" rmdir /s /q "%BACKUP_DIR%"
mkdir "%BACKUP_DIR%"

echo.
echo ========================================
echo Step 1: Download Project (Excluding node_modules)
echo ========================================
echo Using rsync to exclude node_modules and build files...
scp -i "C:\Users\Admin\awsconection.pem" -r ubuntu@16.171.197.86:inventoryfullstack "%BACKUP_DIR%/" --exclude=node_modules --exclude=.next --exclude=.git

echo.
echo ========================================
echo Step 2: Download Database
echo ========================================
echo Creating database backup on server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "mysqldump -u root -p --single-transaction inventory_db > ~/database.sql"

echo Downloading database...
scp -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86:~/database.sql "%BACKUP_DIR%/"

echo.
echo ========================================
echo Step 3: Remove node_modules if downloaded
echo ========================================
if exist "%BACKUP_DIR%\inventoryfullstack\node_modules" (
    echo Removing node_modules folder...
    rmdir /s /q "%BACKUP_DIR%\inventoryfullstack\node_modules"
)

if exist "%BACKUP_DIR%\inventoryfullstack\.next" (
    echo Removing .next build folder...
    rmdir /s /q "%BACKUP_DIR%\inventoryfullstack\.next"
)

echo.
echo ========================================
echo Step 4: Cleanup Server
echo ========================================
echo Removing temporary database file from server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "rm -f ~/database.sql"

echo.
echo ========================================
echo Step 5: Create Instructions
echo ========================================
echo STOCKIQ CLEAN BACKUP > "%BACKUP_DIR%\README.txt"
echo ==================== >> "%BACKUP_DIR%\README.txt"
echo. >> "%BACKUP_DIR%\README.txt"
echo CONTENTS: >> "%BACKUP_DIR%\README.txt"
echo - inventoryfullstack/  (Source code without node_modules) >> "%BACKUP_DIR%\README.txt"
echo - database.sql         (Complete database backup) >> "%BACKUP_DIR%\README.txt"
echo. >> "%BACKUP_DIR%\README.txt"
echo TO RESTORE: >> "%BACKUP_DIR%\README.txt"
echo 1. Copy inventoryfullstack folder anywhere >> "%BACKUP_DIR%\README.txt"
echo 2. cd inventoryfullstack >> "%BACKUP_DIR%\README.txt"
echo 3. npm install (this will install all dependencies) >> "%BACKUP_DIR%\README.txt"
echo 4. Create database: CREATE DATABASE inventory_db; >> "%BACKUP_DIR%\README.txt"
echo 5. Import database: mysql -u root -p inventory_db ^< ../database.sql >> "%BACKUP_DIR%\README.txt"
echo 6. Configure .env file with database connection >> "%BACKUP_DIR%\README.txt"
echo 7. npm run dev (development) or npm run build + npm start (production) >> "%BACKUP_DIR%\README.txt"
echo. >> "%BACKUP_DIR%\README.txt"
echo ADMIN LOGIN: >> "%BACKUP_DIR%\README.txt"
echo Email: admin@company.com >> "%BACKUP_DIR%\README.txt"
echo Password: admin@123 >> "%BACKUP_DIR%\README.txt"
echo. >> "%BACKUP_DIR%\README.txt"
echo LIVE SYSTEM: >> "%BACKUP_DIR%\README.txt"
echo Frontend: https://stockiqfullstacktest.vercel.app >> "%BACKUP_DIR%\README.txt"
echo Server: 16.171.197.86:5000 >> "%BACKUP_DIR%\README.txt"

echo.
echo ========================================
echo BACKUP COMPLETED!
echo ========================================
echo.
echo Location: %BACKUP_DIR%
echo.
echo Your backup contains:
echo ✓ inventoryfullstack/ (clean source code)
echo ✓ database.sql (complete database)
echo ✓ README.txt (restore instructions)
echo.
echo NOTE: Run 'npm install' after copying to restore dependencies
echo.

explorer "%BACKUP_DIR%"

echo Press any key to exit...
pause > nul