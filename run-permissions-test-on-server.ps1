# Run comprehensive permissions test on AWS server
Write-Host "🔐 RUNNING PERMISSIONS API TEST ON AWS SERVER" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

$keyPath = "C:\Users\Admin\awsconection.pem"
$serverUser = "ubuntu"
$serverIP = "16.171.161.150"
$projectPath = "/home/ubuntu/inventoryfullstack"

Write-Host "Server: $serverUser@$serverIP"
Write-Host "Project: $projectPath"
Write-Host ""

# Read the test script content
$testScript = Get-Content "test-all-permissions-apis.js" -Raw

Write-Host "🚀 Uploading and running permissions test..." -ForegroundColor Yellow

# Commands to run on server
$serverCommands = @"
cd $projectPath
echo '📍 Current directory:' && pwd
echo ''
echo '🔍 Checking server status...'
ps aux | grep 'node.*server.js' | grep -v grep | head -1
echo ''
echo '📝 Creating permissions test script...'
cat > permissions-test.js << 'TESTEOF'
$testScript
TESTEOF
echo '✅ Test script uploaded'
echo ''
echo '🧪 Running comprehensive permissions test...'
node permissions-test.js
echo ''
echo '🧹 Cleaning up...'
rm permissions-test.js
echo '✅ Permissions test completed!'
"@

try {
    Write-Host "🔗 Connecting to AWS server..." -ForegroundColor Green
    Write-Host ""
    
    # Execute via SSH
    & ssh -i $keyPath "$serverUser@$serverIP" $serverCommands
    
    Write-Host ""
    Write-Host "✅ Permissions test execution completed!" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Manual steps:" -ForegroundColor Yellow
    Write-Host "1. SSH: ssh -i `"$keyPath`" $serverUser@$serverIP"
    Write-Host "2. Go to: cd $projectPath"
    Write-Host "3. Upload test file and run: node permissions-test.js"
}