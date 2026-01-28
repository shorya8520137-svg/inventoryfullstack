# PowerShell script to fix notification database
Write-Host "========================================" -ForegroundColor Green
Write-Host "NOTIFICATION DATABASE FIX - POWERSHELL" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$keyPath = "C:\Users\Admin\e2c.pem"
$server = "ubuntu@54.169.107.64"

Write-Host "Step 1: Uploading SQL script..." -ForegroundColor Yellow
& scp -i $keyPath fix-notification-tables-safe.sql "$server`:~/"

Write-Host ""
Write-Host "Step 2: Executing database fix..." -ForegroundColor Yellow
& ssh -i $keyPath $server "sudo mysql inventory_db < fix-notification-tables-safe.sql"

Write-Host ""
Write-Host "Step 3: Checking notification tables..." -ForegroundColor Yellow
& ssh -i $keyPath $server "sudo mysql -e 'USE inventory_db; SHOW TABLES;' | grep notification"

Write-Host ""
Write-Host "Step 4: Describing notifications table..." -ForegroundColor Yellow
& ssh -i $keyPath $server "sudo mysql -e 'USE inventory_db; DESCRIBE notifications;'"

Write-Host ""
Write-Host "Step 5: Testing with sample notification..." -ForegroundColor Yellow
& ssh -i $keyPath $server "sudo mysql -e `"USE inventory_db; INSERT INTO notifications (title, message, type, user_id, priority) VALUES ('PowerShell Test', 'Database fixed via PowerShell!', 'SYSTEM', 1, 'low') ON DUPLICATE KEY UPDATE title=title;`""

Write-Host ""
Write-Host "Step 6: Showing recent notifications..." -ForegroundColor Yellow
& ssh -i $keyPath $server "sudo mysql -e 'USE inventory_db; SELECT id, title, message, type, created_at FROM notifications ORDER BY created_at DESC LIMIT 3;'"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "DATABASE FIX COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Read-Host "Press Enter to continue"