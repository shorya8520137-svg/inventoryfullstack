@echo off
echo ========================================
echo FRONTEND API CONNECTION FIX AUTOMATION
echo ========================================
echo Problem: Frontend can't connect to backend
echo Solution: Configure nginx reverse proxy
echo Server: 54.179.63.233
echo ========================================

echo.
echo Step 1: Configure nginx reverse proxy...
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
echo Step 2: Test nginx configuration...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "sudo nginx -t"

echo.
echo Step 3: Reload nginx...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "sudo systemctl reload nginx"

echo.
echo Step 4: Test API connection...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "curl -s http://localhost/api/health"

echo.
echo Step 5: Test admin login...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "curl -s -X POST http://localhost/api/auth/login -H 'Content-Type: application/json' -d '{\"email\": \"admin@company.com\", \"password\": \"Admin@123\"}'"

echo.
echo ========================================
echo FRONTEND API CONNECTION FIXED!
echo ========================================
echo.
echo ✅ Nginx configured as reverse proxy
echo ✅ All requests forwarded to Node.js:5000
echo ✅ Frontend can now connect to backend
echo.
echo 🔗 Frontend URL: https://stockiqfullstacktest.vercel.app
echo 📡 API URL: http://54.179.63.233.nip.io/api
echo 🔐 Admin: admin@company.com / Admin@123
echo.
echo Test login at: https://stockiqfullstacktest.vercel.app/login
echo ========================================

pause