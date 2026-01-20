# QUICK TEST - CURRENT STATUS
Write-Host "QUICK STATUS CHECK" -ForegroundColor Green
Write-Host "=================="

$SERVER_IP = "13.48.248.180"
$SSH_KEY = "C:\Users\Admin\awsconection.pem"

Write-Host "1. Server status..." -ForegroundColor Cyan
$server = ssh -i $SSH_KEY ubuntu@$SERVER_IP "ps aux | grep 'node server.js' | grep -v grep | wc -l"
Write-Host "Server processes: $server"

Write-Host ""
Write-Host "2. Quick login test..." -ForegroundColor Cyan
$login = ssh -i $SSH_KEY ubuntu@$SERVER_IP "timeout 10 curl -s -X POST https://13.48.248.180.nip.io/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@company.com\",\"password\":\"password\"}' -k"
Write-Host "Response: $login"

Write-Host ""
Write-Host "3. Database check..." -ForegroundColor Cyan
$dbCheck = ssh -i $SSH_KEY ubuntu@$SERVER_IP "mysql -u inventory_user -pStrongPass@123 inventory_db -e 'SELECT COUNT(*) FROM users WHERE email=\"admin@company.com\";' -s -N 2>/dev/null"
Write-Host "Admin user exists: $dbCheck"

Write-Host ""
Write-Host "SUMMARY:" -ForegroundColor Yellow
if ($server -gt 0) { Write-Host "✅ Server: Running" -ForegroundColor Green } else { Write-Host "❌ Server: Not running" -ForegroundColor Red }
if ($login -match "success") { Write-Host "✅ Login: Working" -ForegroundColor Green } else { Write-Host "❌ Login: Failed" -ForegroundColor Red }
if ($dbCheck -eq "1") { Write-Host "✅ Admin: Exists" -ForegroundColor Green } else { Write-Host "❌ Admin: Missing" -ForegroundColor Red }