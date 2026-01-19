@echo off
echo Fixing test user permissions...

echo Copying SQL file to server...
scp -i "C:\Users\Admin\awsconection.pem" "fix-test-user-permissions.sql" ubuntu@13.48.248.180:/tmp/fix_test_permissions.sql

echo Executing SQL on server...
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "sudo mysql inventory_db < /tmp/fix_test_permissions.sql"

echo Done! Test user permissions should now be fixed.
pause