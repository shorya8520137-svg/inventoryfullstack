Write-Host "🔧 Quick Fix: Server.js and Permissions Test" -ForegroundColor Green

# Step 1: Fix the malformed line in server.js
Write-Host "📝 Step 1: Fixing server.js syntax error..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack && sed -i 's|app.use(\" /api, require(./routes/permissionsRoutes));|app.use(\"/api\", require(\"./routes/permissionsRoutes\"));|g' server.js"

# Step 2: Verify the fix
Write-Host "🔍 Step 2: Verifying server.js fix..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack && grep -n 'permissionsRoutes' server.js"

# Step 3: Restart server
Write-Host "🔄 Step 3: Restarting server..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack && pkill -9 node; sleep 2; nohup node server.js > server.log 2>&1 &"

# Step 4: Wait for server to start
Write-Host "⏳ Step 4: Waiting for server..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Step 5: Check server status
Write-Host "📊 Step 5: Checking server status..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack && ps aux | grep 'node server.js' | grep -v grep"

# Step 6: Test a simple API call
Write-Host "🧪 Step 6: Testing API..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack && curl -s http://localhost:5000/api/products | head -100"

Write-Host "✅ Quick fix completed!" -ForegroundColor Green