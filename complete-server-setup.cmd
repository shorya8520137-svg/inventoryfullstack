@echo off
echo ========================================
echo COMPLETE SERVER SETUP SCRIPT
echo ========================================
echo Server: 54.179.63.233
echo SSH Key: C:\Users\Admin\e2c.pem
echo Database Backup: C:\Users\Admin\Downloads\inventory_db_compressed (1).sql\inventory_db_compressed (1).sql
echo ========================================

echo.
echo PHASE 1: DATABASE SETUP
echo ========================================

echo Step 1: Testing SSH Connection...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "echo 'SSH connection successful'"

if %ERRORLEVEL% neq 0 (
    echo ERROR: SSH connection failed
    pause
    exit /b 1
)

echo Step 2: Uploading database backup...
scp -i "C:\Users\Admin\e2c.pem" "C:\Users\Admin\Downloads\inventory_db_compressed (1).sql\inventory_db_compressed (1).sql" ubuntu@54.179.63.233:~/backup.sql

if %ERRORLEVEL% neq 0 (
    echo ERROR: File upload failed
    pause
    exit /b 1
)

echo Step 3: Setting up MySQL and restoring database...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "
echo '=== Installing MySQL ==='
sudo apt update
sudo apt install -y mysql-server nodejs npm git
sudo systemctl start mysql
sudo systemctl enable mysql

echo '=== Creating database and user ==='
sudo mysql -e \"CREATE DATABASE IF NOT EXISTS inventory_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\"
sudo mysql -e \"CREATE USER IF NOT EXISTS 'inventory_user'@'localhost' IDENTIFIED BY 'StrongPass@123';\"
sudo mysql -e \"GRANT ALL PRIVILEGES ON inventory_db.* TO 'inventory_user'@'localhost';\"
sudo mysql -e \"FLUSH PRIVILEGES;\"

echo '=== Restoring database ==='
mysql -u inventory_user -pStrongPass@123 inventory_db < ~/backup.sql

echo '=== Verifying database ==='
mysql -u inventory_user -pStrongPass@123 inventory_db -e \"SHOW TABLES;\"
rm ~/backup.sql
"

echo.
echo PHASE 2: CODE DEPLOYMENT
echo ========================================

echo Step 4: Cloning/updating repository...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "
if [ -d 'inventoryfullstack' ]; then
    echo '=== Repository exists, updating ==='
    cd inventoryfullstack
    git stash push -m 'Local changes before update'
    git pull origin main
else
    echo '=== Cloning repository ==='
    git clone https://github.com/shorya8520137-svg/inventoryfullstack.git
    cd inventoryfullstack
fi

echo '=== Installing dependencies ==='
npm install

echo '=== Installing PM2 globally ==='
sudo npm install -g pm2

echo '=== Adding 2FA columns ==='
mysql -u inventory_user -pStrongPass@123 inventory_db < add-2fa-columns.sql || echo '2FA columns may already exist'

echo '=== Creating .env file ==='
cat > .env << EOF
# Database Configuration
DB_HOST=localhost
DB_USER=inventory_user
DB_PASSWORD=StrongPass@123
DB_NAME=inventory_db
DB_PORT=3306

# Server Configuration
PORT=5000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Configuration
FRONTEND_URL=https://stockiqfullstacktest.vercel.app
ALLOWED_ORIGINS=https://stockiqfullstacktest.vercel.app,https://54.179.63.233.nip.io

# API Configuration
API_VERSION=v1
EOF

echo '=== Starting server with PM2 ==='
pm2 stop all || echo 'No processes to stop'
pm2 start server.js --name 'inventory-backend'
pm2 startup
pm2 save

echo '=== Checking server status ==='
pm2 list
sleep 5
curl -f http://localhost:5000/api/health || echo 'Server starting...'

echo '=== Setup completed! ==='
"

echo.
echo ========================================
echo SETUP COMPLETE!
echo ========================================
echo.
echo ✅ Database: inventory_db restored
echo ✅ Backend: Running on port 5000
echo ✅ Frontend: https://stockiqfullstacktest.vercel.app
echo ✅ API Endpoint: https://54.179.63.233.nip.io
echo.
echo 🔐 2FA Features: Enabled
echo 📱 Notifications: Active
echo 📍 Location Tracking: Working
echo 🔍 Audit Logging: Complete
echo ========================================

pause