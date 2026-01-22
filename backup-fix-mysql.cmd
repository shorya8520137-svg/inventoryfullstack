@echo off
echo ========================================
echo StockIQ Backup (Fixed MySQL Access)
echo ========================================

REM Set backup directory
set BACKUP_DIR=C:\Users\Admin\Desktop\StockIQ_Final_Backup

echo Creating backup directory...
if exist "%BACKUP_DIR%" rmdir /s /q "%BACKUP_DIR%"
mkdir "%BACKUP_DIR%"

echo.
echo ========================================
echo Step 1: Download Project (No node_modules)
echo ========================================
echo Downloading inventoryfullstack project...
scp -i "C:\Users\Admin\awsconection.pem" -r ubuntu@16.171.197.86:inventoryfullstack "%BACKUP_DIR%/"

echo.
echo ========================================
echo Step 2: Clean Large Files
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
echo Step 3: Download Database (Fixed MySQL)
echo ========================================
echo Trying different MySQL backup methods...

REM Try method 1: sudo with mysql user
echo Method 1: Using sudo mysql...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "sudo mysql -e 'SELECT VERSION();' && sudo mysqldump inventory_db > ~/database_backup.sql"

REM If that fails, try method 2: direct mysql
if errorlevel 1 (
    echo Method 2: Using mysql directly...
    ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "mysql -u root inventory_db -e 'SELECT VERSION();' && mysqldump -u root inventory_db > ~/database_backup.sql"
)

REM If that fails, try method 3: with password prompt
if errorlevel 1 (
    echo Method 3: Using mysql with password...
    ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "mysqldump -u root -p inventory_db > ~/database_backup.sql"
)

echo Downloading database backup...
scp -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86:~/database_backup.sql "%BACKUP_DIR%/"

echo.
echo ========================================
echo Step 4: Cleanup Server
echo ========================================
echo Removing temporary files from server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "rm -f ~/database_backup.sql"

echo.
echo ========================================
echo Step 5: Create Instructions
echo ========================================
echo STOCKIQ COMPLETE BACKUP > "%BACKUP_DIR%\RESTORE_GUIDE.txt"
echo ======================= >> "%BACKUP_DIR%\RESTORE_GUIDE.txt"
echo. >> "%BACKUP_DIR%\RESTORE_GUIDE.txt"
echo BACKUP CONTENTS: >> "%BACKUP_DIR%\RESTORE_GUIDE.txt"
echo - inventoryfullstack/     (Clean source code) >> "%BACKUP_DIR%\RESTORE_GUIDE.txt"
echo - database_backup.sql     (MySQL database) >> "%BACKUP_DIR%\RESTORE_GUIDE.txt"
echo. >> "%BACKUP_DIR%\RESTORE_GUIDE.txt"
echo RESTORE STEPS: >> "%BACKUP_DIR%\RESTORE_GUIDE.txt"
echo 1. Copy inventoryfullstack folder to desired location >> "%BACKUP_DIR%\RESTORE_GUIDE.txt"
echo 2. cd inventoryfullstack >> "%BACKUP_DIR%\RESTORE_GUIDE.txt"
echo 3. npm install >> "%BACKUP_DIR%\RESTORE_GUIDE.txt"
echo 4. CREATE DATABASE inventory_db; >> "%BACKUP_DIR%\RESTORE_GUIDE.txt"
echo 5. mysql -u root -p inventory_db ^< ../database_backup.sql >> "%BACKUP_DIR%\RESTORE_GUIDE.txt"
echo 6. Configure .env file >> "%BACKUP_DIR%\RESTORE_GUIDE.txt"
echo 7. npm run dev >> "%BACKUP_DIR%\RESTORE_GUIDE.txt"
echo. >> "%BACKUP_DIR%\RESTORE_GUIDE.txt"
echo ADMIN CREDENTIALS: >> "%BACKUP_DIR%\RESTORE_GUIDE.txt"
echo Email: admin@company.com >> "%BACKUP_DIR%\RESTORE_GUIDE.txt"
echo Password: admin@123 >> "%BACKUP_DIR%\RESTORE_GUIDE.txt"
echo. >> "%BACKUP_DIR%\RESTORE_GUIDE.txt"
echo LIVE SYSTEM: >> "%BACKUP_DIR%\RESTORE_GUIDE.txt"
echo https://stockiqfullstacktest.vercel.app >> "%BACKUP_DIR%\RESTORE_GUIDE.txt"

echo.
echo ========================================
echo BACKUP COMPLETED!
echo ========================================
echo.
echo Location: %BACKUP_DIR%
echo.
echo Contents:
echo ✓ inventoryfullstack/ (source code)
echo ✓ database_backup.sql (database)
echo ✓ RESTORE_GUIDE.txt (instructions)
echo.

explorer "%BACKUP_DIR%"

echo Press any key to exit...
pause > nul