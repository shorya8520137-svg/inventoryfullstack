# Simple Project Backup Script
param(
    [string]$BackupLocation = "C:\InventoryBackups"
)

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupRoot = "$BackupLocation\Backup_$timestamp"

Write-Host "🚀 CREATING PROJECT BACKUP" -ForegroundColor Green
Write-Host "Backup Location: $BackupRoot"

# Create directories
New-Item -ItemType Directory -Path "$BackupRoot\1_Local_Project" -Force | Out-Null
New-Item -ItemType Directory -Path "$BackupRoot\2_Server_Project" -Force | Out-Null
New-Item -ItemType Directory -Path "$BackupRoot\3_Database" -Force | Out-Null

Write-Host "✅ Directories created"

# Backup local project (exclude large folders)
Write-Host "📂 Backing up local project..."
$CurrentDir = Get-Location
$ExcludeDirs = @("node_modules", ".next", ".git", "uploads", "temp_messages")

robocopy $CurrentDir "$BackupRoot\1_Local_Project" /E /XD $ExcludeDirs /NFL /NDL /NJH /NJS

Write-Host "✅ Local project backed up"

# Create simple instructions
$Instructions = "# Backup Instructions`n`n## Local Project`n1. Go to 1_Local_Project`n2. Run: npm install`n3. Configure .env file`n4. Import database from 3_Database`n`n## Server Project`n1. Extract files from 2_Server_Project`n2. Follow server setup`n`n## Database`n1. Import SQL file from 3_Database`n`nCreated: $timestamp"
$Instructions | Out-File "$BackupRoot\README.txt"

Write-Host "✅ Instructions created"

# Backup from server
Write-Host "🌐 Backing up from server..."
try {
    # Create server archive
    ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "cd /home/ubuntu && tar -czf /tmp/server_backup_$timestamp.tar.gz --exclude='node_modules' --exclude='.git' inventoryfullstack"
    
    # Download server backup
    scp -i "C:\Users\Admin\awsconection.pem" "ubuntu@13.51.56.188:/tmp/server_backup_$timestamp.tar.gz" "$BackupRoot\2_Server_Project\"
    
    # Clean up server
    ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "rm -f /tmp/server_backup_$timestamp.tar.gz"
    
    Write-Host "✅ Server project backed up"
} catch {
    Write-Host "⚠️ Server backup failed: $_" -ForegroundColor Yellow
}

# Backup database
Write-Host "🗄️ Backing up database..."
try {
    # Create database dump
    ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "mysqldump -u inventory_user -p'Inventory@2024!' inventory_db > /tmp/db_backup_$timestamp.sql"
    
    # Download database backup
    scp -i "C:\Users\Admin\awsconection.pem" "ubuntu@13.51.56.188:/tmp/db_backup_$timestamp.sql" "$BackupRoot\3_Database\"
    
    # Clean up server
    ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "rm -f /tmp/db_backup_$timestamp.sql"
    
    Write-Host "✅ Database backed up"
} catch {
    Write-Host "⚠️ Database backup failed: $_" -ForegroundColor Yellow
}

Write-Host "`n🎉 BACKUP COMPLETED!" -ForegroundColor Green
Write-Host "📁 Location: $BackupRoot" -ForegroundColor Yellow
Write-Host "📖 Check README.txt for instructions" -ForegroundColor Cyan