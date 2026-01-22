#!/bin/bash

# =====================================================
# STOCKIQ INVENTORY - COMPLETE SERVER BACKUP SCRIPT
# =====================================================
# This script backs up both project files and database
# from AWS server to local desktop
# =====================================================

echo "🚀 Starting StockIQ Complete Server Backup..."
echo "========================================================"

# Set backup directory on desktop
BACKUP_DIR="$HOME/Desktop/StockIQ_Backup_$(date +%Y%m%d_%H%M%S)"

echo "📁 Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR/project"
mkdir -p "$BACKUP_DIR/database"

echo "========================================================"
echo "📦 STEP 1: Backing up project files from server..."
echo "========================================================"

# Download project files using SCP
echo "📥 Downloading inventoryfullstack project..."
scp -i "C:/Users/Admin/awsconection.pem" -r ubuntu@16.171.197.86:~/inventoryfullstack "$BACKUP_DIR/project/"

echo "========================================================"
echo "🗄️ STEP 2: Backing up MySQL database..."
echo "========================================================"

# Create database backup on server first, then download
echo "💾 Creating database dump on server..."
ssh -i "C:/Users/Admin/awsconection.pem" ubuntu@16.171.197.86 "mysqldump -u root -p inventory_system > ~/stockiq_database_backup.sql"

echo "📥 Downloading database backup..."
scp -i "C:/Users/Admin/awsconection.pem" ubuntu@16.171.197.86:~/stockiq_database_backup.sql "$BACKUP_DIR/database/"

echo "========================================================"
echo "📋 STEP 3: Creating backup documentation..."
echo "========================================================"

# Create backup info file
echo "Creating backup information file..."
cat > "$BACKUP_DIR/BACKUP_INFO.txt" << EOF
StockIQ Inventory Management System - Complete Backup
=====================================================
Backup Date: $(date)
Server: ubuntu@16.171.197.86

CONTENTS:
=========
1. PROJECT FILES: /project/inventoryfullstack/
   - Complete Next.js frontend
   - Node.js backend with all controllers
   - API routes and middleware
   - Documentation and configuration

2. DATABASE: /database/stockiq_database_backup.sql
   - Complete MySQL database dump
   - All tables with data
   - User accounts and permissions
   - Inventory and order data

RESTORATION INSTRUCTIONS:
========================
1. Project Files:
   - Copy inventoryfullstack folder to desired location
   - Run: npm install
   - Configure .env file with database credentials
   - Run: npm run dev (development) or npm run build + npm start (production)

2. Database:
   - Create new MySQL database: CREATE DATABASE inventory_system;
   - Import backup: mysql -u root -p inventory_system < stockiq_database_backup.sql
   - Update connection settings in project

3. Dependencies:
   - Node.js 16+
   - MySQL 8.0+
   - PM2 (for production)

LIVE DEPLOYMENTS:
================
Frontend: https://stockiqfullstacktest.vercel.app
Backend: AWS EC2 (16.171.197.86:5000)

GITHUB REPOSITORIES:
===================
Primary: https://github.com/shorya8520137-svg/inventoryfullstack
Secondary: https://github.com/shoryasingh-creator/hunyhunyinventory

ADMIN CREDENTIALS:
=================
Email: admin@company.com
Password: admin@123

BACKUP COMPLETED: $(date)
EOF

echo "========================================================"
echo "🧹 STEP 4: Cleaning up server temporary files..."
echo "========================================================"

# Clean up temporary database file on server
echo "🗑️ Removing temporary database file from server..."
ssh -i "C:/Users/Admin/awsconection.pem" ubuntu@16.171.197.86 "rm -f ~/stockiq_database_backup.sql"

echo "========================================================"
echo "✅ BACKUP COMPLETED SUCCESSFULLY!"
echo "========================================================"
echo "📍 Backup Location: $BACKUP_DIR"
echo ""
echo "📊 BACKUP CONTENTS:"
echo "├── project/"
echo "│   └── inventoryfullstack/          (Complete project files)"
echo "├── database/"
echo "│   └── stockiq_database_backup.sql  (MySQL database dump)"
echo "└── BACKUP_INFO.txt                  (Restoration instructions)"
echo ""
echo "🔄 TO RESTORE:"
echo "1. Copy project files to desired location"
echo "2. Import database using MySQL"
echo "3. Configure environment variables"
echo "4. Run npm install and start application"
echo ""
echo "💾 Your complete StockIQ system is now safely backed up!"

# Open backup folder (macOS/Linux)
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "$BACKUP_DIR"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "$BACKUP_DIR" 2>/dev/null || echo "📂 Backup saved to: $BACKUP_DIR"
fi