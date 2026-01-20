const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function fixAdminPassword() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'inventory_user',
        password: 'StrongPass@123',
        database: 'inventory_db'
    });

    try {
        console.log('🔧 Fixing admin password...');
        
        // Hash the password
        const hashedPassword = await bcrypt.hash('admin@123', 10);
        
        // Update admin user
        const [result] = await connection.execute(`
            UPDATE users 
            SET password = ?, status = 'active', updated_at = NOW()
            WHERE email = 'admin@company.com'
        `, [hashedPassword]);
        
        console.log('✅ Admin password updated! Rows affected:', result.affectedRows);
        
        // If no rows affected, create admin user
        if (result.affectedRows === 0) {
            console.log('Creating new admin user...');
            await connection.execute(`
                INSERT INTO users (name, email, password, role_id, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())
            `, ['Admin User', 'admin@company.com', hashedPassword, 1, 'active']);
            console.log('✅ Admin user created!');
        }
        
        // Verify
        const [users] = await connection.execute(`
            SELECT id, name, email, role_id, status FROM users WHERE email = 'admin@company.com'
        `);
        
        if (users.length > 0) {
            console.log('✅ Admin user verified:', users[0]);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

fixAdminPassword();