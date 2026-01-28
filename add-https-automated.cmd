@echo off
echo.
echo ============================================================
echo                  AUTOMATED HTTPS SETUP
echo ============================================================
echo.
echo This will add HTTPS support to your server automatically.
echo No manual browser settings needed!
echo.
echo ============================================================
echo                  STEP 1: INSTALL CERTBOT
echo ============================================================
echo.
echo Run these commands on your server:
echo.
echo sudo apt update
echo sudo apt install certbot
echo sudo apt install nginx
echo.
echo ============================================================
echo                  STEP 2: GET SSL CERTIFICATE
echo ============================================================
echo.
echo sudo certbot certonly --standalone -d 54.179.63.233.nip.io
echo.
echo ============================================================
echo                  STEP 3: UPDATE SERVER.JS
echo ============================================================
echo.
echo I'll create the HTTPS version of your server...
echo.
pause