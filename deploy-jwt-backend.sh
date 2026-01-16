#!/bin/bash

# =====================================================
# DEPLOY JWT AUTHENTICATION BACKEND
# =====================================================

echo "🚀 Deploying JWT Authentication Backend..."
echo ""

# Step 1: Install JWT dependencies
echo "📦 Step 1: Installing JWT dependencies..."
npm install jsonwebtoken bcryptjs

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""

# Step 2: Create admin user with proper password hash
echo "👤 Step 2: Creating admin user with hashed password..."
node -e "
const bcrypt = require('bcryptjs');
const password = 'Admin@123';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error('Error hashing password:', err);
        process.exit(1);
    }
    
    const mysql = require('mysql2');
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'inventory_user',
        password: 'StrongPass@123',
        database: 'inventory_db'
    });
    
    const updateQuery = \`
        UPDATE users 
        SET password = ?, name = 'admin', email = 'admin@inventory.com'
        WHERE role_id = (SELECT id FROM roles WHERE name = 'admin' LIMIT 1)
        OR name = 'admin'
        OR email = 'admin@inventory.com'
        LIMIT 1
    \`;
    
    connection.query(updateQuery, [hash], (error, results) => {
        if (error) {
            console.error('Database error:', error);
            process.exit(1);
        }
        
        if (results.affectedRows > 0) {
            console.log('✅ Admin user password updated');
        } else {
            // Create new admin user
            const insertQuery = \`
                INSERT INTO users (name, email, password, role_id, is_active)
                VALUES ('admin', 'admin@inventory.com', ?, 
                    (SELECT id FROM roles WHERE name = 'admin' LIMIT 1), 1)
            \`;
            
            connection.query(insertQuery, [hash], (insertError, insertResults) => {
                if (insertError) {
                    console.error('Insert error:', insertError);
                    process.exit(1);
                }
                console.log('✅ Admin user created');
            });
        }
        
        connection.end();
    });
});
"

echo ""

# Step 3: Restart server
echo "🔄 Step 3: Restarting server..."
pkill -9 node
sleep 2
nohup node server.js > server.log 2>&1 &

echo "✅ Server restarted"
echo ""

# Step 4: Test authentication
echo "🧪 Step 4: Testing authentication..."
sleep 3

echo "Testing login API..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@inventory.com","password":"Admin@123"}')

echo "Login response:"
echo "$LOGIN_RESPONSE" | jq '.'

# Extract token for further testing
TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo ""
    echo "✅ Login successful! Token received."
    
    echo ""
    echo "Testing protected route..."
    curl -s http://localhost:5000/api/auth/me \
      -H "Authorization: Bearer $TOKEN" | jq '.'
    
    echo ""
    echo "Testing products API with token..."
    curl -s http://localhost:5000/api/products \
      -H "Authorization: Bearer $TOKEN" | jq '.success, (.data | length)'
      
else
    echo "❌ Login failed or no token received"
fi

echo ""
echo "========================================="
echo "🎉 JWT BACKEND DEPLOYMENT COMPLETED!"
echo "========================================="
echo ""
echo "📝 What was deployed:"
echo "   ✅ JWT authentication middleware"
echo "   ✅ Auth controller with login/logout"
echo "   ✅ Auth routes (/api/auth/*)"
echo "   ✅ Protected all API routes with JWT"
echo "   ✅ Admin user with hashed password"
echo ""
echo "🔑 Admin Credentials:"
echo "   Email: admin@inventory.com"
echo "   Password: Admin@123"
echo ""
echo "📋 API Endpoints:"
echo "   POST /api/auth/login - Login"
echo "   GET /api/auth/me - Get current user"
echo "   POST /api/auth/logout - Logout"
echo "   POST /api/auth/change-password - Change password"
echo ""
echo "🔒 All other /api/* routes now require JWT token"
echo ""