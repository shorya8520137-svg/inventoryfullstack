const mysql = require('mysql2/promise');

async function fixAdminPermissions() {
    console.log('🔧 Fixing Admin Permissions...');
    
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'inventory_user',
        password: 'StrongPass@123',
        database: 'inventory_db'
    });

    try {
        // Step 1: Check current admin user
        console.log('\n1. Checking admin user...');
        const [users] = await connection.execute(
            'SELECT id, name, email, role_id FROM users WHERE email = ?',
            ['admin@company.com']
        );
        
        if (users.length === 0) {
            console.log('❌ Admin user not found!');
            return;
        }
        
        const admin = users[0];
        console.log('✅ Admin user found:', admin);

        // Step 2: Check admin role permissions
        console.log('\n2. Checking admin role permissions...');
        const [rolePerms] = await connection.execute(`
            SELECT COUNT(*) as count 
            FROM role_permissions rp 
            WHERE rp.role_id = ?
        `, [admin.role_id]);
        
        console.log(`Admin role has ${rolePerms[0].count} permissions`);

        // Step 3: Check if SYSTEM_USER_MANAGEMENT permission exists
        console.log('\n3. Checking SYSTEM_USER_MANAGEMENT permission...');
        const [perms] = await connection.execute(
            'SELECT id FROM permissions WHERE name = ?',
            ['SYSTEM_USER_MANAGEMENT']
        );
        
        if (perms.length === 0) {
            console.log('❌ SYSTEM_USER_MANAGEMENT permission not found! Creating it...');
            await connection.execute(`
                INSERT INTO permissions (name, display_name, category, is_active) 
                VALUES ('SYSTEM_USER_MANAGEMENT', 'User Management', 'System', 1)
            `);
            console.log('✅ Created SYSTEM_USER_MANAGEMENT permission');
        }

        // Step 4: Grant all permissions to admin role
        console.log('\n4. Granting all permissions to admin role...');
        
        // Get all permission IDs
        const [allPerms] = await connection.execute('SELECT id FROM permissions WHERE is_active = 1');
        
        // Clear existing role permissions
        await connection.execute('DELETE FROM role_permissions WHERE role_id = ?', [admin.role_id]);
        
        // Grant all permissions
        for (const perm of allPerms) {
            await connection.execute(
                'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
                [admin.role_id, perm.id]
            );
        }
        
        console.log(`✅ Granted ${allPerms.length} permissions to admin role`);

        // Step 5: Verify fix
        console.log('\n5. Verifying fix...');
        const [finalCheck] = await connection.execute(`
            SELECT COUNT(*) as count 
            FROM role_permissions rp 
            WHERE rp.role_id = ?
        `, [admin.role_id]);
        
        console.log(`✅ Admin now has ${finalCheck[0].count} permissions`);
        
        console.log('\n🎉 Admin permissions fixed! Try logging in now.');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

fixAdminPermissions();