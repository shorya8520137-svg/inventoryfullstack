Write-Host "Quick Server Restart and Test..." -ForegroundColor Green

# Kill any existing node processes
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "pkill -9 node"

# Wait 2 seconds
Start-Sleep -Seconds 2

# Start server in background
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "cd inventoryfullstack && nohup node server.js > server.log 2>&1 &"

# Wait 5 seconds for server to start
Start-Sleep -Seconds 5

# Test health endpoint
Write-Host "Testing health endpoint..." -ForegroundColor Yellow
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "curl -s http://localhost:5000/ --max-time 5"

Write-Host "Server restarted. Check manually with test-login-api.js" -ForegroundColor Green