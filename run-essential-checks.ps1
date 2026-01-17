# Essential server checks without hanging
Write-Host "🔍 ESSENTIAL SERVER CHECKS" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

$keyPath = "C:\Users\Admin\awsconection.pem"
$serverUser = "ubuntu"
$serverIP = "16.171.161.150"

Write-Host "Server: $serverUser@$serverIP"
Write-Host ""

# Check 1: Server status
Write-Host "1️⃣ Server Status:" -ForegroundColor Yellow
& ssh -i $keyPath "$serverUser@$serverIP" "cd /home/ubuntu/inventoryfullstack && ps aux | grep node | grep -v grep"
Write-Host ""

# Check 2: Database users
Write-Host "2️⃣ Database Users:" -ForegroundColor Yellow
& ssh -i $keyPath "$serverUser@$serverIP" "mysql -u inventory_user -pStrongPass@123 inventory_db -e 'SELECT id, username, email, role FROM users LIMIT 3;' 2>/dev/null || echo 'Database query failed'"
Write-Host ""

# Check 3: Auth controller
Write-Host "3️⃣ Auth Controller:" -ForegroundColor Yellow
& ssh -i $keyPath "$serverUser@$serverIP" "cd /home/ubuntu/inventoryfullstack && head -15 controllers/authController.js"
Write-Host ""

# Check 4: Simple login test
Write-Host "4️⃣ Login Test:" -ForegroundColor Yellow
& ssh -i $keyPath "$serverUser@$serverIP" "cd /home/ubuntu/inventoryfullstack && echo 'Testing login...' && timeout 5 curl -X POST http://localhost:5000/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"test\",\"password\":\"test\"}' 2>/dev/null || echo 'Login test failed'"
Write-Host ""

Write-Host "✅ Essential checks completed!" -ForegroundColor Green