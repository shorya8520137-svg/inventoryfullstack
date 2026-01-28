@echo off
echo ========================================
echo FIX DATABASE - ADD 2FA COLUMNS
echo ========================================
echo Server: 54.179.63.233
echo SSH Key: C:\Users\Admin\e2c.pem
echo Issue: Missing two_factor_enabled column
echo ========================================

echo.
echo Step 1: Uploading 2FA SQL script to server...
scp -i "C:\Users\Admin\e2c.pem" add-2fa-columns.sql ubuntu@54.179.63.233:~/add-2fa-columns.sql

if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to upload SQL script
    pause
    exit /b 1
)

echo.
echo Step 2: Checking current database structure...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "mysql -u inventory_user -pStrongPass@123 inventory_db -e 'DESCRIBE users;'"

echo.
echo Step 3: Adding 2FA columns to database...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "mysql -u inventory_user -pStrongPass@123 inventory_db < ~/add-2fa-columns.sql"

if %ERRORLEVEL% neq 0 (
    echo ERROR: Failed to add 2FA columns
    pause
    exit /b 1
)

echo.
echo Step 4: Verifying 2FA columns were added...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "mysql -u inventory_user -pStrongPass@123 inventory_db -e 'DESCRIBE users;' | grep two_factor"

echo.
echo Step 5: Testing admin login after database fix...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "curl -s -X POST http://localhost:5000/api/auth/login -H 'Content-Type: application/json' -d '{\"email\": \"admin@company.com\", \"password\": \"Admin@123\"}'"

echo.
echo Step 6: Cleaning up...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "rm -f ~/add-2fa-columns.sql"

echo.
echo ========================================
echo Database Fix Complete!
echo ========================================
echo.
echo The database should now have:
echo - two_factor_enabled column
echo - two_factor_secret column  
echo - two_factor_backup_codes column
echo - two_factor_setup_at column
echo.
echo Admin login should now work!
echo ========================================

pause