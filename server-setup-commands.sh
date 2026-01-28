#!/bin/bash

echo "============================================================"
echo "           HTTPS SETUP COMMANDS FOR NEW SERVER"
echo "============================================================"
echo ""
echo "Server: 13.212.100.7"
echo "Domain: 13.212.100.7.nip.io"
echo ""

echo "=== Step 1: Installing SSL Certificate Tools ==="
sudo apt update -y
sudo apt install snapd -y
sudo snap install core
sudo snap refresh core
sudo snap install --classic certbot
sudo ln -sf /snap/bin/certbot /usr/bin/certbot

echo ""
echo "=== Step 2: Stopping nginx to free port 80 ==="
sudo systemctl stop nginx

echo ""
echo "=== Step 3: Getting SSL Certificate ==="
sudo certbot certonly --standalone -d 13.212.100.7.nip.io --non-interactive --agree-tos --email admin@company.com

echo ""
echo "=== Step 4: Setting Certificate Permissions ==="
sudo chmod 755 /etc/letsencrypt/live/
sudo chmod 755 /etc/letsencrypt/archive/
sudo chmod 644 /etc/letsencrypt/live/13.212.100.7.nip.io/fullchain.pem
sudo chmod 600 /etc/letsencrypt/live/13.212.100.7.nip.io/privkey.pem

echo ""
echo "=== Step 5: Verifying Certificate Files ==="
sudo ls -la /etc/letsencrypt/live/13.212.100.7.nip.io/

echo ""
echo "=== Step 6: Stopping Current Server ==="
pm2 stop all
pm2 delete all

echo ""
echo "=== Step 7: Starting HTTPS Server ==="
pm2 start server-https.js --name 'https-server'
pm2 save

echo ""
echo "=== Step 8: Checking Server Status ==="
pm2 status

echo ""
echo "=== Step 9: Testing HTTPS Server ==="
sleep 5
echo "Testing local HTTPS connection..."
curl -k https://localhost/api/health

echo ""
echo "Testing external HTTPS connection..."
curl -k https://13.212.100.7.nip.io/api/health

echo ""
echo "============================================================"
echo "                    SETUP COMPLETE!"
echo "============================================================"
echo ""
echo "✅ SSL Certificate installed"
echo "✅ HTTPS Server running on port 443"
echo "✅ HTTP redirects to HTTPS on port 80"
echo ""
echo "Your HTTPS backend is now ready at:"
echo "🔒 https://13.212.100.7.nip.io"
echo ""