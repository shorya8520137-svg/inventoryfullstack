# Restart server and run comprehensive test
Write-Host "🔄 RESTARTING SERVER AND RUNNING TESTS" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

$keyPath = "C:\Users\Admin\awsconection.pem"
$serverUser = "ubuntu"
$serverIP = "16.171.161.150"

Write-Host "Server: $serverUser@$serverIP"
Write-Host ""

# Upload and run the restart script
Write-Host "🚀 Uploading restart script and executing..." -ForegroundColor Yellow

$scriptContent = Get-Content "restart-and-test-server.sh" -Raw

& ssh -i $keyPath "$serverUser@$serverIP" @"
cd /home/ubuntu/inventoryfullstack
echo 'Creating restart script...'
cat > restart-test.sh << 'SCRIPTEOF'
$scriptContent
SCRIPTEOF
chmod +x restart-test.sh
echo 'Running restart and test...'
./restart-test.sh
echo 'Cleaning up script...'
rm restart-test.sh
"@

Write-Host ""
Write-Host "✅ Restart and test completed!" -ForegroundColor Green