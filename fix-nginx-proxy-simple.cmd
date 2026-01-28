@echo off
echo ========================================
echo SIMPLE NGINX REVERSE PROXY FIX
echo ========================================
echo Server: 54.179.63.233
echo Solution: Forward ALL requests to localhost:5000
echo No fancy routing - super simple!
echo ========================================

echo.
echo Step 1: Creating simple nginx config...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "sudo tee /etc/nginx/sites-available/default > /dev/null << 'EOF'
server {
    listen 80;
    server_name 54.179.63.233.nip.io;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF"

echo.
echo Step 2: Testing nginx configuration...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "sudo nginx -t"

if %ERRORLEVEL% neq 0 (
    echo ERROR: Nginx configuration test failed!
    pause
    exit /b 1
)

echo.
echo Step 3: Reloading nginx...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "sudo systemctl reload nginx"

echo.
echo Step 4: Testing the fix...
timeout /t 3 /nobreak > nul

echo.
echo Testing HTTP access...
curl -s --connect-timeout 10 http://54.179.63.233.nip.io/api/health

echo.
echo ========================================
echo NGINX REVERSE PROXY CONFIGURED!
echo ========================================
echo.
echo ✅ All requests now forwarded to Node.js
echo 🔗 Test URL: http://54.179.63.233.nip.io
echo 📡 API URL: http://54.179.63.233.nip.io/api/auth/login
echo.
echo Flow: Browser → nginx:80 → localhost:5000 → Node API
echo ========================================

pause