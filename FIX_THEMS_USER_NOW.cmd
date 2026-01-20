@echo off
echo ========================================
echo FIXING THEMS USER PERMISSIONS NOW
echo ========================================
echo.
echo This will give thems@company.com the correct permissions
echo without disabling the security system.
echo.

echo Running SQL fix...
mysql -u inventory_user -pStrongPass@123 inventory_db < COMPLETE_USER_PERMISSIONS_FIX.sql

echo.
echo ========================================
echo FIX COMPLETED!
echo ========================================
echo.
echo Now restart your server and test:
echo 1. Login as thems@company.com
echo 2. Try accessing products API
echo 3. Should work without 403 errors
echo.
echo If still getting 403 errors, the issue might be:
echo - Server needs restart
echo - Different permission name being checked
echo - Middleware configuration issue
echo.
pause