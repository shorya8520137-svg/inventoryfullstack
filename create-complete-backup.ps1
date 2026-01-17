# Complete Project Backup Script - PowerShell Version
param(
    [string]$BackupLocation = "C:\InventoryBackups"
)

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupRoot = "$BackupLocation\Complete_Backup_$timestamp"

Write-Host "🚀 COMPLETE INVENTORY PROJECT BACKUP" -ForegroundColor Green
Write-Host "====================================="
Write-Host "📁 Backup Location: $BackupRoot" -ForegroundColor Yellow

# Create directory structure
Write-Host "`n📁 Creating backup directories..." -ForegroundColor Cyan
New-Item -ItemType Directory -Path "$BackupRoot\1_Local_Project" -Force | Out-Null
New-Item -ItemType Directory -Path "$BackupRoot\2_Server_Project" -Force | Out-Null
New-Item -ItemType Directory -Path "$BackupRoot\3_Database" -Force | Out-Null
New-Item -ItemType Directory -Path "$BackupRoot\4_Documentation" -Force | Out-Null
Write-Host "✅ Directories created successfully"

# Backup local project
Write-Host "`n💾 STEP 1: Backing up LOCAL PROJECT..." -ForegroundColor Yellow
Write-Host "----------------------------------------"

$CurrentDir = Get-Location
$ExcludeDirs = @("node_modules", ".next", ".git", "uploads", "temp_messages", ".vercel")

Write-Host "📂 Copying files from: $CurrentDir"
Write-Host "📋 Excluding: $($ExcludeDirs -join ', ')"

try {
    robocopy $CurrentDir "$BackupRoot\1_Local_Project" /E /XD $ExcludeDirs /NFL /NDL /NJH /NJS
    Write-Host "✅ Local project backup completed" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Local backup had issues: $_" -ForegroundColor Yellow
}

# Backup server project
Write-Host "`n🌐 STEP 2: Backing up SERVER PROJECT..." -ForegroundColor Yellow
Write-Host "----------------------------------------"

try {
    Write-Host "📡 Creating server archive..."
    $serverArchive = "server_backup_$timestamp.tar.gz"
    
    ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "cd /home/ubuntu && tar -czf /tmp/$serverArchive --exclude='node_modules' --exclude='.git' --exclude='uploads' --exclude='*.log' inventoryfullstack"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Server archive created successfully"
        
        Write-Host "📥 Downloading server project..."
        scp -i "C:\Users\Admin\awsconection.pem" "ubuntu@13.51.56.188:/tmp/$serverArchive" "$BackupRoot\2_Server_Project\$serverArchive"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Server project downloaded successfully" -ForegroundColor Green
            
            # Cleanup server
            ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "rm -f /tmp/$serverArchive"
            Write-Host "✅ Server cleanup completed"
        } else {
            Write-Host "❌ Failed to download server project" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Failed to create server archive" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Server backup failed: $_" -ForegroundColor Red
}

# Backup database
Write-Host "`n🗄️ STEP 3: Backing up DATABASE..." -ForegroundColor Yellow
Write-Host "----------------------------------"

try {
    Write-Host "📊 Creating database dump..."
    $dbBackup = "inventory_db_$timestamp.sql"
    
    ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "mysqldump -u inventory_user -p'Inventory@2024!' inventory_db > /tmp/$dbBackup 2>/dev/null"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database dump created successfully"
        
        Write-Host "📥 Downloading database backup..."
        scp -i "C:\Users\Admin\awsconection.pem" "ubuntu@13.51.56.188:/tmp/$dbBackup" "$BackupRoot\3_Database\$dbBackup"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database backup downloaded successfully" -ForegroundColor Green
            
            # Cleanup server
            ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "rm -f /tmp/$dbBackup"
            Write-Host "✅ Database cleanup completed"
        } else {
            Write-Host "❌ Failed to download database backup" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️ Database dump failed - trying alternative method..." -ForegroundColor Yellow
        ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "sudo mysqldump -u root inventory_db > /tmp/$dbBackup 2>/dev/null"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database dump created with root user"
            scp -i "C:\Users\Admin\awsconection.pem" "ubuntu@13.51.56.188:/tmp/$dbBackup" "$BackupRoot\3_Database\$dbBackup"
            ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@13.51.56.188 "rm -f /tmp/$dbBackup"
        } else {
            Write-Host "❌ Database backup failed completely" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "❌ Database backup failed: $_" -ForegroundColor Red
}

# Create documentation
Write-Host "`n📚 STEP 4: Creating DOCUMENTATION..." -ForegroundColor Yellow
Write-Host "------------------------------------"

try {
    # Main README
    $readme = @"
# Complete Inventory Management System Backup

This backup contains the complete Inventory Management System including:
- Local development version
- Production server version  
- Complete database with all data
- Setup and deployment documentation

## 📁 Backup Contents

### 1. Local Project (1_Local_Project/)
- Complete source code (frontend + backend)
- Next.js frontend and Node.js backend
- All configuration files
- Development setup ready

### 2. Server Project (2_Server_Project/)
- Production server code archive
- Server configuration
- Extract .tar.gz file to use

### 3. Database (3_Database/)
- Complete MySQL database dump
- All tables, data, and relationships
- 125+ users, 11 roles, 91+ permissions
- Complete product catalog and audit logs

### 4. Documentation (4_Documentation/)
- Setup instructions
- Database restore guide
- System overview

## 🚀 Quick Start Guide

### For Local Development:
1. Go to 1_Local_Project/
2. Run: npm install
3. Configure .env file
4. Import database from 3_Database/
5. Run: npm run dev (frontend) or node server.js (backend)

### For Production Deployment:
1. Extract server archive from 2_Server_Project/
2. Import database from 3_Database/
3. Configure environment variables
4. Deploy to server

## 💾 System Information
- Frontend: Next.js 14 with React
- Backend: Node.js with Express
- Database: MySQL 8.0
- Authentication: JWT tokens
- Server: Ubuntu with Nginx
- Domain: https://13.51.56.188.nip.io

## Default Login
- Email: admin@company.com
- Password: admin@123

Backup created: $timestamp
"@
    
    $readme | Out-File -FilePath "$BackupRoot\README.md" -Encoding UTF8
    
    # Local setup instructions
    $localSetup = @"
# Local Development Setup

## Prerequisites
- Node.js v18 or higher
- MySQL 8.0 or higher
- Git (optional)

## Setup Steps
1. Open terminal in this directory
2. Run: npm install
3. Copy .env to .env.local and configure:
   - DATABASE_URL=mysql://inventory_user:Inventory@2024!@localhost:3306/inventory_db
   - JWT_SECRET=your-secret-key
   - NEXT_PUBLIC_API_BASE=http://localhost:5000
4. Import database from ../3_Database/
5. Start backend: node server.js
6. Start frontend: npm run dev
7. Access: http://localhost:3000

## Default Login
- Email: admin@company.com
- Password: admin@123

Setup created: $timestamp
"@
    
    $localSetup | Out-File -FilePath "$BackupRoot\1_Local_Project\SETUP_INSTRUCTIONS.md" -Encoding UTF8
    
    # Database restore instructions
    $dbRestore = @"
# Database Restore Instructions

## MySQL Setup
1. Install MySQL 8.0+
2. Start MySQL service
3. Login as root: mysql -u root -p

## Database Creation
```sql
CREATE DATABASE inventory_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'inventory_user'@'localhost' IDENTIFIED BY 'Inventory@2024!';
GRANT ALL PRIVILEGES ON inventory_db.* TO 'inventory_user'@'localhost';
FLUSH PRIVILEGES;
```

## Import Database
```bash
mysql -u inventory_user -p inventory_db < inventory_db_$timestamp.sql
```

## Verify Import
```sql
USE inventory_db;
SHOW TABLES;
SELECT COUNT(*) FROM users;
```

Restore guide created: $timestamp
"@
    
    $dbRestore | Out-File -FilePath "$BackupRoot\3_Database\RESTORE_INSTRUCTIONS.md" -Encoding UTF8
    
    Write-Host "✅ Documentation created successfully" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Documentation creation failed: $_" -ForegroundColor Red
}

# Final summary
Write-Host "`n🎉 BACKUP COMPLETED!" -ForegroundColor Green
Write-Host "===================="

$backupSize = 0
if (Test-Path $BackupRoot) {
    $backupSize = [math]::Round((Get-ChildItem $BackupRoot -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB, 2)
}

Write-Host "📊 BACKUP SUMMARY:" -ForegroundColor Cyan
Write-Host "📁 Location: $BackupRoot" -ForegroundColor Yellow
Write-Host "📏 Size: $backupSize MB"
Write-Host "🕒 Created: $timestamp"
Write-Host ""

# Check what was created
$localExists = Test-Path "$BackupRoot\1_Local_Project"
$serverExists = Test-Path "$BackupRoot\2_Server_Project\server_backup_$timestamp.tar.gz"
$dbExists = Test-Path "$BackupRoot\3_Database\inventory_db_$timestamp.sql"
$docsExists = Test-Path "$BackupRoot\README.md"

Write-Host "📋 COMPONENT STATUS:" -ForegroundColor Cyan
Write-Host "   1. Local Project:    $(if ($localExists) { '✅ SUCCESS' } else { '❌ FAILED' })"
Write-Host "   2. Server Project:   $(if ($serverExists) { '✅ SUCCESS' } else { '❌ FAILED' })"
Write-Host "   3. Database:         $(if ($dbExists) { '✅ SUCCESS' } else { '❌ FAILED' })"
Write-Host "   4. Documentation:    $(if ($docsExists) { '✅ SUCCESS' } else { '❌ FAILED' })"
Write-Host ""

if ($localExists -and $serverExists -and $dbExists) {
    Write-Host "🎉 COMPLETE BACKUP SUCCESSFUL!" -ForegroundColor Green
    Write-Host "📁 Your complete inventory system backup is ready!" -ForegroundColor Green
} else {
    Write-Host "⚠️ BACKUP COMPLETED WITH SOME ISSUES" -ForegroundColor Yellow
    Write-Host "Some components may have failed - check the status above." -ForegroundColor Yellow
}

Write-Host "`n📖 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Check README.md in the backup folder"
Write-Host "   2. Follow setup instructions in each folder"
Write-Host "   3. Keep this backup safe!"
Write-Host ""
Write-Host "💡 Tip: You now have a complete working copy of your inventory system!" -ForegroundColor Yellow

# Open backup folder
Write-Host "`n🔍 Opening backup folder..." -ForegroundColor Cyan
Start-Process explorer.exe -ArgumentList $BackupRoot

Write-Host "`n✅ BACKUP SCRIPT COMPLETED" -ForegroundColor Green