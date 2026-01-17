# Direct AWS server test
Write-Host "Testing AWS Server APIs..." -ForegroundColor Cyan

$keyPath = "C:\Users\Admin\awsconection.pem"
$serverUser = "ubuntu"
$serverIP = "16.171.161.150"

Write-Host "Server: $serverUser@$serverIP"
Write-Host ""

# Test 1: Basic connection and server status
Write-Host "1. Testing server connection..." -ForegroundColor Yellow
& ssh -i $keyPath "$serverUser@$serverIP" "cd /var/www/stockiqfullstacktest; pwd; sudo systemctl status stockiq-backend --no-pager | head -5"

Write-Host ""

# Test 2: Check if port is listening
Write-Host "2. Checking port 5000..." -ForegroundColor Yellow
& ssh -i $keyPath "$serverUser@$serverIP" "sudo netstat -tlnp | grep :5000"

Write-Host ""

# Test 3: Simple API test
Write-Host "3. Testing API endpoint..." -ForegroundColor Yellow
& ssh -i $keyPath "$serverUser@$serverIP" "curl -s http://localhost:5000/ | head -3"

Write-Host ""
Write-Host "Test completed!" -ForegroundColor Green