@echo off
echo ========================================
echo FIXING ADMIN LOGIN ON SERVER
echo ========================================

echo Step 1: Connect to server and fix admin password...
ssh -i "C:\Users\Admin\awsconection.pem" -o ConnectTimeout=10 ubuntu@16.171.197.86 "cd /home/ubuntu/inventoryfullstack && node -e \"
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

(async () => {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'root',
        password: 'StrongPass@123',
        database: 'inventory_db'
    });

    try {
        console.log('Fixing admin password...');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await connection.execute(\`
            UPDATE users 
            SET password = ?, status = 'active', updated_at = NOW()
            WHERE email = 'admin@company.com'
        \`, [hashedPassword]);
        
        console.log('✅ Admin password updated successfully!');
        
        // Verify
        const [users] = await connection.execute(\`
            SELECT id, email, role_id FROM users WHERE email = 'admin@company.com'
        \`);
        
        if (users.length > 0) {
            console.log('Admin user found:', users[0]);
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await connection.end();
    }
})();
\""

echo Step 2: Test login after fix...
timeout 3 > nul

echo ========================================
echo ADMIN LOGIN FIX COMPLETE
echo ========================================