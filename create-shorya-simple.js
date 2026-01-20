const mysql = require('mysql2/promise');

async function createShoryaSimple() {
    console.log('🚀 Creating Shorya Role and User (Simple Version)...\n');

    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'inventory_user',
        password: 'StrongPass@123',
        database: 'inventory_db'
    });

    try {
        // Step 1: Create role if not exists
        console.log('1. Creating shorya_final_test role...');
        
        await connection.execute(`
            INSERT IGNORE INTO roles (name, display_name, description, color, is_active) 
            VALUES ('shorya_final_test', 'Shorya Final Test', 'Test role for dispatch and orders', '#4F46E5', 1)
        `);

        const [roles] = await connection.execute('SELECT id FROM roles WHERE name = ?', ['shorya_final_test']);
        const roleId = roles[0].id;
        console.log('✅ Role ID:', roleId);

        // Step 2: Clear and assign permissions
        console.log('\n2. Assigning permissions...');
        await connection.execute('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);

        // Get some basic permissions
        const [perms] = await connection.execute(`
            SELECT id, name FROM permissions 
            WHERE name IN ('DISPATCH_CREATE', 'DISPATCH_VIEW', 'INVENTORY_VIEW', 'ORDER_VIEW') 
            OR name LIKE '%DISPATCH%' 
            OR name LIKE '%INVENTORY%' 
            OR name LIKE '%ORDER%'
            LIMIT 10
        `);

        for (const perm of perms) {
            await connection.execute(
                'INSERT IGNORE INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
                [roleId, perm.id]
            );
            console.log(`✅ Added: ${perm.name}`);
        }

        // Step 3: Create user
        console.log('\n3. Creating shorya user...');
        
        await connection.execute(`
            INSERT INTO users (name, email, password, role_id, is_active) 
            VALUES ('Shorya Test', 'shorya@company.com', 'shorya123', ?, 1)
            ON DUPLICATE KEY UPDATE role_id = ?, is_active = 1
        `, [roleId, roleId]);

        console.log('✅ User created/updated: shorya@company.com / shorya123');

        // Step 4: Verify
        console.log('\n4. Verification...');
        const [userCheck] = await connection.execute(`
            SELECT u.name, u.email, r.name as role_name, COUNT(rp.permission_id) as perm_count
            FROM users u 
            JOIN roles r ON u.role_id = r.id 
            LEFT JOIN role_permissions rp ON r.id = rp.role_id 
            WHERE u.email = 'shorya@company.com'
            GROUP BY u.id
        `);

        if (userCheck.length > 0) {
            const user = userCheck[0];
            console.log(`✅ User: ${user.name} (${user.email})`);
            console.log(`✅ Role: ${user.role_name}`);
            console.log(`✅ Permissions: ${user.perm_count}`);
        }

        console.log('\n🎉 SHORYA SETUP COMPLETE!');
        console.log('\n📋 TEST INSTRUCTIONS:');
        console.log('1. Go to: https://16.171.197.86.nip.io/login');
        console.log('2. Login: shorya@company.com / shorya123');
        console.log('3. Test dispatch creation and order viewing');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

createShoryaSimple();