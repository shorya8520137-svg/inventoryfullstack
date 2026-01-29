@echo off
echo ===============================================
echo INVENTORY DASHBOARD - FINAL DELIVERY BACKUP
echo Date: 29th January 2026
echo ===============================================
echo.

set DESKTOP_FOLDER="C:\Users\Admin\Desktop\inventory dashbord final devlivery at 29th jan"
set SSH_KEY="C:\Users\Admin\e2c.pem"
set SERVER_IP=54.169.107.64
set SERVER_USER=ubuntu

echo Creating backup directory structure...
mkdir %DESKTOP_FOLDER%\database 2>nul
mkdir %DESKTOP_FOLDER%\logs 2>nul
mkdir %DESKTOP_FOLDER%\documentation 2>nul

echo.
echo ===============================================
echo STEP 1: Creating MySQL Database Dump on Server
echo ===============================================

echo Connecting to server and creating database backup...
ssh -i %SSH_KEY% %SERVER_USER%@%SERVER_IP% "sudo mysqldump -u root -p'Admin@123' --single-transaction --routines --triggers inventory_management > /tmp/inventory_backup_29jan2026.sql && echo 'Database dump created successfully' && ls -lh /tmp/inventory_backup_29jan2026.sql"

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create database dump on server
    pause
    exit /b 1
)

echo.
echo ===============================================
echo STEP 2: Downloading Database to Local System
echo ===============================================

echo Downloading database backup to local folder...
scp -i %SSH_KEY% %SERVER_USER%@%SERVER_IP%:/tmp/inventory_backup_29jan2026.sql %DESKTOP_FOLDER%\database\

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to download database backup
    pause
    exit /b 1
)

echo.
echo ===============================================
echo STEP 3: Getting Server Information & Logs
echo ===============================================

echo Collecting server information...
ssh -i %SSH_KEY% %SERVER_USER%@%SERVER_IP% "echo '=== SERVER INFO ===' > /tmp/server_info.txt && uname -a >> /tmp/server_info.txt && echo '' >> /tmp/server_info.txt && echo '=== MYSQL STATUS ===' >> /tmp/server_info.txt && sudo systemctl status mysql >> /tmp/server_info.txt && echo '' >> /tmp/server_info.txt && echo '=== DATABASE SIZE ===' >> /tmp/server_info.txt && sudo mysql -u root -p'Admin@123' -e 'SELECT table_schema AS Database_Name, ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS Database_Size_MB FROM information_schema.tables WHERE table_schema = \"inventory_management\" GROUP BY table_schema;' >> /tmp/server_info.txt"

echo Downloading server information...
scp -i %SSH_KEY% %SERVER_USER%@%SERVER_IP%:/tmp/server_info.txt %DESKTOP_FOLDER%\logs\

echo.
echo ===============================================
echo STEP 4: Creating Documentation
echo ===============================================

echo Creating backup documentation...
echo INVENTORY DASHBOARD - FINAL DELIVERY BACKUP > %DESKTOP_FOLDER%\documentation\BACKUP_INFO.txt
echo Date: %DATE% %TIME% >> %DESKTOP_FOLDER%\documentation\BACKUP_INFO.txt
echo. >> %DESKTOP_FOLDER%\documentation\BACKUP_INFO.txt
echo Server Details: >> %DESKTOP_FOLDER%\documentation\BACKUP_INFO.txt
echo - IP: %SERVER_IP% >> %DESKTOP_FOLDER%\documentation\BACKUP_INFO.txt
echo - User: %SERVER_USER% >> %DESKTOP_FOLDER%\documentation\BACKUP_INFO.txt
echo - Database: inventory_management >> %DESKTOP_FOLDER%\documentation\BACKUP_INFO.txt
echo. >> %DESKTOP_FOLDER%\documentation\BACKUP_INFO.txt
echo Files Created: >> %DESKTOP_FOLDER%\documentation\BACKUP_INFO.txt
echo - database\inventory_backup_29jan2026.sql (MySQL dump) >> %DESKTOP_FOLDER%\documentation\BACKUP_INFO.txt
echo - logs\server_info.txt (Server information) >> %DESKTOP_FOLDER%\documentation\BACKUP_INFO.txt
echo. >> %DESKTOP_FOLDER%\documentation\BACKUP_INFO.txt
echo Expected Database Size: 79-89 MB >> %DESKTOP_FOLDER%\documentation\BACKUP_INFO.txt

echo.
echo ===============================================
echo STEP 5: Verifying Backup
echo ===============================================

echo Checking downloaded files...
dir %DESKTOP_FOLDER%\database\
dir %DESKTOP_FOLDER%\logs\

echo.
echo Getting file sizes...
for %%f in (%DESKTOP_FOLDER%\database\*) do (
    echo Database file: %%~nxf - Size: %%~zf bytes
)

echo.
echo ===============================================
echo STEP 6: Cleanup Server Temporary Files
echo ===============================================

echo Cleaning up temporary files on server...
ssh -i %SSH_KEY% %SERVER_USER%@%SERVER_IP% "rm -f /tmp/inventory_backup_29jan2026.sql /tmp/server_info.txt && echo 'Temporary files cleaned up'"

echo.
echo ===============================================
echo BACKUP COMPLETED SUCCESSFULLY!
echo ===============================================
echo.
echo Backup Location: %DESKTOP_FOLDER%
echo.
echo Files Created:
echo - Database: %DESKTOP_FOLDER%\database\inventory_backup_29jan2026.sql
echo - Logs: %DESKTOP_FOLDER%\logs\server_info.txt  
echo - Documentation: %DESKTOP_FOLDER%\documentation\BACKUP_INFO.txt
echo.
echo The database backup is ready for final delivery!
echo.
pause