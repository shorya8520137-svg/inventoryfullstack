#!/bin/bash

echo "🔄 ROLLING BACK SERVER FROM GITHUB..."
echo "======================================"

# Navigate to project directory
cd /var/www/stockiqfullstacktest || {
    echo "❌ Failed to navigate to project directory"
    exit 1
}

echo "📍 Current directory: $(pwd)"

# Stop the backend service
echo "🛑 Stopping backend service..."
sudo systemctl stop stockiq-backend || echo "⚠️  Service might not be running"

# Check git status
echo "📊 Checking git status..."
git status

# Discard all local changes
echo "🗑️  Discarding all local changes..."
git restore .

# Remove all untracked files and directories
echo "🧹 Cleaning untracked files..."
git clean -fd

# Pull latest from GitHub
echo "⬇️  Pulling latest from GitHub..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if PM2 is managing the process
if pm2 list | grep -q "stockiq-backend"; then
    echo "🔄 Restarting with PM2..."
    pm2 restart stockiq-backend
    pm2 logs stockiq-backend --lines 20
else
    # Start with systemctl
    echo "🚀 Starting backend service..."
    sudo systemctl start stockiq-backend
    sudo systemctl status stockiq-backend
fi

echo ""
echo "✅ SERVER ROLLBACK COMPLETE!"
echo "======================================"
echo "🔍 Checking service status..."
sleep 3

# Test the server
curl -s http://localhost:5000/ | head -5 || echo "⚠️  Server might still be starting..."

echo ""
echo "📋 Next steps:"
echo "1. Check server logs: sudo journalctl -u stockiq-backend -f"
echo "2. Or PM2 logs: pm2 logs stockiq-backend"
echo "3. Test API: curl http://your-server-ip:5000/"