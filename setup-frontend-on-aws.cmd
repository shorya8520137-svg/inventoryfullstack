@echo off
echo ========================================
echo 🚀 SETUP FRONTEND ON AWS SERVER
echo ========================================

echo.
echo 📋 This script will:
echo 1. SSH into AWS server
echo 2. Install Node.js and npm if needed
echo 3. Build the Next.js frontend
echo 4. Setup nginx to serve frontend on port 80/443
echo 5. Configure backend API on port 5000
echo 6. Test the complete setup
echo.

pause

echo.
echo 🔧 Connecting to AWS server...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@13.212.182.78 << 'ENDSSH'

echo "========================================="
echo "🔧 FRONTEND SETUP ON AWS SERVER"
echo "========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js already installed: $(node --version)"
fi

# Navigate to project directory
cd ~/inventoryfullstack

echo "📦 Installing dependencies..."
npm install

echo "🏗️ Building Next.js frontend..."
npm run build

echo "🔧 Setting up nginx configuration for frontend + backend..."
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
    
    # Serve Next.js static files
    location /_next/static/ {
        alias /home/ubuntu/inventoryfullstack/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API routes - proxy to backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Frontend - serve Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

echo "🔄 Restarting nginx..."
sudo systemctl restart nginx

echo "🔧 Creating environment file for production..."
cat > .env.production << 'EOF'
# Production Environment - Same server setup
NEXT_PUBLIC_API_BASE=https://13.212.182.78.nip.io
NODE_ENV=production
NEXT_PUBLIC_API_TIMEOUT=30000
EOF

echo "🔧 Creating PM2 ecosystem file..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'inventory-backend',
      script: 'server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    },
    {
      name: 'inventory-frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
EOF

# Install PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    sudo npm install -g pm2
fi

echo "🚀 Starting applications with PM2..."
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js

echo "💾 Saving PM2 configuration..."
pm2 save
pm2 startup

echo "========================================="
echo "✅ SETUP COMPLETE!"
echo "========================================="
echo "🌐 Frontend: https://13.212.182.78.nip.io"
echo "🔧 Backend API: https://13.212.182.78.nip.io/api"
echo "📊 PM2 Status: pm2 status"
echo "📋 PM2 Logs: pm2 logs"
echo "========================================="

ENDSSH

echo.
echo ✅ Frontend setup complete!
echo 🌐 Access your app at: https://13.212.182.78.nip.io
echo.
pause