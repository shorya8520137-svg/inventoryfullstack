@echo off
echo ========================================
echo QUICK NGINX REVERSE PROXY FIX
echo ========================================

echo Step 1: Creating nginx config...
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
echo Step 2: Testing nginx config...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "sudo nginx -t"

echo.
echo Step 3: Reloading nginx...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "sudo systemctl reload nginx"

echo.
echo ========================================
echo NGINX CONFIGURED!
echo ========================================
echo Test manually: http://54.179.63.233.nip.io
echo ========================================

pause