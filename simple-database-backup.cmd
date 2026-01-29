@echo off
echo ===============================================
echo INVENTORY DASHBOARD DATABASE BACKUP
echo Final Delivery - 29th January 2026
echo ===============================================

set FOLDER="C:\Users\Admin\Desktop\inventory dashbord final devlivery at 29th jan"

echo.
echo Step 1: Creating database dump on server...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "sudo mysqldump -u root -p'Admin@123' --single-transaction --routines --triggers inventory_management > /home/ubuntu/inventory_backup_final.sql"

echo.
echo Step 2: Downloading database to desktop folder...
scp -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64:/home/ubuntu/inventory_backup_final.sql %FOLDER%\

echo.
echo Step 3: Checking file size...
dir %FOLDER%\inventory_backup_final.sql

echo.
echo Step 4: Creating backup info...
echo INVENTORY DASHBOARD - FINAL DELIVERY > %FOLDER%\BACKUP_INFO.txt
echo Date: %DATE% %TIME% >> %FOLDER%\BACKUP_INFO.txt
echo Database: inventory_management >> %FOLDER%\BACKUP_INFO.txt
echo Server: 54.169.107.64 >> %FOLDER%\BACKUP_INFO.txt
echo File: inventory_backup_final.sql >> %FOLDER%\BACKUP_INFO.txt

echo.
echo ===============================================
echo BACKUP COMPLETED!
echo Location: %FOLDER%
echo ===============================================
pause