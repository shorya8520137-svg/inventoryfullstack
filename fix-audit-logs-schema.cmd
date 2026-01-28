@echo off
echo ========================================
echo FIXING AUDIT_LOGS TABLE SCHEMA
echo ========================================
echo.
echo This script will update your audit_logs table with missing columns:
echo - user_name, user_email, user_role
echo - resource_name, description  
echo - request_method, request_url
echo - location_country, location_city, location_region, location_coordinates
echo - Missing indexes for performance
echo.
echo Current server: 54.169.107.64
echo Database: inventory_db
echo.
pause

echo Uploading SQL file to server...
scp -i "C:\Users\Admin\e2c.pem" fix-audit-logs-schema.sql ubuntu@54.169.107.64:~/

echo.
echo Connecting to server and running SQL script...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.169.107.64 "sudo mysql inventory_db < fix-audit-logs-schema.sql"

echo.
echo ========================================
echo AUDIT_LOGS SCHEMA UPDATE COMPLETE!
echo ========================================
echo.
echo The audit_logs table now includes:
echo ✅ Complete user information tracking
echo ✅ Resource names and descriptions  
echo ✅ HTTP request details
echo ✅ Location tracking with country/city/region
echo ✅ Performance indexes
echo ✅ Your existing data is preserved
echo.
echo You can now use the full audit logging system!
echo.
pause