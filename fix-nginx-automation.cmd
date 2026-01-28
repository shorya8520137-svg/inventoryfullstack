@echo off
echo ========================================
echo NGINX REVERSE PROXY AUTOMATION
echo ========================================

echo Step 1: Creating nginx config file...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "echo 'server {' | sudo tee /etc/nginx/sites-available/default"
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "echo '    listen 80;' | sudo tee -a /etc/nginx/sites-available/default"
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "echo '    server_name 54.179.63.233.nip.io;' | sudo tee -a /etc/nginx/sites-available/default"
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "echo '' | sudo tee -a /etc/nginx/sites-available/default"
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "echo '    location / {' | sudo tee -a /etc/nginx/sites-available/default"
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "echo '        proxy_pass http://127.0.0.1:5000;' | sudo tee -a /etc/nginx/sites-available/default"
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "echo '        proxy_http_version 1.1;' | sudo tee -a /etc/nginx/sites-available/default"
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "echo '        proxy_set_header Upgrade \$http_upgrade;' | sudo tee -a /etc/nginx/sites-available/default"
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "echo '        proxy_set_header Connection upgrade;' | sudo tee -a /etc/nginx/sites-available/default"
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "echo '        proxy_set_header Host \$host;' | sudo tee -a /etc/nginx/sites-available/default"
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "echo '        proxy_set_header X-Real-IP \$remote_addr;' | sudo tee -a /etc/nginx/sites-available/default"
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "echo '        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;' | sudo tee -a /etc/nginx/sites-available/default"
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "echo '        proxy_set_header X-Forwarded-Proto \$scheme;' | sudo tee -a /etc/nginx/sites-available/default"
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "echo '        proxy_cache_bypass \$http_upgrade;' | sudo tee -a /etc/nginx/sites-available/default"
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "echo '    }' | sudo tee -a /etc/nginx/sites-available/default"
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "echo '}' | sudo tee -a /etc/nginx/sites-available/default"

echo.
echo Step 2: Testing nginx config...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "sudo nginx -t"

echo.
echo Step 3: Reloading nginx...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "sudo systemctl reload nginx"

echo.
echo Step 4: Testing connection...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "curl -s http://localhost/api/health | head -c 200"

echo.
echo ========================================
echo NGINX PROXY CONFIGURED!
echo ========================================
echo Frontend should now connect to backend
echo Test: http://54.179.63.233.nip.io/api/health
echo ========================================

pause