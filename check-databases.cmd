@echo off
echo Checking available databases on server...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "sudo mysql -u root -p'Admin@123' -e 'SHOW DATABASES;'"
pause