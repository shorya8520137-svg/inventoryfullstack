@echo off
echo QUICK DATABASE BACKUP - inventory_db
echo.

echo Step 1: Creating backup on server (this may take 2-3 minutes for 80MB database)...
ssh -i "C:\Users\Admin\e2c.pem" -o ConnectTimeout=30 ubuntu@54.169.107.64 "sudo mysqldump -u root -p'Admin@123' inventory_db > backup.sql && echo 'Backup created' && ls -lh backup.sql"

echo.
echo Step 2: Downloading to desktop...
scp -i "C:\Users\Admin\e2c.pem" -o ConnectTimeout=30 ubuntu@54.169.107.64:backup.sql "C:\Users\Admin\Desktop\inventory dashbord final devlivery at 29th jan\inventory_db_backup.sql"

echo.
echo Step 3: Checking downloaded file...
dir "C:\Users\Admin\Desktop\inventory dashbord final devlivery at 29th jan\inventory_db_backup.sql"

echo.
echo DONE! Check the desktop folder for inventory_db_backup.sql
pause