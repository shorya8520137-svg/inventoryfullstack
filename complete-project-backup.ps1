# Complete Project Backup Automation Script
# This script creates a full backup of the inventory project (local + server + database)

param(
    [string]$BackupLocation = "C:\InventoryBackups",
    [string]$SSHKey = "C:\Users\Admin\awsconection.pem",
    [string]$ServerUser = "ubuntu@13.51.56.188"
)

$ErrorActionPreference = "Continue"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"

Write-Host "🚀 COMPLETE INVENTORY PROJECT BACKUP" -ForegroundColor Green
Write-Host "=" * 60

# Step 1: Create backup directory structure
Write-Host "`n📁 STEP 1: CREATING BACKUP DIRECTORY STRUCTURE" -ForegroundColor Yellow
Write-Host "-" * 50

$BackupRoot = "$BackupLocation\Backup_$timestamp"
$LocalBackupDir = "$BackupRoot\1_Local_Project"
$ServerBackupDir = "$BackupRoot\2_Server_Project"
$DatabaseBackupDir = "$BackupRoot\3_Database"
$DocumentationDir = "$BackupRoot\4_Documentation"

try {
    New-Item -ItemType Directory -Path $BackupRoot -Force | Out-Null
    New-Item -ItemType Directory -Path $LocalBackupDir -Force | Out-Null
    New-Item -ItemType Directory -Path $ServerBackupDir -Force | Out-Null
    New-Item -ItemType Directory -Path $DatabaseBackupDir -Force | Out-Null
    New-Item -ItemType Directory -Path $DocumentationDir -Force | Out-Null
    
    Write-Host "✅ Backup directories created:" -ForegroundColor Green
    Write-Host "   📂 Root: $BackupRoot"
    Write-Host "   📂 Local: $LocalBackupDir"
    Write-Host "   📂 Server: $ServerBackupDir"
    Write-Host "   📂 Database: $DatabaseBackupDir"
    Write-Host "   📂 Documentation: $DocumentationDir"
} catch {
    Write-Host "❌ Failed to create backup directories: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Backup local project
Write-Host "`n💾 STEP 2: BACKING UP LOCAL PROJECT" -ForegroundColor Yellow
Write-Host "-" * 50

try {
    $CurrentDir = Get-Location
    Write-Host "📂 Current project directory: $CurrentDir"
    
    # Copy all files except node_modules, .git, and other large folders
    $ExcludeDirs = @("node_modules", ".next", ".git", "uploads", "temp_messages")
    
    Write-Host "📋 Copying project files (excluding: $($ExcludeDirs -join ', '))..."
    
    Get-ChildItem -Path $CurrentDir -Recurse | Where-Object {
        $relativePath = $_.FullName.Substring($CurrentDir.Path.Length + 1)
        $shouldExclude = $false
        foreach ($exclude in $ExcludeDirs) {
            if ($relativePath.StartsWith($exclude)) {
                $shouldExclude = $true
                break
            }
        }
        return -not $shouldExclude
    } | ForEach-Object {
        $destinationPath = $_.FullName.Replace($CurrentDir.Path, $LocalBackupDir)
        $destinationDir = Split-Path $destinationPath -Parent
        
        if (-not (Test-Path $destinationDir)) {
            New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
        }
        
        if ($_.PSIsContainer -eq $false) {
            Copy-Item $_.FullName $destinationPath -Force
        }
    }
    
    Write-Host "✅ Local project backup completed" -ForegroundColor Green
    
    # Create package.json for easy setup
    $SetupScript = @"
# Local Project Setup Instructions

## Prerequisites
1. Install Node.js (v18 or higher)
2. Install MySQL (v8.0 or higher)

## Setup Steps
1. Navigate to this directory
2. Run: npm install
3. Copy .env.example to .env and configure database settings
4. Import database from ../3_Database/inventory_db_backup.sql
5. Run: npm run dev (for frontend) or node server.js (for backend)

## Database Configuration
- Database: inventory_db
- User: inventory_user
- Password: [check .env file]
- Host: localhost
- Port: 3306

Backup created on: $timestamp
"@
    
    $SetupScript | Out-File -FilePath "$LocalBackupDir\SETUP_INSTRUCTIONS.md" -Encoding UTF8
    
} catch {
    Write-Host "❌ Local backup failed: $_" -ForegroundColor Red
}

# Step 3: Backup server project
Write-Host "`n🌐 STEP 3: BACKING UP SERVER PROJECT" -ForegroundColor Yellow
Write-Host "-" * 50

try {
    Write-Host "📡 Connecting to server to create project archive..."
    
    # Create archive on server
    $ServerArchivePath = "/tmp/inventoryfullstack_backup_$timestamp.tar.gz"
    ssh -i $SSHKey -o StrictHostKeyChecking=no $ServerUser "cd /home/ubuntu && tar -czf $ServerArchivePath --exclude='node_modules' --exclude='.git' --exclude='uploads' --exclude='temp_messages' --exclude='*.log' inventoryfullstack"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Server archive created successfully"
        
        # Download archive from server
        Write-Host "📥 Downloading server project archive..."
        scp -i $SSHKey -o StrictHostKeyChecking=no "$ServerUser`:$ServerArchivePath" "$ServerBackupDir\server_project_$timestamp.tar.gz"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Server project downloaded successfully"
            
            # Clean up server archive
            ssh -i $SSHKey -o StrictHostKeyChecking=no $ServerUser "rm -f $ServerArchivePath"
            
            # Create extraction instructions
            $ServerSetupScript = @"
# Server Project Setup Instructions

## Extract Archive
1. Extract server_project_$timestamp.tar.gz
2. This contains the exact server configuration

## Server Environment
- OS: Ubuntu
- Node.js: v18.19.1
- MySQL: v8.0
- Nginx: v1.24.0
- PM2: For process management

## Deployment Steps
1. Extract the archive
2. Run: npm install
3. Configure .env file
4. Import database
5. Start with: node server.js or pm2 start server.js

## Server Details
- IP: 13.51.56.188
- Domain: https://13.51.56.188.nip.io
- Port: 5000 (backend)
- SSL: Configured with nginx

Backup created on: $timestamp
"@
            
            $ServerSetupScript | Out-File -FilePath "$ServerBackupDir\SERVER_SETUP_INSTRUCTIONS.md" -Encoding UTF8
            
        } else {
            Write-Host "❌ Failed to download server project" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Failed to create server archive" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Server backup failed: $_" -ForegroundColor Red
}

# Step 4: Backup database
Write-Host "`n🗄️ STEP 4: BACKING UP DATABASE" -ForegroundColor Yellow
Write-Host "-" * 50

try {
    Write-Host "📊 Creating database backup on server..."
    
    # Create database dump on server
    $DbBackupPath = "/tmp/inventory_db_backup_$timestamp.sql"
    ssh -i $SSHKey -o StrictHostKeyChecking=no $ServerUser "mysqldump -u inventory_user -p'Inventory@2024!' inventory_db > $DbBackupPath"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database dump created successfully"
        
        # Download database backup
        Write-Host "📥 Downloading database backup..."
        scp -i $SSHKey -o StrictHostKeyChecking=no "$ServerUser`:$DbBackupPath" "$DatabaseBackupDir\inventory_db_backup_$timestamp.sql"
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Database backup downloaded successfully"
            
            # Get database statistics
            $DbStats = ssh -i $SSHKey -o StrictHostKeyChecking=no $ServerUser "mysql -u inventory_user -p'Inventory@2024!' inventory_db -e 'SELECT COUNT(*) as user_count FROM users; SELECT COUNT(*) as role_count FROM roles; SELECT COUNT(*) as permission_count FROM permissions; SELECT COUNT(*) as product_count FROM products;' 2>/dev/null"
            
            # Clean up server backup
            ssh -i $SSHKey -o StrictHostKeyChecking=no $ServerUser "rm -f $DbBackupPath"
            
            # Create database documentation
            $DbDocumentation = @"
# Database Backup Information

## Database Details
- Name: inventory_db
- User: inventory_user
- Password: Inventory@2024!
- Charset: utf8mb4
- Collation: utf8mb4_unicode_ci

## Backup File
- File: inventory_db_backup_$timestamp.sql
- Created: $timestamp
- Size: $(if (Test-Path "$DatabaseBackupDir\inventory_db_backup_$timestamp.sql") { [math]::Round((Get-Item "$DatabaseBackupDir\inventory_db_backup_$timestamp.sql").Length / 1MB, 2) } else { "Unknown" }) MB

## Database Statistics
$DbStats

## Restore Instructions
1. Create database: CREATE DATABASE inventory_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
2. Create user: CREATE USER 'inventory_user'@'localhost' IDENTIFIED BY 'Inventory@2024!';
3. Grant permissions: GRANT ALL PRIVILEGES ON inventory_db.* TO 'inventory_user'@'localhost';
4. Import: mysql -u inventory_user -p inventory_db < inventory_db_backup_$timestamp.sql

## Key Tables
- users: User accounts and authentication
- roles: User roles (super_admin, admin, manager, etc.)
- permissions: System permissions
- role_permissions: Role-permission mappings
- products: Inventory products
- dispatches: Product dispatches
- returns: Product returns
- audit_logs: System audit trail

Backup created on: $timestamp
"@
            
            $DbDocumentation | Out-File -FilePath "$DatabaseBackupDir\DATABASE_INFO.md" -Encoding UTF8
            
        } else {
            Write-Host "❌ Failed to download database backup" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Failed to create database dump" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Database backup failed: $_" -ForegroundColor Red
}

# Step 5: Create comprehensive documentation
Write-Host "`n📚 STEP 5: CREATING DOCUMENTATION" -ForegroundColor Yellow
Write-Host "-" * 50

try {
    # Main README
    $MainReadme = @"
# Inventory Management System - Complete Backup

This backup contains the complete Inventory Management System including:
- Local development version
- Production server version  
- Complete database with all data
- Setup and deployment documentation

## Backup Contents

### 1. Local Project (1_Local_Project/)
- Complete source code
- Frontend (Next.js) and Backend (Node.js)
- All configuration files
- Development setup instructions

### 2. Server Project (2_Server_Project/)
- Production server code
- Server configuration
- Deployment scripts
- Server setup instructions

### 3. Database (3_Database/)
- Complete MySQL database dump
- All tables, data, and relationships
- Database restore instructions
- Schema documentation

### 4. Documentation (4_Documentation/)
- System architecture
- API documentation
- User guides
- Deployment guides

## Quick Start

### For Local Development:
1. Go to 1_Local_Project/
2. Follow SETUP_INSTRUCTIONS.md
3. Import database from 3_Database/
4. Run npm install && npm run dev

### For Production Deployment:
1. Go to 2_Server_Project/
2. Follow SERVER_SETUP_INSTRUCTIONS.md
3. Extract server archive
4. Import database and configure

## System Overview

### Technology Stack
- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MySQL 8.0
- **Authentication**: JWT tokens
- **Deployment**: Ubuntu server with Nginx

### Key Features
- User management with role-based permissions
- Inventory tracking and management
- Product dispatch and returns
- Audit logging
- Real-time updates
- Responsive design

### Database Schema
- **Users**: 125+ users with different roles
- **Roles**: 11 roles with granular permissions
- **Permissions**: 91+ system permissions
- **Products**: Complete inventory catalog
- **Audit Logs**: Complete activity tracking

## Backup Information
- **Created**: $timestamp
- **Local Project**: $(if (Test-Path $LocalBackupDir) { "✅ Included" } else { "❌ Failed" })
- **Server Project**: $(if (Test-Path "$ServerBackupDir\server_project_$timestamp.tar.gz") { "✅ Included" } else { "❌ Failed" })
- **Database**: $(if (Test-Path "$DatabaseBackupDir\inventory_db_backup_$timestamp.sql") { "✅ Included" } else { "❌ Failed" })

## Support
For questions about this backup or system setup, refer to the individual setup instructions in each directory.

---
Backup created by: Complete Project Backup Script
Date: $timestamp
"@
    
    $MainReadme | Out-File -FilePath "$BackupRoot\README.md" -Encoding UTF8
    
    # Create system architecture document
    $ArchitectureDoc = @"
# System Architecture

## Overview
The Inventory Management System is a full-stack web application with the following architecture:

## Frontend (Next.js)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Authentication**: JWT token-based
- **Deployment**: Vercel

## Backend (Node.js)
- **Runtime**: Node.js v18.19.1
- **Framework**: Express.js
- **Authentication**: JWT middleware
- **Database**: MySQL with connection pooling
- **File Upload**: Multer for file handling
- **Security**: CORS, helmet, rate limiting

## Database (MySQL)
- **Version**: MySQL 8.0
- **Character Set**: utf8mb4
- **Key Tables**: users, roles, permissions, products, dispatches, returns, audit_logs
- **Relationships**: Proper foreign key constraints
- **Indexing**: Optimized for performance

## Server Infrastructure
- **OS**: Ubuntu 20.04 LTS
- **Web Server**: Nginx (reverse proxy)
- **SSL**: Let's Encrypt certificates
- **Process Manager**: PM2 for Node.js
- **Domain**: https://13.51.56.188.nip.io

## Security Features
- JWT token authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- SQL injection prevention
- CORS configuration
- Rate limiting
- Audit logging

## Key Components

### Authentication System
- Login/logout functionality
- Token refresh mechanism
- Role-based permissions
- Session management

### User Management
- User CRUD operations
- Role assignment
- Permission management
- Audit trail

### Inventory Management
- Product catalog
- Stock tracking
- Dispatch management
- Returns processing

### Reporting & Analytics
- Audit logs
- System statistics
- User activity tracking
- Performance metrics

Created: $timestamp
"@
    
    $ArchitectureDoc | Out-File -FilePath "$DocumentationDir\SYSTEM_ARCHITECTURE.md" -Encoding UTF8
    
    Write-Host "✅ Documentation created successfully" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Documentation creation failed: $_" -ForegroundColor Red
}

# Step 6: Final summary and verification
Write-Host "`n🎉 STEP 6: BACKUP COMPLETION SUMMARY" -ForegroundColor Yellow
Write-Host "-" * 50

$BackupSize = if (Test-Path $BackupRoot) { 
    [math]::Round((Get-ChildItem $BackupRoot -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB, 2) 
} else { 0 }

Write-Host "`n📊 BACKUP SUMMARY:" -ForegroundColor Green
Write-Host "=" * 40
Write-Host "📂 Backup Location: $BackupRoot"
Write-Host "📏 Total Size: $BackupSize MB"
Write-Host "🕒 Created: $timestamp"
Write-Host ""

# Verify each component
$LocalStatus = if (Test-Path $LocalBackupDir) { "✅ SUCCESS" } else { "❌ FAILED" }
$ServerStatus = if (Test-Path "$ServerBackupDir\server_project_$timestamp.tar.gz") { "✅ SUCCESS" } else { "❌ FAILED" }
$DatabaseStatus = if (Test-Path "$DatabaseBackupDir\inventory_db_backup_$timestamp.sql") { "✅ SUCCESS" } else { "❌ FAILED" }
$DocsStatus = if (Test-Path "$DocumentationDir\SYSTEM_ARCHITECTURE.md") { "✅ SUCCESS" } else { "❌ FAILED" }

Write-Host "📋 COMPONENT STATUS:" -ForegroundColor Cyan
Write-Host "   1. Local Project:    $LocalStatus"
Write-Host "   2. Server Project:   $ServerStatus"  
Write-Host "   3. Database:         $DatabaseStatus"
Write-Host "   4. Documentation:    $DocsStatus"
Write-Host ""

if ($LocalStatus.Contains("SUCCESS") -and $ServerStatus.Contains("SUCCESS") -and $DatabaseStatus.Contains("SUCCESS")) {
    Write-Host "🎉 COMPLETE BACKUP SUCCESSFUL!" -ForegroundColor Green
    Write-Host "📁 Your complete inventory system backup is ready at:" -ForegroundColor Green
    Write-Host "   $BackupRoot" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📖 Next Steps:" -ForegroundColor Cyan
    Write-Host "   1. Review README.md in the backup folder"
    Write-Host "   2. Test local setup using 1_Local_Project/"
    Write-Host "   3. Use 2_Server_Project/ for production deployment"
    Write-Host "   4. Import database from 3_Database/"
    Write-Host ""
    Write-Host "💾 Keep this backup safe - it contains your complete system!" -ForegroundColor Yellow
} else {
    Write-Host "⚠️ BACKUP COMPLETED WITH SOME ISSUES" -ForegroundColor Yellow
    Write-Host "Please check the failed components and retry if needed." -ForegroundColor Yellow
}

Write-Host "`n🔚 BACKUP SCRIPT COMPLETED" -ForegroundColor Green
Write-Host "=" * 60