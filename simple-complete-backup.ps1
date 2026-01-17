# Simple Complete Project Backup
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupRoot = "C:\InventoryBackups\Complete_Backup_$timestamp"

Write-Host "🚀 COMPLETE INVENTORY PROJECT BACKUP" -ForegroundColor Green
Write-Host "Backup Location: $BackupRoot" -ForegroundColor Yellow

# Create directories
New-Item -ItemType Directory -Path "$BackupRoot\1_Local_Project" -Force | Out-Null
New-Item -ItemType Directory -Path "$BackupRoot\2_Server_Project" -Force | Out-Null
New-Item -ItemType Directory -Path "$BackupRoot\3_Database" -Force | Out-Null
Write-Host "✅ Directories created"

# Backup local project
Write-Host "`n💾 Backing up local project..."
$CurrentDir = Get-Location
robocopy $CurrentDir "$BackupRoot\1_Local_Project" /E /XD node_modules .next .git uploads temp_messages .vercel /NFL /NDL /NJH /NJS
Write-Host "✅ Local project backed up"

# Backup server project
Write-Host "`n🌐 Backing up server project..."
$serverArchive = "server_backup_$timestamp.tar.gz"
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "cd /home/ubuntu && tar -czf /tmp/$serverArchive --exclude='node_modules' --exclude='.git' inventoryfullstack"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Server archive created"
    scp -i "C:\Users\Admin\awsconection.pem" "ubuntu@13.51.56.188:/tmp/$serverArchive" "$BackupRoot\2_Server_Project\$serverArchive"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Server project downloaded"
        ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "rm -f /tmp/$serverArchive"
    }
}

# Backup database
Write-Host "`n🗄️ Backing up database..."
$dbBackup = "inventory_db_$timestamp.sql"
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "mysqldump -u inventory_user -p'Inventory@2024!' inventory_db > /tmp/$dbBackup 2>/dev/null"

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database dump created"
    scp -i "C:\Users\Admin\awsconection.pem" "ubuntu@13.51.56.188:/tmp/$dbBackup" "$BackupRoot\3_Database\$dbBackup"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database backup downloaded"
        ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "rm -f /tmp/$dbBackup"
    }
}

# Create simple instructions
$instructions = @"
# Complete Inventory System Backup

Created: $timestamp

## Contents:
1. Local Project - Ready for development
2. Server Project - Production files (extract .tar.gz)
3. Database - MySQL dump (import with mysql)

## Quick Start:
1. Extract server files
2. Import database
3. Configure .env
4. Run: npm install then npm start

## Login:
Email: admin@company.com
Password: admin@123
"@
$instructions | Out-File "$BackupRoot\README.txt"

Write-Host "`n🎉 BACKUP COMPLETED!" -ForegroundColor Green
Write-Host "📁 Location: $BackupRoot" -ForegroundColor Yellow

# Check results
$localExists = Test-Path "$BackupRoot\1_Local_Project"
$serverExists = Test-Path "$BackupRoot\2_Server_Project\$serverArchive"
$dbExists = Test-Path "$BackupRoot\3_Database\$dbBackup"

Write-Host "`n📊 Status:"
Write-Host "Local Project: $(if ($localExists) { 'YES' } else { 'NO' })"
Write-Host "Server Project: $(if ($serverExists) { 'YES' } else { 'NO' })"
Write-Host "Database: $(if ($dbExists) { 'YES' } else { 'NO' })"

# Open folder
Start-Process explorer.exe -ArgumentList $BackupRoot

Write-Host "`nDone! Check the backup folder." -ForegroundColor Green