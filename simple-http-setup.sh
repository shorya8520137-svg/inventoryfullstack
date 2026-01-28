#!/bin/bash

echo "🚀 SIMPLE HTTP SETUP - NO HTTPS, NO .NIP.IO"
echo "========================================="

cd ~/inventoryfullstack

echo "🛑 Stopping existing processes..."
pkill -f "node server.js" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true

echo "🧹 Cleaning node_modules..."
rm -rf node_modules
rm -rf .next

echo "📦 Fresh install..."
npm install

echo "🔧 Creating simple HTTP environment..."
cat > .env.production << 'EOF'
NEXT_PUBLIC_API_BASE=http://13.212.182.78
NODE_ENV=production
NEXT_PUBLIC_API_TIMEOUT=30000
EOF

echo "🔧 Simple nginx config for HTTP..."
sudo tee /etc/nginx/sites-available/default > /dev/null << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;
    
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

sudo systemctl restart nginx

echo "🏗️ Building frontend..."
npm run build

echo "🚀 Starting backend on port 5000..."
nohup node server.js > backend.log 2>&1 &
BACKEND_PID=$!

sleep 3

echo "🚀 Starting frontend on port 3000..."
nohup npm start > frontend.log 2>&1 &
FRONTEND_PID=$!

sleep 5

echo "✅ Testing backend..."
curl http://localhost:5000/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"admin@company.com","password":"Admin@123"}' | head -5

echo ""
echo "✅ Testing frontend..."
curl http://localhost:3000/ | head -5

echo ""
echo "========================================="
echo "✅ SIMPLE HTTP SETUP COMPLETE!"
echo "========================================="
echo "🌐 Frontend: http://13.212.182.78"
echo "🔧 Backend: http://13.212.182.78/api"
echo "📋 Backend PID: $BACKEND_PID"
echo "📋 Frontend PID: $FRONTEND_PID"
echo "📋 Backend logs: tail -f backend.log"
echo "📋 Frontend logs: tail -f frontend.log"
echo "🔍 Check: ps aux | grep node"
echo "========================================="