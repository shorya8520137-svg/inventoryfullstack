# Simple AWS server test
Write-Host "Testing AWS Server..." -ForegroundColor Cyan

$keyPath = "C:\Users\Admin\awsconection.pem"
$serverUser = "ubuntu"
$serverIP = "16.171.161.150"

Write-Host "Server: $serverUser@$serverIP"
Write-Host "Key: $keyPath"
Write-Host ""

# Simple commands to test the server
$commands = 'cd /var/www/stockiqfullstacktest; echo "Current dir:"; pwd; echo ""; echo "Server status:"; sudo systemctl status stockiq-backend --no-pager -l | head -5; echo ""; echo "Port check:"; sudo netstat -tlnp | grep :5000; echo ""; echo "Quick API test:"; curl -s http://localhost:5000/ | head -3'

Write-Host "Connecting to AWS server..."
Write-Host ""

try {
    & ssh -i $keyPath "$serverUser@$serverIP" $commands
    Write-Host ""
    Write-Host "Test completed!" -ForegroundColor Green
}
catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}