# TEST ADMIN LOGIN - FIXED JSON
Write-Host "TESTING ADMIN LOGIN - FIXED JSON FORMAT" -ForegroundColor Green
Write-Host "======================================="

$SERVER_IP = "13.48.248.180"
$SSH_KEY = "C:\Users\Admin\awsconection.pem"

Write-Host "1. Testing with proper JSON formatting..." -ForegroundColor Cyan

# Create a proper JSON file on server first
ssh -i $SSH_KEY ubuntu@$SERVER_IP "echo '{\"email\":\"admin@company.com\",\"password\":\"password\"}' > /tmp/login.json"

# Test login with file
$loginTest = ssh -i $SSH_KEY ubuntu@$SERVER_IP "curl -s -X POST https://13.48.248.180.nip.io/api/auth/login -H 'Content-Type: application/json' -d @/tmp/login.json -k"

Write-Host "API Response:"
Write-Host $loginTest

if ($loginTest -match '"success":true') {
    Write-Host ""
    Write-Host "✅ LOGIN SUCCESSFUL!" -ForegroundColor Green
    
    # Parse permissions
    if ($loginTest -match '"permissions":\[([^\]]*)\]') {
        $permsContent = $matches[1]
        if ($permsContent.Length -gt 10) {
            $permCount = ($permsContent -split '","').Count
            Write-Host "✅ Permissions count: $permCount" -ForegroundColor Green
        } else {
            Write-Host "❌ Empty permissions" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "🎉 SUCCESS! Your admin login is working!" -ForegroundColor Green
    Write-Host "Frontend should now show full dashboard with all permissions." -ForegroundColor Yellow
    
} else {
    Write-Host ""
    Write-Host "❌ Still failing. Let me try direct server test..." -ForegroundColor Red
    
    # Test server health
    Write-Host ""
    Write-Host "2. Testing server health endpoint..." -ForegroundColor Cyan
    $healthTest = ssh -i $SSH_KEY ubuntu@$SERVER_IP "curl -s https://13.48.248.180.nip.io/ -k"
    Write-Host "Health response: $healthTest"
    
    # Check server logs
    Write-Host ""
    Write-Host "3. Checking recent server logs..." -ForegroundColor Cyan
    $logs = ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && tail -10 server.log"
    Write-Host $logs
}

# Cleanup
ssh -i $SSH_KEY ubuntu@$SERVER_IP "rm -f /tmp/login.json" 2>/dev/null