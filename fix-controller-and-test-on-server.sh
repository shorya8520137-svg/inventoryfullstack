#!/bin/bash

echo "🚀 FIXING CONTROLLER AND RUNNING TEST ON SERVER"
echo "================================================"

cd /home/ubuntu/inventoryfullstack

echo "🛑 Step 1: Stopping server..."
pkill -f "node server.js" || true
sleep 3

echo "📦 Step 2: Installing dependencies..."
npm install bcryptjs axios

echo "🔧 Step 3: Fixing permissions controller..."
# Backup original
cp controllers/permissionsController.js controllers/permissionsController.js.backup

# Apply the callback fixes to permissionsController.js
sed -i "s/PermissionsController.createAuditLog(user.id, 'LOGIN', 'USER', user.id, { ip: req.ip });/PermissionsController.createAuditLog(user.id, 'LOGIN', 'USER', user.id, { ip: req.ip }, () => {});/g" controllers/permissionsController.js

sed -i "s/PermissionsController.createAuditLog(req.user?.userId, 'LOGOUT', 'USER', req.user?.userId, { ip: req.ip });/PermissionsController.createAuditLog(req.user?.userId, 'LOGOUT', 'USER', req.user?.userId, { ip: req.ip }, () => {});/g" controllers/permissionsController.js

sed -i "s/PermissionsController.createAuditLog(req.user?.userId, 'CREATE', 'USER', result.insertId, {/PermissionsController.createAuditLog(req.user?.userId, 'CREATE', 'USER', result.insertId, {/g" controllers/permissionsController.js

sed -i "s/name, email, role_id, is_active/name, email, role_id, is_active/g" controllers/permissionsController.js
sed -i "s/});$/}, () => {});/g" controllers/permissionsController.js

echo "✅ Controller fixes applied"

echo "🔧 Step 4: Fixing test file..."
# Backup original test
cp comprehensive-nested-user-journey-test.js comprehensive-nested-user-journey-test.js.backup

# Fix return API calls in test file
sed -i 's/product_name: dispatchData.product_name,/product_type: dispatchData.product_name,\n            warehouse: dispatchData.warehouse,/g' comprehensive-nested-user-journey-test.js

sed -i 's/reason: '\''Customer return'\'',/return_reason: '\''Customer return'\'',/g' comprehensive-nested-user-journey-test.js
sed -i 's/return_type: '\''customer_return'\''/condition: '\''good'\''/g' comprehensive-nested-user-journey-test.js

sed -i 's/reason: '\''Quality issue'\'',/return_reason: '\''Quality issue'\'',/g' comprehensive-nested-user-journey-test.js
sed -i 's/return_type: '\''quality_issue'\''/condition: '\''good'\''/g' comprehensive-nested-user-journey-test.js

sed -i 's/reason: '\''Wrong item'\'',/return_reason: '\''Wrong item'\'',/g' comprehensive-nested-user-journey-test.js
sed -i 's/return_type: '\''wrong_item'\''/condition: '\''good'\''/g' comprehensive-nested-user-journey-test.js

echo "✅ Test file fixes applied"

echo "🚀 Step 5: Starting server..."
nohup node server.js > server.log 2>&1 &
sleep 5

echo "🔍 Step 6: Checking server status..."
if pgrep -f "node server.js" > /dev/null; then
    echo "✅ Server is running"
    ps aux | grep "node server.js" | grep -v grep
else
    echo "❌ Server failed to start"
    echo "📄 Server logs:"
    tail -20 server.log
    exit 1
fi

echo "🧪 Step 7: Running comprehensive test..."
node comprehensive-nested-user-journey-test.js

echo "📄 Step 8: Recent server logs:"
tail -10 server.log

echo "🎉 Fix and test completed!"