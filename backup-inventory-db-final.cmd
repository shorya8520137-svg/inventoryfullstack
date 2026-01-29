@echo off
echo ===============================================
echo INVENTORY DASHBOARD DATABASE BACKUP
echo Final Delivery - 29th January 2026
echo Database: inventory_db
echo ===============================================

set FOLDER="C:\Users\Admin\Desktop\inventory dashbord final devlivery at 29th jan"

echo.
echo Step 1: Creating database dump on server...
echo Database: inventory_db (79-89 MB expected)
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "sudo mysqldump -u root -p'Admin@123' --single-transaction --routines --triggers inventory_db > /home/ubuntu/inventory_db_backup_final_29jan.sql"

if %ERRORLEVEL% EQU 0 (
    echo ✓ Database dump created successfully
) else (
    echo ✗ Failed to create database dump
    pause
    exit /b 1
)

echo.
echo Step 2: Checking database size on server...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "ls -lh /home/ubuntu/inventory_db_backup_final_29jan.sql"

echo.
echo Step 3: Downloading database to desktop folder...
scp -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64:/home/ubuntu/inventory_db_backup_final_29jan.sql %FOLDER%\

if %ERRORLEVEL% EQU 0 (
    echo ✓ Database backup downloaded successfully
) else (
    echo ✗ Failed to download database backup
    pause
    exit /b 1
)

echo.
echo Step 4: Verifying downloaded file...
dir %FOLDER%\inventory_db_backup_final_29jan.sql

echo.
echo Step 5: Getting database information...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "sudo mysql -u root -p'Admin@123' -e 'SELECT table_schema AS Database_Name, ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS Database_Size_MB FROM information_schema.tables WHERE table_schema = \"inventory_db\" GROUP BY table_schema;'" > %FOLDER%\database_size_info.txt

echo.
echo Step 6: Creating backup documentation...
echo INVENTORY DASHBOARD - FINAL DELIVERY BACKUP > %FOLDER%\BACKUP_SUMMARY.txt
echo Date: %DATE% %TIME% >> %FOLDER%\BACKUP_SUMMARY.txt
echo. >> %FOLDER%\BACKUP_SUMMARY.txt
echo SERVER DETAILS: >> %FOLDER%\BACKUP_SUMMARY.txt
echo IP Address: 54.169.107.64 >> %FOLDER%\BACKUP_SUMMARY.txt
echo Username: ubuntu >> %FOLDER%\BACKUP_SUMMARY.txt
echo Database: inventory_db >> %FOLDER%\BACKUP_SUMMARY.txt
echo. >> %FOLDER%\BACKUP_SUMMARY.txt
echo BACKUP FILES: >> %FOLDER%\BACKUP_SUMMARY.txt
echo - inventory_db_backup_final_29jan.sql (Complete database dump) >> %FOLDER%\BACKUP_SUMMARY.txt
echo - database_size_info.txt (Database size information) >> %FOLDER%\BACKUP_SUMMARY.txt
echo - BACKUP_SUMMARY.txt (This documentation) >> %FOLDER%\BACKUP_SUMMARY.txt
echo. >> %FOLDER%\BACKUP_SUMMARY.txt
echo BACKUP STATUS: COMPLETED SUCCESSFULLY >> %FOLDER%\BACKUP_SUMMARY.txt
echo Expected Size Range: 79-89 MB >> %FOLDER%\BACKUP_SUMMARY.txt
echo. >> %FOLDER%\BACKUP_SUMMARY.txt
echo NOTES: >> %FOLDER%\BACKUP_SUMMARY.txt
echo - Complete production database backup >> %FOLDER%\BACKUP_SUMMARY.txt
echo - Contains all tables, data, routines, and triggers >> %FOLDER%\BACKUP_SUMMARY.txt
echo - Ready for final delivery and deployment >> %FOLDER%\BACKUP_SUMMARY.txt

echo.
echo Step 7: Cleaning up server temporary files...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "rm -f /home/ubuntu/inventory_db_backup_final_29jan.sql"
echo ✓ Server cleanup completed

echo.
echo ===============================================
echo BACKUP COMPLETED SUCCESSFULLY!
echo ===============================================
echo.
echo Backup Location: %FOLDER%
echo.
echo Files Created:
echo - inventory_db_backup_final_29jan.sql (MySQL database dump)
echo - database_size_info.txt (Database size information)
echo - BACKUP_SUMMARY.txt (Backup documentation)
echo.
echo The inventory_db database backup is ready for final delivery!
echo.
pause