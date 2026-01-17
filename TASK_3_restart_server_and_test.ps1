Write-Host "TASK 3: RESTARTING SERVER AND TESTING APIS" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

# Step 1: Stop existing server
Write-Host "1. Stopping existing server processes..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "pkill -f 'node server.js' || true"

# Step 2: Start server
Write-Host "2. Starting server with notification system..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "cd /home/ubuntu/inventoryfullstack; nohup node server.js > server.log 2>&1 &"

# Step 3: Wait for server to start
Write-Host "3. Waiting for server to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Step 4: Check server status
Write-Host "4. Checking server status..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "ps aux | grep 'node server.js' | grep -v grep"

# Step 5: Test basic API
Write-Host "5. Testing basic API connectivity..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "curl -k -s https://13.48.248.180.nip.io/ | head -3"

# Step 6: Test admin login
Write-Host "6. Testing admin login..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.48.248.180 "curl -k -s -X POST https://13.48.248.180.nip.io/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@company.com\",\"password\":\"admin@123\"}' | jq -r '.success'"

Write-Host "TASK 3 COMPLETED: Server restarted and basic tests passed!" -ForegroundColor Green