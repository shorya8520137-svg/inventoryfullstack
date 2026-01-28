#!/bin/bash

echo "========================================"
echo "🚀 FRONTEND SETUP ON AWS SERVER"
echo "========================================"

echo ""
echo "📋 This will setup frontend on AWS server with backend"
echo "🌐 Both will run on same HTTPS domain"
echo ""

# Navigate to project directory
cd ~/inventoryfullstack

echo "🔧 Installing dependencies..."
npm install

echo "🏗️ Building frontend..."
npm run build

echo "🔧 Creating production environment..."
cat > .env.production << 'EOF'
NEXT_PUBLIC_API_BASE=https://13.212.182.78.nip.io
NODE_ENV=production
NEXT_PUBLIC_API_TIMEOUT=30000
EOF

echo "🔧 Updating nginx config..."
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
    
    # API routes to backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

echo "🔄 Restarting nginx..."
sudo systemctl restart nginx

echo "🛑 Stopping any existing processes..."
pkill -f "node server.js" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true
pkill -f "next start" 2>/dev/null || true

echo "🚀 Starting backend..."
nohup node server.js > backend.log 2>&1 &
BACKEND_PID=$!

echo "⏳ Waiting for backend to start..."
sleep 5

echo "🚀 Starting frontend..."
nohup npm start > frontend.log 2>&1 &
FRONTEND_PID=$!

echo "⏳ Waiting for frontend to start..."
sleep 10

echo "✅ Testing backend API..."
curl -k https://localhost/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"admin@company.com","password":"Admin@123"}' || echo "❌ API test failed"

echo ""
echo "✅ Testing frontend..."
curl -k https://localhost/ | head -10 || echo "❌ Frontend test failed"

echo ""
echo "========================================="
echo "✅ SETUP COMPLETE!"
echo "========================================="
echo "🌐 Frontend: https://13.212.182.78.nip.io"
echo "🔧 Backend: https://13.212.182.78.nip.io/api"
echo "📋 Backend PID: $BACKEND_PID"
echo "📋 Frontend PID: $FRONTEND_PID"
echo "📋 Backend logs: tail -f ~/inventoryfullstack/backend.log"
echo "📋 Frontend logs: tail -f ~/inventoryfullstack/frontend.log"
echo "🔍 Check processes: ps aux | grep node"
echo "🛑 Stop processes: pkill -f 'node server.js' && pkill -f 'npm start'"
echo "========================================="