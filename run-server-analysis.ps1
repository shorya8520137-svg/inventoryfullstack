# Run complete server analysis
Write-Host "🔍 RUNNING COMPLETE SERVER ANALYSIS" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

$keyPath = "C:\Users\Admin\awsconection.pem"
$serverUser = "ubuntu"
$serverIP = "16.171.161.150"

Write-Host "Server: $serverUser@$serverIP"
Write-Host ""

# Simple command to run the analysis
Write-Host "🚀 Starting analysis..." -ForegroundColor Yellow

& ssh -i $keyPath "$serverUser@$serverIP" @"
cd /home/ubuntu/inventoryfullstack
echo '📍 Current directory:' && pwd
echo ''
echo '🔍 Starting complete analysis...'
echo ''

# Database Analysis
echo '📊 DATABASE ANALYSIS'
echo '==================='

# Check .env file
echo '1️⃣ Environment configuration:'
cat .env | grep -E 'DB_|JWT_|PORT'
echo ''

# Test database connection
echo '2️⃣ Database connection test:'
mysql -u inventory_user -pStrongPass@123 inventory_db -e 'SELECT "Database OK" as status;' 2>/dev/null || echo 'Database connection failed'
echo ''

# List tables
echo '3️⃣ Database tables:'
mysql -u inventory_user -pStrongPass@123 inventory_db -e 'SHOW TABLES;' 2>/dev/null
echo ''

# Check users
echo '4️⃣ Users in database:'
mysql -u inventory_user -pStrongPass@123 inventory_db -e 'SELECT id, username, email, role FROM users LIMIT 5;' 2>/dev/null
echo ''

# API Testing
echo '🧪 API TESTING'
echo '============='

# Server health
echo '1️⃣ Server health:'
curl -s http://localhost:5000/ | head -2
echo ''

# Login test
echo '2️⃣ Login test:'
curl -s -X POST http://localhost:5000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"admin@admin.com","password":"admin123"}' | head -3
echo ''

# Server status
echo '🔧 SERVER STATUS'
echo '==============='

echo '1️⃣ Node process:'
ps aux | grep 'node.*server.js' | grep -v grep
echo ''

echo '2️⃣ Port 5000:'
ss -tlnp | grep :5000 2>/dev/null || echo 'Port 5000 not listening'
echo ''

echo '3️⃣ Package status:'
npm list --depth=0 | grep -E 'bcrypt|jsonwebtoken|mysql2|express' 2>/dev/null
echo ''

echo '✅ ANALYSIS COMPLETED!'
"@

Write-Host ""
Write-Host "✅ Server analysis completed!" -ForegroundColor Green