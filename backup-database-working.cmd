@echo off
echo ========================================
echo StockIQ Database Backup (Working Version)
echo ========================================

REM Set backup directory
set BACKUP_DIR=C:\Users\Admin\Desktop\StockIQ_Database_Working

echo Creating backup directory...
if exist "%BACKUP_DIR%" rmdir /s /q "%BACKUP_DIR%"
mkdir "%BACKUP_DIR%"

echo.
echo ========================================
echo Creating Complete Database Backup
echo ========================================
echo Database: inventory_db (78.86 MB)
echo Tables: 52 tables including tracking_history_backup (69.61 MB)

echo.
echo Creating full database dump with all options...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "sudo mysqldump --single-transaction --routines --triggers --events --complete-insert --extended-insert --add-drop-table --add-locks --disable-keys --quick --lock-tables=false inventory_db > ~/inventory_db_complete.sql"

echo.
echo Checking backup file size on server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "ls -lh ~/inventory_db_complete.sql"

echo.
echo Downloading complete database backup...
scp -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86:~/inventory_db_complete.sql "%BACKUP_DIR%/"

echo.
echo Checking downloaded file...
dir "%BACKUP_DIR%\inventory_db_complete.sql"

echo.
echo ========================================
echo Creating Compressed Backup
echo ========================================
echo Creating compressed version for faster transfer...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "sudo mysqldump --single-transaction --routines --triggers --events inventory_db | gzip > ~/inventory_db_compressed.sql.gz"

echo Checking compressed file size...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "ls -lh ~/inventory_db_compressed.sql.gz"

echo Downloading compressed backup...
scp -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86:~/inventory_db_compressed.sql.gz "%BACKUP_DIR%/"

echo.
echo ========================================
echo Creating Restore Instructions
echo ========================================
echo STOCKIQ DATABASE BACKUP - 78.86 MB > "%BACKUP_DIR%\DATABASE_RESTORE.txt"
echo ================================== >> "%BACKUP_DIR%\DATABASE_RESTORE.txt"
echo. >> "%BACKUP_DIR%\DATABASE_RESTORE.txt"
echo DATABASE INFO: >> "%BACKUP_DIR%\DATABASE_RESTORE.txt"
echo - Name: inventory_db >> "%BACKUP_DIR%\DATABASE_RESTORE.txt"
echo - Size: 78.86 MB >> "%BACKUP_DIR%\DATABASE_RESTORE.txt"
echo - Tables: 52 tables >> "%BACKUP_DIR%\DATABASE_RESTORE.txt"
echo - Main table: tracking_history_backup (69.61 MB) >> "%BACKUP_DIR%\DATABASE_RESTORE.txt"
echo. >> "%BACKUP_DIR%\DATABASE_RESTORE.txt"
echo BACKUP FILES: >> "%BACKUP_DIR%\DATABASE_RESTORE.txt"
echo - inventory_db_complete.sql (Full backup) >> "%BACKUP_DIR%\DATABASE_RESTORE.txt"
echo - inventory_db_compressed.sql.gz (Compressed backup) >> "%BACKUP_DIR%\DATABASE_RESTORE.txt"
echo. >> "%BACKUP_DIR%\DATABASE_RESTORE.txt"
echo TO RESTORE: >> "%BACKUP_DIR%\DATABASE_RESTORE.txt"
echo 1. Create database: CREATE DATABASE inventory_db; >> "%BACKUP_DIR%\DATABASE_RESTORE.txt"
echo 2. Import full backup: mysql -u root -p inventory_db ^< inventory_db_complete.sql >> "%BACKUP_DIR%\DATABASE_RESTORE.txt"
echo 3. OR extract compressed: gunzip inventory_db_compressed.sql.gz >> "%BACKUP_DIR%\DATABASE_RESTORE.txt"
echo 4. Then import: mysql -u root -p inventory_db ^< inventory_db_compressed.sql >> "%BACKUP_DIR%\DATABASE_RESTORE.txt"
echo. >> "%BACKUP_DIR%\DATABASE_RESTORE.txt"
echo ADMIN LOGIN: >> "%BACKUP_DIR%\DATABASE_RESTORE.txt"
echo Email: admin@company.com >> "%BACKUP_DIR%\DATABASE_RESTORE.txt"
echo Password: admin@123 >> "%BACKUP_DIR%\DATABASE_RESTORE.txt"

echo.
echo ========================================
echo Cleanup Server
echo ========================================
echo Removing temporary files from server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "rm -f ~/inventory_db_complete.sql ~/inventory_db_compressed.sql.gz"

echo.
echo ========================================
echo BACKUP COMPLETED!
echo ========================================
echo.
echo Location: %BACKUP_DIR%
echo.
echo Files created:
for %%f in ("%BACKUP_DIR%\*") do (
    echo ✓ %%~nxf - %%~zf bytes
)
echo.
echo Database: inventory_db (78.86 MB with 52 tables)
echo Main data: tracking_history_backup table (69.61 MB)
echo.

explorer "%BACKUP_DIR%"

echo Press any key to exit...
pause > nul