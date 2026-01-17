# PowerShell script to run login test on AWS server
Write-Host "🚀 Running login test on AWS server..." -ForegroundColor Green

# SSH into server and run the test
$sshCommand = @"
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.161.150 "
cd inventoryfullstacknode && 
echo '🔐 Testing admin login...' && 
node test-login-direct.js
"
"@

Write-Host "Executing SSH command..." -ForegroundColor Yellow
Invoke-Expression $sshCommand