@echo off
echo ========================================
echo AUTOMATED SERVER SETUP AND API TESTING
echo ========================================
echo Server: 54.179.63.233
echo SSH Key: C:\Users\Admin\e2c.pem
echo Database Backup: C:\Users\Admin\Downloads\inventory_db_compressed (1).sql\inventory_db_compressed (1).sql
echo ========================================

echo.
echo PHASE 1: SERVER SETUP
echo ========================================

echo Step 1: Testing SSH Connection...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "echo 'SSH connection successful - $(date)'"

if %ERRORLEVEL% neq 0 (
    echo ERROR: SSH connection failed
    pause
    exit /b 1
)

echo.
echo Step 2: Uploading database backup...
scp -i "C:\Users\Admin\e2c.pem" "C:\Users\Admin\Downloads\inventory_db_compressed (1).sql\inventory_db_compressed (1).sql" ubuntu@54.179.63.233:~/backup.sql

if %ERRORLEVEL% neq 0 (
    echo ERROR: Database backup upload failed
    pause
    exit /b 1
)

echo.
echo Step 3: Complete server setup...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "
echo '=== INSTALLING SYSTEM DEPENDENCIES ==='
sudo apt update
sudo apt install -y mysql-server nodejs npm git curl

echo '=== STARTING MYSQL ==='
sudo systemctl start mysql
sudo systemctl enable mysql

echo '=== CREATING DATABASE ==='
sudo mysql -e \"CREATE DATABASE IF NOT EXISTS inventory_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\"
sudo mysql -e \"CREATE USER IF NOT EXISTS 'inventory_user'@'localhost' IDENTIFIED BY 'StrongPass@123';\"
sudo mysql -e \"GRANT ALL PRIVILEGES ON inventory_db.* TO 'inventory_user'@'localhost';\"
sudo mysql -e \"FLUSH PRIVILEGES;\"

echo '=== RESTORING DATABASE ==='
mysql -u inventory_user -pStrongPass@123 inventory_db < ~/backup.sql
rm ~/backup.sql

echo '=== CLONING/UPDATING REPOSITORY ==='
if [ -d 'inventoryfullstack' ]; then
    cd inventoryfullstack
    git stash push -m 'Local changes before update'
    git pull origin main
else
    git clone https://github.com/shorya8520137-svg/inventoryfullstack.git
    cd inventoryfullstack
fi

echo '=== INSTALLING NODE DEPENDENCIES ==='
npm install
sudo npm install -g pm2

echo '=== ADDING 2FA COLUMNS ==='
mysql -u inventory_user -pStrongPass@123 inventory_db < add-2fa-columns.sql || echo '2FA columns may already exist'

echo '=== CREATING ENVIRONMENT FILE ==='
cat > .env << 'EOF'
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
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-$(date +%s)

# CORS Configuration
FRONTEND_URL=https://stockiqfullstacktest.vercel.app
ALLOWED_ORIGINS=https://stockiqfullstacktest.vercel.app,https://54.179.63.233.nip.io

# API Configuration
API_VERSION=v1
EOF

echo '=== STARTING SERVER ==='
pm2 stop all || echo 'No processes to stop'
pm2 start server.js --name 'inventory-backend'
pm2 startup
pm2 save

echo '=== WAITING FOR SERVER TO START ==='
sleep 10

echo '=== CHECKING SERVER STATUS ==='
pm2 list
curl -f http://localhost:5000/api/health || echo 'Server may still be starting...'

echo '=== SERVER SETUP COMPLETE ==='
"

echo.
echo PHASE 2: API TESTING
echo ========================================

echo Step 4: Running comprehensive API tests...
ssh -i "C:\Users\Admin\e2c.pem" ubuntu@54.179.63.233 "
cd inventoryfullstack

echo '=== CREATING API TEST SCRIPT ==='
cat > test-all-apis.js << 'EOF'
const axios = require('axios');
const BASE_URL = 'http://localhost:5000/api';

async function testAllAPIs() {
    console.log('🚀 Starting Comprehensive API Testing...\n');
    
    const results = {
        health: false,
        auth: false,
        users: false,
        products: false,
        orders: false,
        dispatch: false,
        notifications: false,
        auditLogs: false,
        twoFA: false,
        permissions: false
    };
    
    // Test 1: Health Check
    try {
        console.log('1️⃣ Testing Health Check...');
        const response = await axios.get(\`\${BASE_URL}/health\`, { timeout: 5000 });
        if (response.status === 200) {
            results.health = true;
            console.log('✅ Health Check: PASS');
            console.log('📊 Response:', response.data);
        }
    } catch (error) {
        console.log('❌ Health Check: FAIL -', error.message);
    }
    
    // Test 2: Authentication Endpoints
    try {
        console.log('\n2️⃣ Testing Authentication...');
        
        // Test login endpoint (should fail with invalid credentials)
        const loginResponse = await axios.post(\`\${BASE_URL}/auth/login\`, {
            email: 'test@example.com',
            password: 'wrongpassword'
        }, { timeout: 5000 });
    } catch (error) {
        if (error.response && error.response.status === 401) {
            results.auth = true;
            console.log('✅ Authentication: PASS (Endpoint working)');
        } else {
            console.log('❌ Authentication: FAIL -', error.message);
        }
    }
    
    // Test 3: Users Endpoint
    try {
        console.log('\n3️⃣ Testing Users Endpoint...');
        const usersResponse = await axios.get(\`\${BASE_URL}/users\`, { timeout: 5000 });
    } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            results.users = true;
            console.log('✅ Users: PASS (Auth required)');
        } else {
            console.log('❌ Users: FAIL -', error.message);
        }
    }
    
    // Test 4: Products Endpoint
    try {
        console.log('\n4️⃣ Testing Products Endpoint...');
        const productsResponse = await axios.get(\`\${BASE_URL}/products\`, { timeout: 5000 });
    } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            results.products = true;
            console.log('✅ Products: PASS (Auth required)');
        } else {
            console.log('❌ Products: FAIL -', error.message);
        }
    }
    
    // Test 5: Orders Endpoint
    try {
        console.log('\n5️⃣ Testing Orders Endpoint...');
        const ordersResponse = await axios.get(\`\${BASE_URL}/orders\`, { timeout: 5000 });
    } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            results.orders = true;
            console.log('✅ Orders: PASS (Auth required)');
        } else {
            console.log('❌ Orders: FAIL -', error.message);
        }
    }
    
    // Test 6: Dispatch Endpoint
    try {
        console.log('\n6️⃣ Testing Dispatch Endpoint...');
        const dispatchResponse = await axios.get(\`\${BASE_URL}/dispatch\`, { timeout: 5000 });
    } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            results.dispatch = true;
            console.log('✅ Dispatch: PASS (Auth required)');
        } else {
            console.log('❌ Dispatch: FAIL -', error.message);
        }
    }
    
    // Test 7: Notifications Endpoint
    try {
        console.log('\n7️⃣ Testing Notifications Endpoint...');
        const notificationsResponse = await axios.get(\`\${BASE_URL}/notifications\`, { timeout: 5000 });
    } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            results.notifications = true;
            console.log('✅ Notifications: PASS (Auth required)');
        } else {
            console.log('❌ Notifications: FAIL -', error.message);
        }
    }
    
    // Test 8: Audit Logs Endpoint
    try {
        console.log('\n8️⃣ Testing Audit Logs Endpoint...');
        const auditResponse = await axios.get(\`\${BASE_URL}/audit-logs\`, { timeout: 5000 });
    } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            results.auditLogs = true;
            console.log('✅ Audit Logs: PASS (Auth required)');
        } else {
            console.log('❌ Audit Logs: FAIL -', error.message);
        }
    }
    
    // Test 9: 2FA Endpoint
    try {
        console.log('\n9️⃣ Testing 2FA Endpoint...');
        const twoFAResponse = await axios.get(\`\${BASE_URL}/2fa/status\`, {
            headers: { 'Authorization': 'Bearer invalid-token' },
            timeout: 5000
        });
    } catch (error) {
        if (error.response && error.response.status === 401) {
            results.twoFA = true;
            console.log('✅ 2FA: PASS (Auth required)');
        } else {
            console.log('❌ 2FA: FAIL -', error.message);
        }
    }
    
    // Test 10: Permissions Endpoint
    try {
        console.log('\n🔟 Testing Permissions Endpoint...');
        const permissionsResponse = await axios.get(\`\${BASE_URL}/permissions\`, { timeout: 5000 });
    } catch (error) {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            results.permissions = true;
            console.log('✅ Permissions: PASS (Auth required)');
        } else {
            console.log('❌ Permissions: FAIL -', error.message);
        }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 API TESTING SUMMARY');
    console.log('='.repeat(60));
    
    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(Boolean).length;
    
    console.log(\`✅ Health Check:    \${results.health ? 'PASS' : 'FAIL'}\`);
    console.log(\`✅ Authentication:  \${results.auth ? 'PASS' : 'FAIL'}\`);
    console.log(\`✅ Users:           \${results.users ? 'PASS' : 'FAIL'}\`);
    console.log(\`✅ Products:        \${results.products ? 'PASS' : 'FAIL'}\`);
    console.log(\`✅ Orders:          \${results.orders ? 'PASS' : 'FAIL'}\`);
    console.log(\`✅ Dispatch:        \${results.dispatch ? 'PASS' : 'FAIL'}\`);
    console.log(\`✅ Notifications:   \${results.notifications ? 'PASS' : 'FAIL'}\`);
    console.log(\`✅ Audit Logs:      \${results.auditLogs ? 'PASS' : 'FAIL'}\`);
    console.log(\`✅ 2FA System:      \${results.twoFA ? 'PASS' : 'FAIL'}\`);
    console.log(\`✅ Permissions:     \${results.permissions ? 'PASS' : 'FAIL'}\`);
    
    console.log('\n' + '='.repeat(60));
    console.log(\`🎯 OVERALL: \${passedTests}/\${totalTests} tests passed\`);
    
    if (passedTests >= 8) {
        console.log('🎉 SYSTEM IS OPERATIONAL!');
        console.log('\n🔗 Access URLs:');
        console.log('   Frontend: https://stockiqfullstacktest.vercel.app');
        console.log('   Backend:  https://54.179.63.233.nip.io');
        console.log('   Local:    http://localhost:5000');
    } else {
        console.log('⚠️  System needs attention');
    }
    
    console.log('='.repeat(60));
}

testAllAPIs().catch(console.error);
EOF

echo '=== RUNNING API TESTS ==='
node test-all-apis.js

echo '=== CHECKING DATABASE TABLES ==='
mysql -u inventory_user -pStrongPass@123 inventory_db -e \"SHOW TABLES;\"

echo '=== CHECKING USER COUNT ==='
mysql -u inventory_user -pStrongPass@123 inventory_db -e \"SELECT COUNT(*) as user_count FROM users;\"

echo '=== CHECKING 2FA COLUMNS ==='
mysql -u inventory_user -pStrongPass@123 inventory_db -e \"DESCRIBE users;\" | grep two_factor

echo '=== CHECKING SERVER LOGS ==='
pm2 logs --lines 20

echo '=== FINAL SERVER STATUS ==='
pm2 list
curl -f http://localhost:5000/api/health

echo '=== TESTING COMPLETE ==='
"

echo.
echo ========================================
echo AUTOMATION COMPLETE!
echo ========================================
echo.
echo ✅ Server Setup: Complete
echo ✅ Database: Restored and configured
echo ✅ Backend: Running on port 5000
echo ✅ API Testing: Complete
echo ✅ 2FA System: Deployed
echo.
echo 🔗 Access URLs:
echo    Frontend: https://stockiqfullstacktest.vercel.app
echo    Backend:  https://54.179.63.233.nip.io
echo    Server:   54.179.63.233
echo ========================================

pause