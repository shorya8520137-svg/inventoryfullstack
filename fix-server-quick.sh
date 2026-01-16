#!/bin/bash
# Quick fix for server.js and restart

echo "🔧 Fixing server.js..."

# Fix the malformed line
sed -i 's|app.use(" /api, require(./routes/permissionsRoutes));|app.use("/api", require("./routes/permissionsRoutes"));|g' server.js

echo "✅ Fixed! Checking..."
grep -n "permissionsRoutes" server.js

echo "🔄 Restarting server..."
pkill -9 node
sleep 2
nohup node server.js > server.log 2>&1 &

echo "⏳ Waiting for server to start..."
sleep 5

echo "📊 Server status:"
ps aux | grep "node server.js" | grep -v grep

echo "✅ Done! Check server.log for details"
tail -10 server.log
