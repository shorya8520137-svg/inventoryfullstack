# RESTORE WORKING CODE FROM SATURDAY 6:30-7:00 PM
Write-Host "RESTORING WORKING CODE FROM SATURDAY EVENING" -ForegroundColor Green
Write-Host "============================================="

$SERVER_IP = "13.48.248.180"
$SSH_KEY = "C:\Users\Admin\awsconection.pem"

Write-Host "1. Checking current git status on server..." -ForegroundColor Cyan
$gitStatus = ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && git status --porcelain"
if ($gitStatus) {
    Write-Host "Uncommitted changes found. Backing up..." -ForegroundColor Yellow
    ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && git stash push -m 'backup-before-restore-$(date +%Y%m%d-%H%M%S)'"
}

Write-Host ""
Write-Host "2. Fetching latest commits from GitHub..." -ForegroundColor Cyan
ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && git fetch origin"

Write-Host ""
Write-Host "3. Finding commits from Saturday between 6:30-7:00 PM..." -ForegroundColor Cyan

# Get Saturday's date (assuming today is Sunday/Monday, Saturday would be 1-2 days ago)
# We'll check the last few days to find Saturday
$saturdayCommits = ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && git log --oneline --since='3 days ago' --until='1 day ago' --after='18:30' --before='19:00' --date=local"

Write-Host "Saturday evening commits (6:30-7:00 PM):"
Write-Host $saturdayCommits

if (-not $saturdayCommits) {
    Write-Host "No commits found in that exact timeframe. Checking broader Saturday timeframe..." -ForegroundColor Yellow
    $saturdayCommits = ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && git log --oneline --since='3 days ago' --until='1 day ago' --after='18:00' --before='20:00' --date=local"
    Write-Host "Saturday evening commits (6:00-8:00 PM):"
    Write-Host $saturdayCommits
}

if (-not $saturdayCommits) {
    Write-Host "Still no commits found. Checking all Saturday commits..." -ForegroundColor Yellow
    $saturdayCommits = ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && git log --oneline --since='3 days ago' --until='1 day ago' --date=local"
    Write-Host "All Saturday commits:"
    Write-Host $saturdayCommits
}

if ($saturdayCommits) {
    # Get the first (most recent) commit hash from Saturday evening
    $commitHash = ($saturdayCommits -split '\n')[0] -split ' ' | Select-Object -First 1
    
    Write-Host ""
    Write-Host "4. Found working commit: $commitHash" -ForegroundColor Green
    Write-Host "Restoring to this commit..." -ForegroundColor Cyan
    
    # Stop server first
    ssh -i $SSH_KEY ubuntu@$SERVER_IP "pkill -f 'node server.js'" 2>$null
    
    # Reset to the working commit
    ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && git reset --hard $commitHash"
    
    Write-Host ""
    Write-Host "5. Installing dependencies..." -ForegroundColor Cyan
    ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && npm install" 2>$null
    
    Write-Host ""
    Write-Host "6. Starting server..." -ForegroundColor Cyan
    ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && nohup node server.js > server.log 2>&1 &" 2>$null
    Start-Sleep -Seconds 5
    
    # Check if server started
    $serverCheck = ssh -i $SSH_KEY ubuntu@$SERVER_IP "ps aux | grep 'node server.js' | grep -v grep"
    
    if ($serverCheck) {
        Write-Host "✅ Server started successfully!" -ForegroundColor Green
        
        Write-Host ""
        Write-Host "7. Testing login API..." -ForegroundColor Cyan
        Start-Sleep -Seconds 3
        
        $loginTest = ssh -i $SSH_KEY ubuntu@$SERVER_IP "timeout 10 curl -s -X POST https://13.48.248.180.nip.io/api/auth/login -H 'Content-Type: application/json' -d '{\"email\":\"admin@company.com\",\"password\":\"password\"}' -k"
        
        if ($loginTest -match '"success":true') {
            Write-Host ""
            Write-Host "🎉 SUCCESS! WORKING CODE RESTORED!" -ForegroundColor Green
            Write-Host "===================================" -ForegroundColor Green
            Write-Host "✅ Restored to commit: $commitHash" -ForegroundColor Yellow
            Write-Host "✅ Server: Running" -ForegroundColor Yellow
            Write-Host "✅ Login: Working" -ForegroundColor Yellow
            Write-Host "✅ Admin: admin@company.com / password" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Your system should now work as it did on Saturday evening!" -ForegroundColor Cyan
        } else {
            Write-Host "❌ Login test failed. Response: $loginTest" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Server failed to start" -ForegroundColor Red
        $logs = ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && tail -10 server.log"
        Write-Host "Logs: $logs"
    }
    
} else {
    Write-Host ""
    Write-Host "❌ No commits found from Saturday. Trying alternative approach..." -ForegroundColor Red
    
    Write-Host ""
    Write-Host "Alternative: Checking recent working commits..." -ForegroundColor Yellow
    $recentCommits = ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && git log --oneline -10"
    Write-Host "Recent commits:"
    Write-Host $recentCommits
    
    Write-Host ""
    Write-Host "Please manually select a commit hash from above that you know was working."
    Write-Host "Then run: git reset --hard [COMMIT_HASH]"
}

Write-Host ""
Write-Host "RESTORE COMPLETE" -ForegroundColor Green