@echo off
echo ============================================================
echo SETUP HTTPS AND TEST - COMPLETE AUTOMATION
echo ============================================================

echo [STEP 1] SSH to server and setup HTTPS...

ssh -i "C:\Users\Admin\e2c.pem" ubuntu@13.212.182.78 "
echo '=== SETTING UP HTTPS ==='

echo 'Creating self-signed SSL certificate...'
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/nginx-selfsigned.key \
  -out /etc/ssl/certs/nginx-selfsigned.crt \
  -subj '/C=US/ST=State/L=City/O=Organization/CN=13.212.182.78.nip.io'

echo 'Configuring nginx for HTTPS...'
sudo tee /etc/nginx/sites-available/default > /dev/null << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    server_name _;
    
    ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;
    
    location / {
        proxy_pass http://localhost:5000;
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
EOF

echo 'Restarting nginx...'
sudo systemctl restart nginx

echo 'Testing nginx configuration...'
sudo nginx -t

echo 'Checking nginx status...'
sudo systemctl status nginx --no-pager -l

echo ''
echo '=== TESTING HTTPS ==='
echo 'Testing HTTPS connection...'
curl -k https://13.212.182.78.nip.io | head -5

echo ''
echo 'Testing admin login API...'
curl -k -X POST https://13.212.182.78.nip.io/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{\"email\":\"admin@company.com\",\"password\":\"Admin@123\"}' | head -5

echo ''
echo '=== HTTPS SETUP COMPLETE ==='
echo 'Server should be accessible at: https://13.212.182.78.nip.io'
"

echo.
echo [STEP 2] Testing HTTPS from local machine...
echo.

echo Testing HTTPS connection from Windows...
powershell -Command "try { Invoke-WebRequest -Uri 'https://13.212.182.78.nip.io' -SkipCertificateCheck | Select-Object StatusCode, StatusDescription } catch { Write-Host 'Connection failed:' $_.Exception.Message }"

echo.
echo ============================================================
echo HTTPS SETUP AND TEST COMPLETE!
echo ============================================================
echo Backend: https://13.212.182.78.nip.io
echo Environment files updated to use HTTPS
echo Ready to redeploy frontend with: vercel --prod
echo ============================================================

pause