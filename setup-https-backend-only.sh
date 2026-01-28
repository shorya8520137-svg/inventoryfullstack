#!/bin/bash

echo "🔒 SETUP HTTPS BACKEND FOR VERCEL FRONTEND"
echo "========================================="

cd ~/inventoryfullstack

echo "🛑 Stopping existing processes..."
pkill -f "node server.js" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true

echo "🔧 Creating self-signed SSL certificate..."
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
-keyout /etc/ssl/private/nginx-selfsigned.key \
-out /etc/ssl/certs/nginx-selfsigned.crt \
-subj "/C=US/ST=State/L=City/O=Organization/CN=13.212.182.78"

echo "🔧 Configuring nginx for HTTPS backend only..."
sudo tee /etc/nginx/sites-available/default > /dev/null << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl default_server;
    listen [::]:443 ssl default_server;
    server_name _;
    
    ssl_certificate /etc/ssl/certs/nginx-selfsigned.crt;
    ssl_certificate_key /etc/ssl/private/nginx-selfsigned.key;
    
    # CORS headers for Vercel frontend
    add_header 'Access-Control-Allow-Origin' 'https://stockiqfullstacktest.vercel.app' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;
    
    # Handle preflight requests
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'https://stockiqfullstacktest.vercel.app' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        add_header 'Content-Length' 0;
        add_header 'Content-Type' 'text/plain charset=UTF-8';
        return 204;
    }
    
    # Proxy all requests to backend
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

echo "🔄 Restarting nginx..."
sudo systemctl restart nginx

echo "🚀 Starting backend on port 5000..."
nohup node server.js > backend.log 2>&1 &
BACKEND_PID=$!

sleep 3

echo "✅ Testing HTTPS backend..."
curl -k https://localhost/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"admin@company.com","password":"Admin@123"}' | head -5

echo ""
echo "========================================="
echo "✅ HTTPS BACKEND SETUP COMPLETE!"
echo "========================================="
echo "🔒 Backend: https://13.212.182.78/api"
echo "🌐 Frontend: https://stockiqfullstacktest.vercel.app"
echo "📋 Backend PID: $BACKEND_PID"
echo "📋 Backend logs: tail -f backend.log"
echo ""
echo "🔧 Update Vercel environment to:"
echo "NEXT_PUBLIC_API_BASE=https://13.212.182.78"
echo "========================================="