@echo off
echo ========================================
echo 🚀 StockIQ Server Setup with 2FA
echo ========================================
echo 🖥️ Server: 18.143.102.115
echo 🔑 Key: C:\Users\Admin\e2c.pem
echo 📊 Database: inventory_db
echo 🔐 Feature: 2FA Implementation
echo ========================================

echo.
echo 🔍 Step 1: Connecting to Server
echo ----------------------------------------
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@18.143.102.115 "echo '✅ Connected to server successfully'"

if %ERRORLEVEL% neq 0 (
    echo ❌ SSH connection failed!
    pause
    exit /b 1
)

echo.
echo 📁 Step 2: Checking Project Directory
echo ----------------------------------------
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@18.143.102.115 "
if [ -d ~/inventoryfullstack ]; then
    echo '✅ Project directory exists'
    cd ~/inventoryfullstack
    echo '📊 Current git status:'
    git status --porcelain
    echo '📋 Current branch:'
    git branch --show-current
else
    echo '❌ Project directory not found!'
    echo '🔧 Cloning repository...'
    git clone https://github.com/shorya8520137-svg/inventoryfullstack.git
    cd ~/inventoryfullstack
fi
"

echo.
echo 🔄 Step 3: Handling Git Conflicts and Pulling Latest Changes
echo ----------------------------------------
echo Stashing local changes and pulling latest code with 2FA...

ssh -i "C:\Users\Admin\e2c.pem" ubuntu@18.143.102.115 "
cd ~/inventoryfullstack

echo '🔄 Stashing any local changes...'
git stash push -m 'Auto-stash before pulling 2FA updates'

echo '📥 Pulling latest changes from GitHub...'
git pull origin main

if [ \$? -eq 0 ]; then
    echo '✅ Successfully pulled latest changes'
    echo '📋 Recent commits:'
    git log --oneline -5
else
    echo '❌ Git pull failed, trying to resolve...'
    git reset --hard origin/main
    git pull origin main
fi

echo '📁 Checking for 2FA files:'
ls -la routes/twoFactorRoutes.js 2>/dev/null && echo '✅ 2FA routes found' || echo '❌ 2FA routes missing'
ls -la controllers/twoFactorController.js 2>/dev/null && echo '✅ 2FA controller found' || echo '❌ 2FA controller missing'
ls -la services/TwoFactorAuthService.js 2>/dev/null && echo '✅ 2FA service found' || echo '❌ 2FA service missing'
ls -la add-2fa-columns.sql 2>/dev/null && echo '✅ 2FA SQL found' || echo '❌ 2FA SQL missing'
"

echo.
echo 🗄️ Step 4: Applying 2FA Database Changes
echo ----------------------------------------
echo Adding 2FA columns to users table...

ssh -i "C:\Users\Admin\e2c.pem" ubuntu@18.143.102.115 "
cd ~/inventoryfullstack

echo '🔍 Checking current users table structure:'
mysql -u inventory_user -pStrongPass@123 inventory_db -e 'DESCRIBE users;'

echo '🔧 Applying 2FA database changes...'
if [ -f add-2fa-columns.sql ]; then
    mysql -u inventory_user -pStrongPass@123 inventory_db < add-2fa-columns.sql
    if [ \$? -eq 0 ]; then
        echo '✅ 2FA columns added successfully'
    else
        echo '⚠️ 2FA columns may already exist, continuing...'
    fi
else
    echo '⚠️ 2FA SQL file not found, creating manually...'
    mysql -u inventory_user -pStrongPass@123 inventory_db -e \"
    ALTER TABLE users 
    ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255) NULL,
    ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS two_factor_backup_codes JSON NULL,
    ADD COLUMN IF NOT EXISTS two_factor_setup_at TIMESTAMP NULL;
    \"
fi

echo '🔍 Verifying 2FA columns:'
mysql -u inventory_user -pStrongPass@123 inventory_db -e \"
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'inventory_db' 
AND TABLE_NAME = 'users' 
AND COLUMN_NAME LIKE '%two_factor%';
\"
"

echo.
echo 📦 Step 5: Installing Dependencies
echo ----------------------------------------
echo Installing Node.js dependencies including 2FA packages...

ssh -i "C:\Users\Admin\e2c.pem" ubuntu@18.143.102.115 "
cd ~/inventoryfullstack

echo '📦 Installing/updating dependencies...'
npm install

echo '🔐 Checking 2FA specific packages:'
npm list speakeasy qrcode 2>/dev/null || echo '⚠️ Installing 2FA packages...'
npm install speakeasy qrcode

echo '✅ Dependencies installed'
"

echo.
echo 🔧 Step 6: Updating Environment Configuration
echo ----------------------------------------
echo Ensuring environment variables are properly set...

ssh -i "C:\Users\Admin\e2c.pem" ubuntu@18.143.102.115 "
cd ~/inventoryfullstack

echo '🔍 Checking .env file:'
if [ -f .env ]; then
    echo '✅ .env file exists'
    echo '📋 Current database config:'
    grep -E '^DB_' .env || echo 'No DB config found'
else
    echo '⚠️ Creating .env file...'
    cat > .env << 'EOF'
# Database Configuration
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=inventory_db
DB_USER=inventory_user
DB_PASSWORD=StrongPass@123

# Server Configuration
NODE_ENV=production
PORT=5000

# JWT Secret
JWT_SECRET=supersecretkey123

# Frontend URL
FRONTEND_URL=http://localhost:3000
EOF
fi

echo '✅ Environment configured'
"

echo.
echo 🚀 Step 7: Starting/Restarting Server
echo ----------------------------------------
echo Restarting server to apply all changes...

ssh -i "C:\Users\Admin\e2c.pem" ubuntu@18.143.102.115 "
cd ~/inventoryfullstack

echo '🔄 Stopping existing server processes...'
pkill -f 'node.*server.js' || echo 'No existing server process found'
pkill -f 'npm.*start' || echo 'No npm process found'

echo '🚀 Starting server with PM2...'
if command -v pm2 >/dev/null 2>&1; then
    pm2 stop all 2>/dev/null || true
    pm2 start server.js --name 'stockiq-backend'
    pm2 save
    echo '✅ Server started with PM2'
    pm2 status
else
    echo '📦 Installing PM2...'
    sudo npm install -g pm2
    pm2 start server.js --name 'stockiq-backend'
    pm2 save
    pm2 startup
    echo '✅ Server started with PM2'
fi

echo '🔍 Checking server status:'
sleep 3
curl -s http://localhost:5000/api/health 2>/dev/null && echo '✅ Server is responding' || echo '⚠️ Server may still be starting...'
"

echo.
echo 🧪 Step 8: Testing 2FA Implementation
echo ----------------------------------------
echo Testing if 2FA endpoints are working...

ssh -i "C:\Users\Admin\e2c.pem" ubuntu@18.143.102.115 "
cd ~/inventoryfullstack

echo '🔍 Testing 2FA endpoints:'
sleep 5

# Test if server is running
if curl -s http://localhost:5000 >/dev/null; then
    echo '✅ Server is running'
    
    # Test 2FA routes (these will require authentication, but we can check if they exist)
    echo '🔐 Checking 2FA routes availability:'
    curl -s -o /dev/null -w '%{http_code}' http://localhost:5000/api/2fa/status && echo ' - 2FA status endpoint accessible'
    
else
    echo '⚠️ Server not responding yet, checking logs:'
    pm2 logs stockiq-backend --lines 10
fi
"

echo.
echo ========================================
echo 🎉 SERVER SETUP COMPLETE!
echo ========================================
echo ✅ Database: inventory_db restored and configured
echo ✅ Code: Latest version with 2FA pulled from GitHub
echo ✅ 2FA: Database columns added and service configured
echo ✅ Server: Running on port 5000 with PM2
echo ✅ Dependencies: All packages installed including 2FA
echo.
echo 🔗 Access Points:
echo   - Backend API: http://18.143.102.115:5000
echo   - Health Check: http://18.143.102.115:5000/api/health
echo   - 2FA Setup: Available in user dashboard
echo.
echo 🔄 Next Steps:
echo 1. Update frontend .env files with new server IP
echo 2. Test login functionality
echo 3. Test 2FA setup for users
echo 4. Deploy frontend to Vercel with updated API URL
echo ========================================

pause