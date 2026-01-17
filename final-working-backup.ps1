# Complete Project Backup - WORKING VERSION
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupRoot = "C:\InventoryBackups\Complete_Backup_$timestamp"

Write-Host "COMPLETE INVENTORY PROJECT BACKUP" -ForegroundColor Green
Write-Host "Backup Location: $BackupRoot" -ForegroundColor Yellow

# Create directories
New-Item -ItemType Directory -Path "$BackupRoot\1_Local_Project" -Force | Out-Null
New-Item -ItemType Directory -Path "$BackupRoot\2_Server_Project" -Force | Out-Null
New-Item -ItemType Directory -Path "$BackupRoot\3_Database" -Force | Out-Null
Write-Host "Directories created"

# Backup local project
Write-Host "Backing up local project..."
$CurrentDir = Get-Location
robocopy $CurrentDir "$BackupRoot\1_Local_Project" /E /XD node_modules .next .git uploads temp_messages .vercel /NFL /NDL /NJH /NJS
Write-Host "Local project backed up"

# Backup server project
Write-Host "Backing up server project..."
$serverArchive = "server_backup_$timestamp.tar.gz"
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "cd /home/ubuntu && tar -czf /tmp/$serverArchive --exclude='node_modules' --exclude='.git' inventoryfullstack"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Server archive created"
    scp -i "C:\Users\Admin\awsconection.pem" "ubuntu@13.51.56.188:/tmp/$serverArchive" "$BackupRoot\2_Server_Project\$serverArchive"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Server project downloaded"
        ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "rm -f /tmp/$serverArchive"
    }
}

# Backup database with correct credentials and options
Write-Host "Backing up database..."
$dbBackup = "inventory_db_$timestamp.sql"
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "mysqldump -u inventory_user -p'StrongPass@123' --single-transaction --routines --triggers inventory_db > /tmp/$dbBackup 2>/dev/null"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database dump created"
    scp -i "C:\Users\Admin\awsconection.pem" "ubuntu@13.51.56.188:/tmp/$dbBackup" "$BackupRoot\3_Database\$dbBackup"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database backup downloaded"
        ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "rm -f /tmp/$dbBackup"
    }
}

# Create instructions file
"Complete Inventory System Backup" | Out-File "$BackupRoot\README.txt"
"Created: $timestamp" | Add-Content "$BackupRoot\README.txt"
"" | Add-Content "$BackupRoot\README.txt"
"Contents:" | Add-Content "$BackupRoot\README.txt"
"1. Local Project - Development version" | Add-Content "$BackupRoot\README.txt"
"2. Server Project - Production files (extract .tar.gz)" | Add-Content "$BackupRoot\README.txt"
"3. Database - Complete MySQL dump with all data" | Add-Content "$BackupRoot\README.txt"
"" | Add-Content "$BackupRoot\README.txt"
"Database Info:" | Add-Content "$BackupRoot\README.txt"
"- Database: inventory_db" | Add-Content "$BackupRoot\README.txt"
"- User: inventory_user" | Add-Content "$BackupRoot\README.txt"
"- Password: StrongPass@123" | Add-Content "$BackupRoot\README.txt"
"" | Add-Content "$BackupRoot\README.txt"
"Admin Login:" | Add-Content "$BackupRoot\README.txt"
"- Email: admin@company.com" | Add-Content "$BackupRoot\README.txt"
"- Password: admin@123" | Add-Content "$BackupRoot\README.txt"
"" | Add-Content "$BackupRoot\README.txt"
"Server IP: 13.51.56.188" | Add-Content "$BackupRoot\README.txt"

Write-Host "BACKUP COMPLETED!" -ForegroundColor Green
Write-Host "Location: $BackupRoot" -ForegroundColor Yellow

# Check results
$localExists = Test-Path "$BackupRoot\1_Local_Project"
$serverExists = Test-Path "$BackupRoot\2_Server_Project\$serverArchive"
$dbExists = Test-Path "$BackupRoot\3_Database\$dbBackup"

Write-Host "Status:"
Write-Host "Local Project: $(if ($localExists) { 'YES' } else { 'NO' })"
Write-Host "Server Project: $(if ($serverExists) { 'YES' } else { 'NO' })"
Write-Host "Database: $(if ($dbExists) { 'YES' } else { 'NO' })"

# Show file sizes
if ($localExists) {
    $localSize = (Get-ChildItem "$BackupRoot\1_Local_Project" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "Local Project Size: $([math]::Round($localSize, 2)) MB"
}
if ($serverExists) {
    $serverSize = (Get-Item "$BackupRoot\2_Server_Project\$serverArchive").Length / 1MB
    Write-Host "Server Archive Size: $([math]::Round($serverSize, 2)) MB"
}
if ($dbExists) {
    $dbSize = (Get-Item "$BackupRoot\3_Database\$dbBackup").Length / 1MB
    Write-Host "Database Size: $([math]::Round($dbSize, 2)) MB"
}

# Open folder
Start-Process explorer.exe -ArgumentList $BackupRoot

Write-Host "Done! Check the backup folder." -ForegroundColor Green