const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function fixShoryaPassword() {
    console.log('🔧 Fixing Shorya Password...\n');

    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'inventory_user',
        password: 'StrongPass@123',
        database: 'inventory_db'
    });

    try {
        // Check current user
        console.log('1. Checking current shorya user...');
        const [users] = await connection.execute(
            'SELECT id, name, email, password FROM users WHERE email = ?',
            ['shorya@company.com']
        );

        if (users.length === 0) {
            console.log('❌ User not found');
            return;
        }

        const user = users[0];
        console.log('✅ Found user:', user.name, user.email);
        console.log('Current password hash:', user.password);

        // Update with plain text password (matching admin pattern)
        console.log('\n2. Updating password to plain text...');
        await connection.execute(
            'UPDATE users SET password = ? WHERE email = ?',
            ['shorya123', 'shorya@company.com']
        );

        console.log('✅ Password updated to: shorya123');

        // Verify update
        const [updatedUsers] = await connection.execute(
            'SELECT password FROM users WHERE email = ?',
            ['shorya@company.com']
        );

        console.log('New password in DB:', updatedUsers[0].password);
        console.log('\n🎉 Shorya password fixed!');
        console.log('Login credentials: shorya@company.com / shorya123');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

fixShoryaPassword();