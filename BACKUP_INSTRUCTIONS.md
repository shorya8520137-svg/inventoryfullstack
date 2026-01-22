# 💾 StockIQ Complete Server Backup Guide

## 🎯 Overview
This script creates a complete backup of your StockIQ Inventory Management System from your AWS server to your local desktop, including both project files and database.

## 🚀 Quick Start

### For Windows:
```cmd
# Run the backup script
backup-server-to-desktop.cmd
```

### For Linux/Mac:
```bash
# Make script executable
chmod +x backup-server-to-desktop.sh

# Run the backup script
./backup-server-to-desktop.sh
```

## 📋 What Gets Backed Up

### 1. 📦 Project Files
- Complete Next.js frontend application
- Node.js backend with all controllers
- API routes and middleware
- Configuration files (.env, package.json)
- Documentation (README.md with 35+ API docs)
- All source code and assets

### 2. 🗄️ Database
- Complete MySQL database dump
- All tables with live data:
  - Users and permissions
  - Products and categories
  - Inventory ledger entries
  - Dispatch and order records
  - Audit logs and system data

### 3. 📋 Documentation
- Backup information file
- Restoration instructions
- System credentials
- Deployment URLs
- GitHub repository links

## 📁 Backup Structure

```
Desktop/StockIQ_Backup_YYYYMMDD_HHMMSS/
├── project/
│   └── inventoryfullstack/
│       ├── src/                    # Frontend React/Next.js code
│       ├── controllers/            # Backend API controllers
│       ├── routes/                 # API route definitions
│       ├── middleware/             # Authentication & permissions
│       ├── db/                     # Database connection
│       ├── package.json            # Dependencies
│       ├── README.md               # Complete documentation
│       └── ...                     # All project files
├── database/
│   └── stockiq_database_backup.sql # Complete MySQL dump
└── BACKUP_INFO.txt                 # Restoration guide
```

## 🔄 Restoration Process

### 1. Project Setup
```bash
# Copy project to desired location
cp -r project/inventoryfullstack /path/to/new/location
cd /path/to/new/location

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials
```

### 2. Database Restoration
```sql
-- Create database
CREATE DATABASE inventory_system;

-- Import backup
mysql -u root -p inventory_system < database/stockiq_database_backup.sql
```

### 3. Start Application
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## ⚙️ Prerequisites

### Local System Requirements:
- SSH client (OpenSSH)
- SCP support
- Access to AWS server key file

### Server Requirements:
- MySQL/MariaDB installed
- Project files in ~/inventoryfullstack
- SSH access with provided key

## 🔐 Security Notes

1. **SSH Key**: Script uses your existing AWS connection key
2. **Database Password**: You'll be prompted for MySQL root password
3. **Temporary Files**: Automatically cleaned up from server
4. **Local Storage**: Backup saved to your desktop with timestamp

## 🛠️ Troubleshooting

### SSH Connection Issues:
```bash
# Test SSH connection
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86

# Check key permissions (Linux/Mac)
chmod 600 /path/to/awsconection.pem
```

### SCP Transfer Issues:
```bash
# Test SCP manually
scp -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86:~/test.txt ./
```

### Database Backup Issues:
```bash
# Check MySQL access on server
ssh -i "C:\Users\Admin\awsconection.pem" ubuntu@16.171.197.86 "mysql -u root -p -e 'SHOW DATABASES;'"
```

## 📊 System Information

### Current Deployments:
- **Frontend**: https://stockiqfullstacktest.vercel.app
- **Backend**: AWS EC2 (16.171.197.86:5000)

### GitHub Repositories:
- **Primary**: https://github.com/shorya8520137-svg/inventoryfullstack
- **Secondary**: https://github.com/shoryasingh-creator/hunyhunyinventory

### Admin Access:
- **Email**: admin@company.com
- **Password**: admin@123

## ✅ Verification Steps

After backup completion:

1. ✅ Check backup folder exists on desktop
2. ✅ Verify project files are complete
3. ✅ Confirm database backup file size (should be several MB)
4. ✅ Review BACKUP_INFO.txt for details
5. ✅ Test restoration on different machine (optional)

## 🔄 Automation Options

### Schedule Regular Backups:
```bash
# Add to crontab for daily backups (Linux/Mac)
0 2 * * * /path/to/backup-server-to-desktop.sh

# Windows Task Scheduler
# Create task to run backup-server-to-desktop.cmd daily
```

## 📞 Support

If you encounter issues:
1. Check SSH connectivity to server
2. Verify MySQL credentials
3. Ensure sufficient disk space locally
4. Review backup logs for specific errors

---

**Your complete StockIQ Inventory Management System will be safely backed up to your desktop with this comprehensive backup solution!** 💾🚀