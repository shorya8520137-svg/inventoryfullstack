# Deploy role_id fix to server and test
$SSH_KEY = "C:\Users\Admin\awsconection.pem"
$SERVER = "ubuntu@13.51.56.188"

Write-Host "🚀 DEPLOYING ROLE_ID FIX TO SERVER" -ForegroundColor Green
Write-Host "=" * 60

Write-Host "`n📥 STEP 1: PULLING CHANGES ON SERVER" -ForegroundColor Yellow
Write-Host "-" * 40

# Pull latest changes
ssh -i $SSH_KEY -o StrictHostKeyChecking=no $SERVER 'cd inventoryfullstack && git pull origin main'

Write-Host "`n🛑 STEP 2: RESTARTING SERVER" -ForegroundColor Yellow
Write-Host "-" * 40

# Stop old server
ssh -i $SSH_KEY -o StrictHostKeyChecking=no $SERVER 'pkill -f "node server.js" || true'
Start-Sleep -Seconds 3

# Start new server
ssh -i $SSH_KEY -o StrictHostKeyChecking=no $SERVER 'cd inventoryfullstack && nohup node server.js > server.log 2>&1 &'
Start-Sleep -Seconds 8

Write-Host "`n🧪 STEP 3: TESTING ROLE_ID FIX" -ForegroundColor Yellow
Write-Host "-" * 40

# Run the CRUD test
node test-crud-operations-now.js

Write-Host "`n✅ DEPLOYMENT AND TESTING COMPLETED!" -ForegroundColor Green