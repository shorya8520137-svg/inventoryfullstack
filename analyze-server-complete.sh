#!/bin/bash

echo "🔍 COMPLETE SERVER ANALYSIS"
echo "=========================="
echo "Step 1: Database Analysis"
echo "Step 2: API Testing"
echo "Step 3: Issue Identification & Fixes"
echo ""

# Database credentials from .env
DB_USER="inventory_user"
DB_PASS="StrongPass@123"
DB_NAME="inventory_db"

echo "📊 STEP 1: DATABASE ANALYSIS"
echo "============================"

# 1. Check database connection
echo "1️⃣ Testing database connection..."
mysql -u $DB_USER -p$DB_PASS -e "SELECT 'Database connection successful' as status;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Database connection: OK"
else
    echo "❌ Database connection: FAILED"
    echo "Trying with different credentials..."
fi
echo ""

# 2. List all tables
echo "2️⃣ Database tables:"
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "SHOW TABLES;" 2>/dev/null
echo ""

# 3. Check users table structure
echo "3️⃣ Users table structure:"
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "DESCRIBE users;" 2>/dev/null
echo ""

# 4. Check existing users
echo "4️⃣ Existing users:"
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "SELECT id, username, email, role, created_at FROM users LIMIT 10;" 2>/dev/null
echo ""

# 5. Check roles table
echo "5️⃣ Roles table:"
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "SELECT * FROM roles LIMIT 10;" 2>/dev/null || echo "❌ Roles table not found"
echo ""

# 6. Check permissions table
echo "6️⃣ Permissions table:"
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "SELECT * FROM permissions LIMIT 10;" 2>/dev/null || echo "❌ Permissions table not found"
echo ""

# 7. Check products table
echo "7️⃣ Products table sample:"
mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "SELECT id, name, category, price FROM products LIMIT 5;" 2>/dev/null || echo "❌ Products table not found"
echo ""

echo "🧪 STEP 2: API TESTING"
echo "====================="

# Test server health
echo "1️⃣ Server health check:"
curl -s http://localhost:5000/ | head -3
echo ""
echo ""

# Test login with different credentials
echo "2️⃣ Login tests:"

# Get first user from database for testing
FIRST_USER=$(mysql -u $DB_USER -p$DB_PASS $DB_NAME -se "SELECT email FROM users LIMIT 1;" 2>/dev/null)
if [ -n "$FIRST_USER" ]; then
    echo "Testing with database user: $FIRST_USER"
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
        -H "Content-Type: application/json" \
        -d "{\"email\":\"$FIRST_USER\",\"password\":\"admin123\"}")
    echo "Response: $LOGIN_RESPONSE"
    echo ""
fi

# Try common admin credentials
echo "Testing with admin@admin.com:"
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@admin.com","password":"admin123"}')
echo "Response: $LOGIN_RESPONSE"

# Extract token if successful
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo ""

if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
    echo "✅ Token received: ${TOKEN:0:30}..."
    echo ""
    
    # Test protected APIs
    echo "3️⃣ Testing protected APIs:"
    
    echo "📦 Products API:"
    curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/products | head -3
    echo ""
    echo ""
    
    echo "👥 Users API:"
    curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/users | head -3
    echo ""
    echo ""
    
    echo "🎭 Roles API:"
    curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/roles | head -3
    echo ""
    echo ""
    
    echo "🔒 Permissions API:"
    curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/permissions | head -3
    echo ""
    echo ""
    
    echo "📋 Dispatch API:"
    curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/dispatch | head -3
    echo ""
    echo ""
    
    echo "📊 Inventory API:"
    curl -s -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/inventory | head -3
    echo ""
    echo ""
    
else
    echo "❌ No valid token - cannot test protected APIs"
    echo "Login response: $LOGIN_RESPONSE"
fi

echo "🔧 STEP 3: ISSUE ANALYSIS"
echo "========================"

# Check server process
echo "1️⃣ Server process status:"
ps aux | grep 'node.*server.js' | grep -v grep
echo ""

# Check port usage
echo "2️⃣ Port 5000 status:"
ss -tlnp | grep :5000 || netstat -tlnp | grep :5000 2>/dev/null || echo "Port 5000 not found"
echo ""

# Check server logs (if using systemd)
echo "3️⃣ Recent server activity:"
tail -20 /var/log/syslog | grep node 2>/dev/null || echo "No recent node logs in syslog"
echo ""

# Check for common issues
echo "4️⃣ Common issues check:"

# Check if JWT secret is set
if grep -q "JWT_SECRET" .env; then
    echo "✅ JWT_SECRET found in .env"
else
    echo "❌ JWT_SECRET missing in .env"
fi

# Check database connection in code
if grep -q "DB_HOST" .env; then
    echo "✅ Database config found in .env"
else
    echo "❌ Database config missing in .env"
fi

# Check if bcrypt is installed
if npm list bcrypt >/dev/null 2>&1; then
    echo "✅ bcrypt package installed"
else
    echo "❌ bcrypt package missing"
fi

# Check if jsonwebtoken is installed
if npm list jsonwebtoken >/dev/null 2>&1; then
    echo "✅ jsonwebtoken package installed"
else
    echo "❌ jsonwebtoken package missing"
fi

echo ""
echo "🎯 ANALYSIS COMPLETE!"
echo "===================="
echo ""
echo "📋 SUMMARY:"
echo "1. Database analysis completed"
echo "2. API testing completed"
echo "3. Issue identification completed"
echo ""
echo "📝 Next steps based on findings above:"
echo "- Fix any missing database tables"
echo "- Fix authentication issues"
echo "- Fix missing dependencies"
echo "- Test APIs again after fixes"