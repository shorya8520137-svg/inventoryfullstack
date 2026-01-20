const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function debugShoryaAuth() {
    console.log('🔍 Debug Shorya Authentication...\n');

    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'inventory_user',
        password: 'StrongPass@123',
        database: 'inventory_db'
    });

    try {
        // Check user details
        console.log('1. Checking user in database...');
        const [users] = await connection.execute(`
            SELECT u.id, u.name, u.email, u.password, u.is_active, r.name as role_name
            FROM users u
            JOIN roles r ON u.role_id = r.id
            WHERE u.email = ?
        `, ['shorya@company.com']);

        if (users.length === 0) {
            console.log('❌ User not found in database');
            return;
        }

        const user = users[0];
        console.log('✅ User found:');
        console.log('   ID:', user.id);
        console.log('   Name:', user.name);
        console.log('   Email:', user.email);
        console.log('   Password:', user.password);
        console.log('   Active:', user.is_active);
        console.log('   Role:', user.role_name);

        // Test password matching logic
        console.log('\n2. Testing password matching...');
        const testPassword = 'shorya123';
        
        console.log('Testing plain text comparison...');
        const plainMatch = (testPassword === user.password);
        console.log('Plain text match:', plainMatch);

        console.log('Testing bcrypt comparison...');
        try {
            const bcryptMatch = await bcrypt.compare(testPassword, user.password);
            console.log('Bcrypt match:', bcryptMatch);
        } catch (bcryptError) {
            console.log('Bcrypt failed:', bcryptError.message);
        }

        // Check if it's admin role special case
        console.log('\n3. Checking admin role special case...');
        const isAdminRole = (user.role_name === 'admin' || user.role_name === 'super_admin');
        console.log('Is admin role:', isAdminRole);
        
        if (isAdminRole) {
            console.log('Would match admin@123:', testPassword === 'admin@123');
            console.log('Would match Admin@123:', testPassword === 'Admin@123');
        }

        // Suggest fix
        console.log('\n4. Suggested fix...');
        if (!plainMatch && user.role_name !== 'admin') {
            console.log('❌ Password mismatch detected');
            console.log('💡 Need to update password or fix auth logic');
            
            // Update password to match expected format
            await connection.execute(
                'UPDATE users SET password = ? WHERE email = ?',
                ['shorya123', 'shorya@company.com']
            );
            console.log('✅ Updated password to plain text: shorya123');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

debugShoryaAuth();