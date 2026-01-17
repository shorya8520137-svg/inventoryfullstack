# PowerShell script to SSH to server, pull changes, and test API

Write-Host "🚀 DEPLOYING TO SERVER AND TESTING USER CRUD" -ForegroundColor Blue
Write-Host "=" * 50 -ForegroundColor Blue

# Define the SSH command
$sshKey = "C:\Users\Admin\awsconection.pem"
$serverUser = "ubuntu"
$serverIP = "13.51.56.188"

Write-Host "`n📡 Connecting to server: $serverUser@$serverIP" -ForegroundColor Cyan

# Create the remote commands to execute
$remoteCommands = @"
echo '🔄 Navigating to project directory...'
cd inventoryfullstack

echo '📥 Pulling latest changes from GitHub...'
git pull origin main

echo '🛑 Stopping old server process...'
pkill -f 'node server.js' || true
sleep 3

echo '🚀 Starting server with new code...'
nohup node server.js > server.log 2>&1 &
sleep 5

echo '✅ Checking if server is running...'
ps aux | grep 'node server.js' | grep -v grep

echo '🏥 Testing server health...'
curl -s https://13.51.56.188.nip.io/api/health

echo '🧪 Running CRUD test...'
node test-table-structure.js

echo '📋 Showing recent server logs...'
tail -20 server.log

echo '✅ Deployment and testing completed!'
"@

try {
    Write-Host "📤 Executing remote commands..." -ForegroundColor Yellow
    
    # Execute SSH command with remote commands
    $sshCommand = "ssh -i `"$sshKey`" -o StrictHostKeyChecking=no $serverUser@$serverIP `"$remoteCommands`""
    
    Write-Host "🔧 SSH Command: $sshCommand" -ForegroundColor Gray
    
    # Execute the command
    Invoke-Expression $sshCommand
    
    Write-Host "`n🎉 Server deployment and testing completed!" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ Error during deployment: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
Write-Host "1. Check the test output above for CRUD results" -ForegroundColor White
Write-Host "2. If update still fails, check server logs for specific error" -ForegroundColor White
Write-Host "3. The status column issue should now be fixed" -ForegroundColor White