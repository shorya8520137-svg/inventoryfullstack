# PowerShell script to rollback server from GitHub
Write-Host "🔄 ROLLING BACK SERVER FROM GITHUB..." -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

# SSH connection details (update these with your server details)
$serverUser = "root"  # or your server username
$serverIP = "your-server-ip"  # replace with actual server IP
$projectPath = "/var/www/stockiqfullstacktest"

Write-Host "🔗 Connecting to server: $serverUser@$serverIP" -ForegroundColor Yellow

# Create the rollback commands
$rollbackCommands = @"
cd $projectPath &&
echo '📍 Current directory:' && pwd &&
echo '🛑 Stopping backend service...' &&
sudo systemctl stop stockiq-backend &&
echo '📊 Checking git status...' &&
git status &&
echo '🗑️ Discarding all local changes...' &&
git restore . &&
echo '🧹 Cleaning untracked files...' &&
git clean -fd &&
echo '⬇️ Pulling latest from GitHub...' &&
git pull origin main &&
echo '📦 Installing dependencies...' &&
npm install &&
echo '🚀 Starting backend service...' &&
sudo systemctl start stockiq-backend &&
sleep 3 &&
echo '✅ SERVER ROLLBACK COMPLETE!' &&
echo '🔍 Testing server...' &&
curl -s http://localhost:5000/ | head -5
"@

# Execute via SSH
try {
    Write-Host "🚀 Executing rollback on server..." -ForegroundColor Green
    
    # Option 1: Using ssh command (if available)
    ssh "$serverUser@$serverIP" $rollbackCommands
    
    Write-Host "✅ Rollback completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Yellow
    Write-Host "1. Check server logs: ssh $serverUser@$serverIP 'sudo journalctl -u stockiq-backend -f'"
    Write-Host "2. Test API: curl http://$serverIP:5000/"
}
catch {
    Write-Host "❌ Error executing rollback: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Manual steps to run on server:" -ForegroundColor Yellow
    Write-Host "1. SSH to server: ssh $serverUser@$serverIP"
    Write-Host "2. Run the bash script: bash rollback-server-from-github.sh"
}

Write-Host ""
Write-Host "📝 Alternative: Copy rollback-server-from-github.sh to server and run it manually" -ForegroundColor Cyan