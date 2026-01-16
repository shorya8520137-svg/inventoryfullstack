#!/bin/bash
# Quick test - comment out problematic routes temporarily

cd /home/ubuntu/inventoryfullstack

echo "🔧 Temporarily disabling problematic routes..."

# Comment out getSystemStats route
sed -i '560,565s|^|// |g' routes/permissionsRoutes.js

echo "🔄 Restarting server..."
pkill -9 node
sleep 2
nohup node server.js > server.log 2>&1 &

sleep 5

echo "📊 Server status:"
ps aux | grep "node server.js" | grep -v grep

if [ $? -eq 0 ]; then
    echo "✅ Server is running!"
    echo ""
    echo "🧪 Testing login..."
    curl -s -X POST http://localhost:5000/api/auth/login \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@company.com","password":"admin@123"}' | head -100
else
    echo "❌ Server failed to start"
    tail -20 server.log
fi
