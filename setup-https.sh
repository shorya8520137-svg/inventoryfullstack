#!/bin/bash

echo "🔐 Setting up HTTPS with Self-Signed Certificate..."

# Create SSL directory
sudo mkdir -p /etc/nginx/ssl

# Generate self-signed certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/nginx/ssl/nginx.key \
  -out /etc/nginx/ssl/nginx.crt \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=16.171.161.150.nip.io"

echo "📝 Certificate created!"

# Update nginx config for HTTPS
sudo tee /etc/nginx/sites-available/inventory > /dev/null <<'EOF'
# HTTPS Server
server {
    listen 443 ssl;
    server_name 16.171.161.150.nip.io 16.171.161.150;

    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/nginx.crt;
    ssl_certificate_key /etc/nginx/ssl/nginx.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # CORS Headers
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization' always;

    # Backend API (Node.js on port 5000)
    location /api/ {
        if ($request_method = 'OPTIONS') {
            return 204;
        }
        
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }

    # Root endpoint
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name 16.171.161.150.nip.io 16.171.161.150;
    return 301 https://$server_name$request_uri;
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/inventory /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

echo ""
echo "✅ HTTPS configured with self-signed certificate!"
echo ""
echo "⚠️  IMPORTANT: Open these ports in AWS Security Group:"
echo "   1. Port 80 (HTTP) - for redirect"
echo "   2. Port 443 (HTTPS) - for API"
echo ""
echo "🧪 Test from server:"
echo "   curl -k https://localhost/api/inventory?limit=10"
echo ""
echo "🧪 Test from browser:"
echo "   https://16.171.161.150.nip.io/api/inventory?limit=10"
echo ""
echo "⚠️  Note: Browser will show 'Not Secure' warning because it's self-signed."
echo "   This is OK for development. Click 'Advanced' → 'Proceed' to continue."
