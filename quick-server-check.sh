#!/bin/bash

echo "🔍 QUICK SERVER CHECK"
echo "===================="

# 1. Basic info
echo "1️⃣ Current location:"
pwd
echo ""

# 2. Server status
echo "2️⃣ Server process:"
ps aux | grep 'node.*server.js' | grep -v grep || echo "No node server found"
echo ""

# 3. Port check
echo "3️⃣ Port 5000 status:"
ss -tlnp | grep :5000 || echo "Port 5000 not listening"
echo ""

# 4. Simple health check
echo "4️⃣ Server health:"
timeout 3 curl -s http://localhost:5000/ || echo "Server not responding"
echo ""

# 5. Database connection test (quick)
echo "5️⃣ Database test:"
timeout 3 mysql -u inventory_user -pStrongPass@123 -e "SELECT 1 as test;" 2>/dev/null || echo "Database connection failed"
echo ""

# 6. Check users table (quick)
echo "6️⃣ Users count:"
timeout 3 mysql -u inventory_user -pStrongPass@123 inventory_db -e "SELECT COUNT(*) as user_count FROM users;" 2>/dev/null || echo "Cannot count users"
echo ""

# 7. Environment check
echo "7️⃣ Key environment variables:"
grep -E "JWT_SECRET|DB_" .env | head -5
echo ""

# 8. Package check
echo "8️⃣ Key packages:"
npm list --depth=0 2>/dev/null | grep -E "express|mysql2|bcrypt|jsonwebtoken" || echo "Package check failed"
echo ""

echo "✅ QUICK CHECK COMPLETED!"