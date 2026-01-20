const mysql = require('mysql2/promise');

async function addMissingPermission() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'inventory_user',
        password: 'StrongPass@123',
        database: 'inventory_db'
    });

    try {
        console.log('🔧 Adding missing SYSTEM_PERMISSION_MANAGEMENT permission...');
        
        // First check if permission exists
        const [permissions] = await connection.execute(`
            SELECT id FROM permissions WHERE name = 'SYSTEM_PERMISSION_MANAGEMENT'
        `);
        
        let permissionId;
        if (permissions.length === 0) {
            // Create the permission if it doesn't exist
            console.log('Creating SYSTEM_PERMISSION_MANAGEMENT permission...');
            const [result] = await connection.execute(`
                INSERT INTO permissions (name, display_name, category, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, NOW(), NOW())
            `, ['SYSTEM_PERMISSION_MANAGEMENT', 'Permission Management', 'SYSTEM', true]);
            permissionId = result.insertId;
        } else {
            permissionId = permissions[0].id;
        }
        
        console.log('Permission ID:', permissionId);
        
        // Add permission to admin role (role_id = 1)
        await connection.execute(`
            INSERT IGNORE INTO role_permissions (role_id, permission_id)
            VALUES (1, ?)
        `, [permissionId]);
        
        console.log('✅ Permission added to admin role!');
        
        // Verify admin permissions
        const [adminPerms] = await connection.execute(`
            SELECT p.name, p.display_name 
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role_id = 1
            ORDER BY p.name
        `);
        
        console.log('Admin permissions count:', adminPerms.length);
        console.log('Admin permissions:', adminPerms.map(p => p.name));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

addMissingPermission();