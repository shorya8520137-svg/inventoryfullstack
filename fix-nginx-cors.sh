#!/bin/bash

echo "🔧 Fixing Nginx CORS issue..."

# Create corrected nginx config WITHOUT duplicate CORS headers
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

    # ❌ REMOVED CORS HEADERS - Express handles them
    # Backend API (Node.js on port 5000)
    location /api/ {
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

# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx

echo ""
echo "✅ Nginx CORS fixed!"
echo "🧪 Test: https://16.171.161.150.nip.io/api/inventory?limit=10"
echo ""
echo "📝 The CORS headers are now only set by Express (server.js)"
echo "   No duplicate headers from nginx"
