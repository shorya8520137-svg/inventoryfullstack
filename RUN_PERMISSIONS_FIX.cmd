@echo off
echo ========================================
echo FIXING USER PERMISSIONS ISSUE
echo ========================================
echo.
echo This will fix the permissions system so regular users can access APIs
echo.
pause

echo Running SQL fix...
sudo mysql inventory_db < fix-user-permissions.sql

echo.
echo ========================================
echo PERMISSIONS FIX COMPLETED
echo ========================================
echo.
echo Now restart your server and test with regular users
echo.
pause