@echo off
echo ========================================
echo ADD HTTPS TO SERVER - AUTOMATED SETUP
echo ========================================
echo.
echo This will:
echo - Install SSL certificate using Let's Encrypt
echo - Configure nginx for HTTPS
echo - Enable automatic HTTP to HTTPS redirect
echo.
echo Server: 54.179.63.233
echo Domain: 54.179.63.233.nip.io
echo ========================================

echo.
echo Step 1: Connecting to server...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "
echo '🔧 Installing Certbot...'
sudo apt update -y
sudo apt install certbot python3-certbot-nginx -y

echo '📋 Current nginx configuration:'
sudo nginx -t

echo '🔐 Installing SSL certificate...'
sudo certbot --nginx -d 54.179.63.233.nip.io --non-interactive --agree-tos --email admin@company.com --redirect

echo '✅ Testing nginx configuration...'
sudo nginx -t

echo '🔄 Reloading nginx...'
sudo systemctl reload nginx

echo '🎯 Testing HTTPS...'
curl -I https://54.179.63.233.nip.io/api/health

echo '========================================='
echo '✅ HTTPS SETUP COMPLETE!'
echo '========================================='
echo 'Your API is now available at:'
echo 'https://54.179.63.233.nip.io'
echo '========================================='
"

if %ERRORLEVEL% neq 0 (
    echo ERROR: HTTPS setup failed!
    echo.
    echo Manual steps:
    echo 1. SSH: ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233
    echo 2. Install: sudo apt install certbot python3-certbot-nginx -y
    echo 3. SSL: sudo certbot --nginx -d 54.179.63.233.nip.io
    echo 4. Test: curl -I https://54.179.63.233.nip.io
    pause
    exit /b 1
)

echo.
echo ========================================
echo HTTPS SETUP SUCCESSFUL!
echo ========================================
echo.
echo ✅ SSL Certificate: Installed
echo ✅ Nginx HTTPS: Configured  
echo ✅ Auto Redirect: HTTP → HTTPS
echo.
echo 🌐 Your API is now secure:
echo https://54.179.63.233.nip.io
echo.
echo 📋 NEXT STEPS:
echo 1. Update frontend environment
echo 2. Rebuild and redeploy frontend
echo 3. Test login (should work now!)
echo ========================================

pause