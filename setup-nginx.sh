#!/bin/bash

echo "🔧 Setting up Nginx for Inventory App..."

# Install nginx
sudo apt update
sudo apt install nginx -y

# Create nginx config
sudo tee /etc/nginx/sites-available/inventory > /dev/null <<'EOF'
server {
    listen 80;
    server_name 16.171.161.150.nip.io 16.171.161.150;

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
    }
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

echo "✅ Nginx configured!"
echo "📝 Make sure port 80 is open in AWS Security Group"
echo "🧪 Test: http://16.171.161.150/api/inventory?limit=10"
