@echo off
echo ========================================
echo 🚀 SIMPLE FRONTEND SETUP ON AWS
echo ========================================

echo.
echo 📋 This will setup frontend on AWS server with backend
echo 🌐 Both will run on same HTTPS domain
echo.

ssh -i "C:\Users\Admin\e2c.pem" ubuntu@13.212.182.78 << 'ENDSSH'

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

sudo systemctl restart nginx

echo "🚀 Starting backend..."
nohup node server.js > backend.log 2>&1 &

echo "⏳ Waiting for backend to start..."
sleep 5

echo "🚀 Starting frontend..."
nohup npm start > frontend.log 2>&1 &

echo "⏳ Waiting for frontend to start..."
sleep 10

echo "✅ Testing setup..."
curl -k https://localhost/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"admin@company.com","password":"Admin@123"}' || echo "❌ API test failed"

echo "========================================="
echo "✅ SETUP COMPLETE!"
echo "🌐 Frontend: https://13.212.182.78.nip.io"
echo "🔧 Backend: https://13.212.182.78.nip.io/api"
echo "📋 Backend logs: tail -f ~/inventoryfullstack/backend.log"
echo "📋 Frontend logs: tail -f ~/inventoryfullstack/frontend.log"
echo "========================================="

ENDSSH

echo.
echo ✅ Setup complete! 
echo 🌐 Access: https://13.212.182.78.nip.io
echo.
pause