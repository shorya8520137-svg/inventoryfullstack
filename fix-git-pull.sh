#!/bin/bash

echo "🔧 Fixing git pull conflict and getting latest code..."

cd ~/inventoryfullstack

echo "📋 Backing up current .env.production..."
cp .env.production .env.production.backup 2>/dev/null || true

echo "🗑️ Stashing local changes..."
git stash

echo "📥 Pulling latest code from GitHub..."
git pull origin main

echo "✅ Latest code pulled successfully!"

echo "🔧 Setting up correct environment for HTTP..."
cat > .env.production << 'EOF'
NEXT_PUBLIC_API_BASE=http://13.212.182.78
NODE_ENV=production
NEXT_PUBLIC_API_TIMEOUT=30000
EOF

echo "📋 Files now available:"
ls -la simple-http-setup.sh 2>/dev/null && echo "✅ simple-http-setup.sh - Ready to run!"
ls -la start-fullstack.sh 2>/dev/null && echo "✅ start-fullstack.sh - Available"
ls -la stop-fullstack.sh 2>/dev/null && echo "✅ stop-fullstack.sh - Available"

echo ""
echo "🚀 Ready to run setup!"
echo "Run: chmod +x simple-http-setup.sh && ./simple-http-setup.sh"