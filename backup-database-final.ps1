# INVENTORY DASHBOARD - FINAL DELIVERY DATABASE BACKUP
# Date: 29th January 2026

Write-Host "===============================================" -ForegroundColor Green
Write-Host "INVENTORY DASHBOARD DATABASE BACKUP" -ForegroundColor Green
Write-Host "Final Delivery - 29th January 2026" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

$DesktopFolder = "C:\Users\Admin\Desktop\inventory dashbord final devlivery at 29th jan"
$SSHKey = "C:\Users\Admin\e2c.pem"
$ServerIP = "54.169.107.64"
$ServerUser = "ubuntu"

# Create subdirectories
Write-Host "`nCreating directory structure..." -ForegroundColor Yellow
New-Item -Path "$DesktopFolder\database" -ItemType Directory -Force | Out-Null
New-Item -Path "$DesktopFolder\logs" -ItemType Directory -Force | Out-Null
New-Item -Path "$DesktopFolder\documentation" -ItemType Directory -Force | Out-Null

# Step 1: Create database dump on server
Write-Host "`nStep 1: Creating MySQL database dump on server..." -ForegroundColor Yellow
$dumpCommand = "sudo mysqldump -u root -p'Admin@123' --single-transaction --routines --triggers inventory_management > /home/ubuntu/inventory_backup_29jan2026.sql"
ssh -i $SSHKey "$ServerUser@$ServerIP" $dumpCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database dump created successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to create database dump" -ForegroundColor Red
    exit 1
}

# Step 2: Download database backup
Write-Host "`nStep 2: Downloading database backup..." -ForegroundColor Yellow
scp -i $SSHKey "$ServerUser@${ServerIP}:/home/ubuntu/inventory_backup_29jan2026.sql" "$DesktopFolder\database\"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Database backup downloaded successfully" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to download database backup" -ForegroundColor Red
    exit 1
}

# Step 3: Get database size info
Write-Host "`nStep 3: Getting database information..." -ForegroundColor Yellow
$sizeCommand = 'sudo mysql -u root -p"Admin@123" -e "SELECT table_schema AS Database_Name, ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS Database_Size_MB FROM information_schema.tables WHERE table_schema = ''inventory_management'' GROUP BY table_schema;"'
ssh -i $SSHKey "$ServerUser@$ServerIP" $sizeCommand > "$DesktopFolder\logs\database_size_info.txt"

# Step 4: Check downloaded file
Write-Host "`nStep 4: Verifying downloaded file..." -ForegroundColor Yellow
$backupFile = "$DesktopFolder\database\inventory_backup_29jan2026.sql"
if (Test-Path $backupFile) {
    $fileSize = (Get-Item $backupFile).Length
    $fileSizeMB = [math]::Round($fileSize / 1MB, 2)
    Write-Host "✓ Backup file exists: $fileSizeMB MB" -ForegroundColor Green
    
    # Create documentation
    $docContent = @"
INVENTORY DASHBOARD - FINAL DELIVERY BACKUP
Date: $(Get-Date)

SERVER DETAILS:
IP Address: $ServerIP
Username: $ServerUser
Database: inventory_management

BACKUP FILES:
Database Dump: database\inventory_backup_29jan2026.sql ($fileSizeMB MB)
Size Info: logs\database_size_info.txt

BACKUP STATUS: COMPLETED SUCCESSFULLY
Expected Size Range: 79-89 MB
Actual Size: $fileSizeMB MB

NOTES:
This is the complete production database backup
Contains all tables, data, routines, and triggers
Ready for final delivery and deployment
"@
    
    $docContent | Out-File -FilePath "$DesktopFolder\documentation\BACKUP_SUMMARY.txt" -Encoding UTF8
    Write-Host "✓ Documentation created" -ForegroundColor Green
} else {
    Write-Host "✗ Backup file not found!" -ForegroundColor Red
    exit 1
}

# Step 5: Cleanup server
Write-Host "`nStep 5: Cleaning up server..." -ForegroundColor Yellow
ssh -i $SSHKey "$ServerUser@$ServerIP" "rm -f /home/ubuntu/inventory_backup_29jan2026.sql"
Write-Host "✓ Server cleanup completed" -ForegroundColor Green

# Final summary
Write-Host "`n===============================================" -ForegroundColor Green
Write-Host "BACKUP COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host "`nBackup Location: $DesktopFolder" -ForegroundColor Cyan
Write-Host "`nFiles Created:" -ForegroundColor Cyan
Write-Host "- database\inventory_backup_29jan2026.sql (MySQL dump)" -ForegroundColor White
Write-Host "- logs\database_size_info.txt (Database size information)" -ForegroundColor White
Write-Host "- documentation\BACKUP_SUMMARY.txt (Backup documentation)" -ForegroundColor White

Write-Host "`nThe database backup is ready for final delivery!" -ForegroundColor Green
Write-Host "`nPress any key to continue..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")