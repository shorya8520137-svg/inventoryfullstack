const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function checkAndFixAdmin() {
    const connection = await mysql.createConnection({
        host: '16.171.197.86',
        user: 'root',
        password: 'StrongPass@123',
        database: 'inventory_db'
    });

    try {
        console.log('🔍 Checking current admin user...\n');
        
        // Check current admin user
        const [users] = await connection.execute(`
            SELECT id, name, email, password, role_id, status 
            FROM users 
            WHERE email = 'admin@company.com' OR role_id = 1
            LIMIT 5
        `);
        
        console.log('Current users:');
        users.forEach(user => {
            console.log(`- ID: ${user.id}, Email: ${user.email}, Role: ${user.role_id}, Status: ${user.status}`);
            console.log(`  Password hash: ${user.password?.substring(0, 20)}...`);
        });
        
        if (users.length === 0) {
            console.log('\n❌ No admin user found! Creating new admin...');
            
            // Create admin user with proper bcrypt hash
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            await connection.execute(`
                INSERT INTO users (name, email, password, role_id, status, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, NOW(), NOW())
            `, ['Admin User', 'admin@company.com', hashedPassword, 1, 'active']);
            
            console.log('✅ Admin user created successfully!');
            
        } else {
            console.log('\n🔧 Fixing admin password...');
            
            // Update admin password with proper bcrypt hash
            const hashedPassword = await bcrypt.hash('admin123', 10);
            
            await connection.execute(`
                UPDATE users 
                SET password = ?, status = 'active', updated_at = NOW()
                WHERE email = 'admin@company.com'
            `, [hashedPassword]);
            
            console.log('✅ Admin password updated successfully!');
        }
        
        // Verify the fix
        console.log('\n🧪 Testing password verification...');
        const [updatedUsers] = await connection.execute(`
            SELECT id, name, email, password, role_id 
            FROM users 
            WHERE email = 'admin@company.com'
        `);
        
        if (updatedUsers.length > 0) {
            const user = updatedUsers[0];
            const isValid = await bcrypt.compare('admin123', user.password);
            console.log(`Password verification: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
            
            if (isValid) {
                console.log('\n🎉 Admin login should work now!');
                console.log('Credentials:');
                console.log('Email: admin@company.com');
                console.log('Password: admin123');
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

checkAndFixAdmin();