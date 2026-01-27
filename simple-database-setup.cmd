@echo off
echo Database Setup for Server 18.143.102.115
echo ==========================================

echo Step 1: Testing SSH connection...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@18.143.102.115 "echo SSH connection successful"

echo.
echo Step 2: Uploading database backup...
scp -i "C:\Users\Admin\e2c.pem" "C:\Users\Admin\Downloads\inventory_db_compressed (1).sql" ubuntu@18.143.102.115:~/backup.sql

echo.
echo Step 3: Setting up database on server...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@18.143.102.115 "sudo apt update && sudo apt install -y mysql-server && sudo systemctl start mysql && sudo mysql -e 'CREATE DATABASE IF NOT EXISTS inventory_db; CREATE USER IF NOT EXISTS \"inventory_user\"@\"localhost\" IDENTIFIED BY \"StrongPass@123\"; GRANT ALL PRIVILEGES ON inventory_db.* TO \"inventory_user\"@\"localhost\"; FLUSH PRIVILEGES;' && mysql -u inventory_user -pStrongPass@123 inventory_db < ~/backup.sql && echo 'Database setup completed successfully!'"

pause