# HTTPS Setup and Test Script
Write-Host "============================================================"
Write-Host "SETUP HTTPS AND TEST - SIMPLE VERSION"
Write-Host "============================================================"

Write-Host "[STEP 1] SSH to server and setup HTTPS..."

# SSH command to setup HTTPS
$sshCommand = @"
echo '=== SETTING UP HTTPS ==='
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/ssl/private/nginx-selfsigned.key -out /etc/ssl/certs/nginx-selfsigned.crt -subj '/C=US/ST=State/L=City/O=Organization/CN=13.212.182.78.nip.io'

sudo tee /etc/nginx/sites-available/default > /dev/null << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 301 https://`$server_name`$request_uri;
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
        proxy_set_header Upgrade `$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
        proxy_set_header X-Forwarded-For `$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto `$scheme;
        proxy_cache_bypass `$http_upgrade;
    }
}
EOF

sudo systemctl restart nginx
curl -k https://13.212.182.78.nip.io
"@

# Execute SSH command
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@13.212.182.78 $sshCommand

Write-Host ""
Write-Host "[STEP 2] Testing HTTPS from local machine..."

try {
    $response = Invoke-WebRequest -Uri "https://13.212.182.78.nip.io" -SkipCertificateCheck
    Write-Host "✅ HTTPS working! Status: $($response.StatusCode)"
} catch {
    Write-Host "❌ HTTPS test failed: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "============================================================"
Write-Host "HTTPS SETUP COMPLETE!"
Write-Host "Backend: https://13.212.182.78.nip.io"
Write-Host "Ready to redeploy frontend with: vercel --prod"
Write-Host "============================================================"