@echo off
echo Creating cms-hunyhunyprmession role...

echo Copying SQL file to server...
scp -i "C:\Users\Admin\awsconection.pem" "create-cms-role-database.sql" ubuntu@13.48.248.180:/tmp/create_cms_role.sql

echo Executing SQL on server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "sudo mysql inventory_db < /tmp/create_cms_role.sql"

echo Done! cms-hunyhunyprmession role should now be created.
pause