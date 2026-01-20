@echo off
echo Deploying CMS role permissions fix...

echo Copying SQL file to server...
scp -i "C:\Users\Admin\awsconection.pem" fix-cms-role-permissions.sql ubuntu@13.48.248.180:/tmp/

echo Executing SQL commands on server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "sudo mysql inventory_db < /tmp/fix-cms-role-permissions.sql"

echo Testing CMS role functionality...
node test-cms-role-functionality.js

echo CMS role permissions fix completed!
pause