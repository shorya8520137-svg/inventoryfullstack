@echo off
echo ========================================
echo StockIQ Backup (Excluding Large Files)
echo ========================================

REM Set backup directory
set BACKUP_DIR=C:\Users\Admin\Desktop\StockIQ_Source_Only

echo Creating backup directory...
if exist "%BACKUP_DIR%" rmdir /s /q "%BACKUP_DIR%"
mkdir "%BACKUP_DIR%"

echo.
echo ========================================
echo Step 1: Create Archive on Server (Exclude node_modules/.next)
echo ========================================
echo Creating tar archive on server (excluding large files)...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "cd ~ && tar --exclude='inventoryfullstack/node_modules' --exclude='inventoryfullstack/.next' --exclude='inventoryfullstack/.git' -czf stockiq_source.tar.gz inventoryfullstack"

echo.
echo ========================================
echo Step 2: Download Archive
echo ========================================
echo Downloading compressed archive...
scp -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86:~/stockiq_source.tar.gz "%BACKUP_DIR%/"

echo.
echo ========================================
echo Step 3: Download Database
echo ========================================
echo Creating database backup...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "mysqldump -u root -p --single-transaction --routines --triggers inventory_db > ~/stockiq_db.sql"

echo Downloading database...
scp -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86:~/stockiq_db.sql "%BACKUP_DIR%/"

echo.
echo ========================================
echo Step 4: Extract Archive Locally
echo ========================================
echo Extracting project files...
cd /d "%BACKUP_DIR%"
tar -xzf stockiq_source.tar.gz

echo.
echo ========================================
echo Step 5: Cleanup
echo ========================================
echo Cleaning up server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "rm -f ~/stockiq_source.tar.gz ~/stockiq_db.sql"

echo Removing local archive...
del "%BACKUP_DIR%\stockiq_source.tar.gz"

echo.
echo ========================================
echo Creating Instructions
echo ========================================
echo STOCKIQ SOURCE CODE BACKUP > "%BACKUP_DIR%\RESTORE_INSTRUCTIONS.txt"
echo =========================== >> "%BACKUP_DIR%\RESTORE_INSTRUCTIONS.txt"
echo. >> "%BACKUP_DIR%\RESTORE_INSTRUCTIONS.txt"
echo CONTENTS: >> "%BACKUP_DIR%\RESTORE_INSTRUCTIONS.txt"
echo - inventoryfullstack/  (Source code only, no node_modules) >> "%BACKUP_DIR%\RESTORE_INSTRUCTIONS.txt"
echo - stockiq_db.sql       (Complete database) >> "%BACKUP_DIR%\RESTORE_INSTRUCTIONS.txt"
echo. >> "%BACKUP_DIR%\RESTORE_INSTRUCTIONS.txt"
echo TO RESTORE: >> "%BACKUP_DIR%\RESTORE_INSTRUCTIONS.txt"
echo 1. Copy inventoryfullstack folder to desired location >> "%BACKUP_DIR%\RESTORE_INSTRUCTIONS.txt"
echo 2. cd inventoryfullstack >> "%BACKUP_DIR%\RESTORE_INSTRUCTIONS.txt"
echo 3. npm install (installs dependencies) >> "%BACKUP_DIR%\RESTORE_INSTRUCTIONS.txt"
echo 4. Create database: CREATE DATABASE inventory_db; >> "%BACKUP_DIR%\RESTORE_INSTRUCTIONS.txt"
echo 5. Import: mysql -u root -p inventory_db ^< ../stockiq_db.sql >> "%BACKUP_DIR%\RESTORE_INSTRUCTIONS.txt"
echo 6. Configure .env file >> "%BACKUP_DIR%\RESTORE_INSTRUCTIONS.txt"
echo 7. npm run dev (development) or npm run build + npm start (production) >> "%BACKUP_DIR%\RESTORE_INSTRUCTIONS.txt"
echo. >> "%BACKUP_DIR%\RESTORE_INSTRUCTIONS.txt"
echo ADMIN LOGIN: >> "%BACKUP_DIR%\RESTORE_INSTRUCTIONS.txt"
echo Email: admin@company.com >> "%BACKUP_DIR%\RESTORE_INSTRUCTIONS.txt"
echo Password: admin@123 >> "%BACKUP_DIR%\RESTORE_INSTRUCTIONS.txt"
echo. >> "%BACKUP_DIR%\RESTORE_INSTRUCTIONS.txt"
echo NOTE: This backup excludes node_modules and build files >> "%BACKUP_DIR%\RESTORE_INSTRUCTIONS.txt"
echo Run 'npm install' to restore dependencies >> "%BACKUP_DIR%\RESTORE_INSTRUCTIONS.txt"

echo.
echo ========================================
echo BACKUP COMPLETED SUCCESSFULLY!
echo ========================================
echo.
echo Location: %BACKUP_DIR%
echo.
echo Contents:
echo ✓ inventoryfullstack/ (source code)
echo ✓ stockiq_db.sql (database)
echo ✓ RESTORE_INSTRUCTIONS.txt
echo.
echo NOTE: Run 'npm install' after restoring to get dependencies
echo.

explorer "%BACKUP_DIR%"

echo Press any key to exit...
pause > nul