# Simple PowerShell script to deploy to server

Write-Host "Deploying to server and testing API..." -ForegroundColor Green

$sshKey = "C:\Users\Admin\awsconection.pem"
$server = "ubuntu@13.51.56.188"

$commands = "cd inventoryfullstack && git pull origin main && pkill -f 'node server.js' || true && sleep 3 && nohup node server.js > server.log 2>&1 & && sleep 5 && ps aux | grep 'node server.js' | grep -v grep && curl -s https://13.51.56.188.nip.io/api/health && node test-table-structure.js && tail -10 server.log"

Write-Host "Executing SSH command..." -ForegroundColor Yellow

ssh -i $sshKey -o StrictHostKeyChecking=no $server $commands

Write-Host "Deployment completed!" -ForegroundColor Green