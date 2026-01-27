@echo off
echo 🔧 SETTING UP 2FA DATABASE COLUMNS
echo =====================================

echo.
echo 📋 This script will add 2FA columns to the users table
echo 💡 You need to run this on the server with sudo access

echo.
echo 🚀 Running database setup...
node add-2fa-columns-with-sudo.js

echo.
echo ✅ Setup completed!
echo 💡 If successful, restart your server and visit /2fa-setup

pause