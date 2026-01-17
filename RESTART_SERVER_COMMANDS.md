# 🔄 RESTART SERVER COMMANDS

## Option 1: Run the Script (Recommended)

SSH to your server and run these commands:

```bash
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150
cd /home/ubuntu/inventoryfullstack

# Create the restart script
cat > restart-test.sh << 'EOF'
#!/bin/bash

echo "🔄 RESTART SERVER AND RUN COMPREHENSIVE TEST"
echo "============================================"

cd /home/ubuntu/inventoryfullstack
echo "📍 Current directory: $(pwd)"
echo ""

# Stop server
echo "🛑 STOPPING SERVER"
echo "=================="
pkill -f "node server.js" 2>/dev/null || echo "No server found"
sleep 2
ps aux | grep node | grep -v grep || echo "No node processes"
echo ""

# Start server
echo "🚀 STARTING SERVER"
echo "=================="
nohup node server.js > server.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"
sleep 3
ps aux | grep "node server.js" | grep -v grep
echo ""

# Health check
echo "🏥 HEALTH CHECK"
echo "=============="
curl -s --max-time 5 http://localhost:5000/
echo ""
echo ""

# Database check
echo "📊 DATABASE CHECK"
echo "================"
mysql -u inventory_user -pStrongPass@123 inventory_db -e "SELECT COUNT(*) as users FROM users;" 2>/dev/null
mysql -u inventory_user -pStrongPass@123 inventory_db -e "SELECT id, username, email, role FROM users LIMIT 3;" 2>/dev/null
echo ""

# API test
echo "🧪 API TEST"
echo "==========="
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@admin.com","password":"admin123"}')
echo "Login response: $LOGIN_RESPONSE"

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -n "$TOKEN" ] && [ ${#TOKEN} -gt 10 ]; then
    echo "✅ Token: ${TOKEN:0:30}..."
    echo "Testing APIs..."
    curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/users | head -2
    echo ""
    curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/products | head -2
else
    echo "❌ No token received"
fi

echo ""
echo "🎯 TEST COMPLETED!"
echo "Server PID: $SERVER_PID"
EOF

# Make executable and run
chmod +x restart-test.sh
./restart-test.sh
```

## Option 2: Manual Commands

If the script doesn't work, run these commands one by one:

```bash
# 1. Stop server
pkill -f "node server.js"
sleep 2

# 2. Start server
nohup node server.js > server.log 2>&1 &
sleep 3

# 3. Check health
curl -s http://localhost:5000/

# 4. Check database
mysql -u inventory_user -pStrongPass@123 inventory_db -e "SELECT COUNT(*) FROM users;"

# 5. Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"admin123"}'

# 6. Check server logs
tail -20 server.log
```

## Expected Results:

1. **Server should start successfully**
2. **Health check should return JSON status**
3. **Database should show user count**
4. **Login should return a JWT token or error message**
5. **Server logs should show any errors**

This will give us a complete picture of what's working and what needs to be fixed!