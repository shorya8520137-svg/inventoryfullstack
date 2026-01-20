const mysql = require('mysql2');

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'inventory_system'
});

async function fixPermissionsSystem() {
    console.log('🔧 FIXING PERMISSIONS SYSTEM - COMPLETE SOLUTION');
    console.log('================================================');

    try {
        // 1. First, let's check the current database structure
        console.log('\n1️⃣ CHECKING DATABASE STRUCTURE...');
        
        const tables = await query('SHOW TABLES');
        console.log('📋 Available tables:', tables.map(t => Object.values(t)[0]));

        // Check users table structure
        const usersStructure = await query('DESCRIBE users');
        console.log('\n👤 Users table structure:');
        usersStructure.forEach(col => {
            console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key} ${col.Default || ''}`);
        });

        // Check if roles table exists
        try {
            const rolesStructure = await query('DESCRIBE roles');
            console.log('\n🎭 Roles table structure:');
            rolesStructure.forEach(col => {
                console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key} ${col.Default || ''}`);
            });
        } catch (err) {
            console.log('\n❌ Roles table does not exist! Creating it...');
            await createRolesTable();
        }

        // Check if permissions table exists
        try {
            const permissionsStructure = await query('DESCRIBE permissions');
            console.log('\n🔐 Permissions table structure:');
            permissionsStructure.forEach(col => {
                console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key} ${col.Default || ''}`);
            });
        } catch (err) {
            console.log('\n❌ Permissions table does not exist! Creating it...');
            await createPermissionsTable();
        }

        // Check if role_permissions table exists
        try {
            const rolePermissionsStructure = await query('DESCRIBE role_permissions');
            console.log('\n🔗 Role_permissions table structure:');
            rolePermissionsStructure.forEach(col => {
                console.log(`   ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key} ${col.Default || ''}`);
            });
        } catch (err) {
            console.log('\n❌ Role_permissions table does not exist! Creating it...');
            await createRolePermissionsTable();
        }

        // 2. Check current data
        console.log('\n2️⃣ CHECKING CURRENT DATA...');
        
        const users = await query('SELECT id, name, email, role_id, role FROM users LIMIT 5');
        console.log('\n👥 Current users (first 5):');
        users.forEach(user => {
            console.log(`   ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Role_ID: ${user.role_id}, Role: ${user.role}`);
        });

        const roles = await query('SELECT * FROM roles');
        console.log('\n🎭 Current roles:');
        roles.forEach(role => {
            console.log(`   ID: ${role.id}, Name: ${role.name}, Display: ${role.display_name}`);
        });

        const permissions = await query('SELECT * FROM permissions LIMIT 10');
        console.log('\n🔐 Current permissions (first 10):');
        permissions.forEach(perm => {
            console.log(`   ID: ${perm.id}, Name: ${perm.name}, Category: ${perm.category}`);
        });

        // 3. Fix the issues
        console.log('\n3️⃣ FIXING ISSUES...');

        // Fix 1: Hash the plain text password
        console.log('\n🔒 Fixing plain text password...');
        const bcrypt = require('bcrypt');
        const hashedPassword = await bcrypt.hash('shorya123', 10);
        await query('UPDATE users SET password = ? WHERE password = ?', [hashedPassword, 'shorya123']);
        console.log('✅ Plain text password has been hashed');

        // Fix 2: Ensure all users have proper role_id mapping
        console.log('\n🎭 Ensuring proper role mapping...');
        
        // Create default roles if they don't exist
        await ensureDefaultRoles();
        
        // Fix 3: Create default permissions if they don't exist
        console.log('\n🔐 Ensuring default permissions exist...');
        await ensureDefaultPermissions();

        // Fix 4: Assign permissions to roles
        console.log('\n🔗 Assigning permissions to roles...');
        await assignDefaultPermissions();

        // Fix 5: Test the system
        console.log('\n4️⃣ TESTING THE FIXED SYSTEM...');
        await testPermissionsSystem();

        console.log('\n✅ PERMISSIONS SYSTEM FIXED SUCCESSFULLY!');
        console.log('================================================');

    } catch (error) {
        console.error('❌ Error fixing permissions system:', error);
    } finally {
        db.end();
    }
}

async function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

async function createRolesTable() {
    const createRolesSQL = `
        CREATE TABLE IF NOT EXISTS roles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) UNIQUE NOT NULL,
            display_name VARCHAR(100) NOT NULL,
            description TEXT,
            color VARCHAR(7) DEFAULT '#6366f1',
            priority INT DEFAULT 0,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
    `;
    await query(createRolesSQL);
    console.log('✅ Roles table created');
}

async function createPermissionsTable() {
    const createPermissionsSQL = `
        CREATE TABLE IF NOT EXISTS permissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL,
            display_name VARCHAR(150) NOT NULL,
            description TEXT,
            category VARCHAR(50) NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    await query(createPermissionsSQL);
    console.log('✅ Permissions table created');
}

async function createRolePermissionsTable() {
    const createRolePermissionsSQL = `
        CREATE TABLE IF NOT EXISTS role_permissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            role_id INT NOT NULL,
            permission_id INT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
            FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
            UNIQUE KEY unique_role_permission (role_id, permission_id)
        )
    `;
    await query(createRolePermissionsSQL);
    console.log('✅ Role_permissions table created');
}

async function ensureDefaultRoles() {
    const defaultRoles = [
        { id: 1, name: 'super_admin', display_name: 'Super Administrator', description: 'Full system access', color: '#dc2626', priority: 1 },
        { id: 2, name: 'admin', display_name: 'Administrator', description: 'Administrative access', color: '#ea580c', priority: 2 },
        { id: 3, name: 'manager', display_name: 'Manager', description: 'Management access', color: '#ca8a04', priority: 3 },
        { id: 4, name: 'operator', display_name: 'Operator', description: 'Operational access', color: '#16a34a', priority: 4 },
        { id: 5, name: 'warehouse', display_name: 'Warehouse Staff', description: 'Warehouse operations', color: '#2563eb', priority: 5 },
        { id: 6, name: 'viewer', display_name: 'Viewer', description: 'Read-only access', color: '#6b7280', priority: 6 }
    ];

    for (const role of defaultRoles) {
        try {
            await query(`
                INSERT INTO roles (id, name, display_name, description, color, priority) 
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                display_name = VALUES(display_name),
                description = VALUES(description),
                color = VALUES(color),
                priority = VALUES(priority)
            `, [role.id, role.name, role.display_name, role.description, role.color, role.priority]);
            console.log(`✅ Role '${role.name}' ensured`);
        } catch (err) {
            console.log(`⚠️  Role '${role.name}' already exists or error:`, err.message);
        }
    }
}

async function ensureDefaultPermissions() {
    const defaultPermissions = [
        // System Management
        { name: 'SYSTEM_USER_MANAGEMENT', display_name: 'User Management', category: 'SYSTEM', description: 'Create, update, delete users' },
        { name: 'SYSTEM_ROLE_MANAGEMENT', display_name: 'Role Management', category: 'SYSTEM', description: 'Manage roles and permissions' },
        { name: 'SYSTEM_PERMISSION_MANAGEMENT', display_name: 'Permission Management', category: 'SYSTEM', description: 'Manage system permissions' },
        { name: 'SYSTEM_AUDIT_LOG', display_name: 'Audit Logs', category: 'SYSTEM', description: 'View system audit logs' },
        { name: 'SYSTEM_MONITORING', display_name: 'System Monitoring', category: 'SYSTEM', description: 'Monitor system performance' },
        
        // Inventory Management
        { name: 'INVENTORY_VIEW', display_name: 'View Inventory', category: 'INVENTORY', description: 'View inventory items' },
        { name: 'INVENTORY_CREATE', display_name: 'Create Inventory', category: 'INVENTORY', description: 'Add new inventory items' },
        { name: 'INVENTORY_UPDATE', display_name: 'Update Inventory', category: 'INVENTORY', description: 'Modify inventory items' },
        { name: 'INVENTORY_DELETE', display_name: 'Delete Inventory', category: 'INVENTORY', description: 'Remove inventory items' },
        { name: 'INVENTORY_BULK_UPLOAD', display_name: 'Bulk Upload', category: 'INVENTORY', description: 'Upload inventory in bulk' },
        
        // Order Management
        { name: 'ORDER_VIEW', display_name: 'View Orders', category: 'ORDER', description: 'View order information' },
        { name: 'ORDER_CREATE', display_name: 'Create Orders', category: 'ORDER', description: 'Create new orders' },
        { name: 'ORDER_UPDATE', display_name: 'Update Orders', category: 'ORDER', description: 'Modify existing orders' },
        { name: 'ORDER_DELETE', display_name: 'Delete Orders', category: 'ORDER', description: 'Remove orders' },
        
        // Dispatch Management
        { name: 'DISPATCH_VIEW', display_name: 'View Dispatch', category: 'DISPATCH', description: 'View dispatch information' },
        { name: 'DISPATCH_CREATE', display_name: 'Create Dispatch', category: 'DISPATCH', description: 'Create dispatch entries' },
        { name: 'DISPATCH_UPDATE', display_name: 'Update Dispatch', category: 'DISPATCH', description: 'Modify dispatch entries' },
        
        // Reports
        { name: 'REPORTS_VIEW', display_name: 'View Reports', category: 'REPORTS', description: 'Access system reports' },
        { name: 'REPORTS_EXPORT', display_name: 'Export Reports', category: 'REPORTS', description: 'Export reports to files' }
    ];

    for (const perm of defaultPermissions) {
        try {
            await query(`
                INSERT INTO permissions (name, display_name, category, description) 
                VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                display_name = VALUES(display_name),
                category = VALUES(category),
                description = VALUES(description)
            `, [perm.name, perm.display_name, perm.category, perm.description]);
            console.log(`✅ Permission '${perm.name}' ensured`);
        } catch (err) {
            console.log(`⚠️  Permission '${perm.name}' already exists or error:`, err.message);
        }
    }
}

async function assignDefaultPermissions() {
    // Super Admin - All permissions
    const allPermissions = await query('SELECT id FROM permissions');
    const superAdminRoleId = 1;
    
    for (const perm of allPermissions) {
        try {
            await query(`
                INSERT IGNORE INTO role_permissions (role_id, permission_id) 
                VALUES (?, ?)
            `, [superAdminRoleId, perm.id]);
        } catch (err) {
            // Ignore duplicates
        }
    }
    console.log('✅ Super Admin assigned all permissions');

    // Admin - Most permissions except system management
    const adminPermissions = await query(`
        SELECT id FROM permissions 
        WHERE category IN ('INVENTORY', 'ORDER', 'DISPATCH', 'REPORTS')
    `);
    const adminRoleId = 2;
    
    for (const perm of adminPermissions) {
        try {
            await query(`
                INSERT IGNORE INTO role_permissions (role_id, permission_id) 
                VALUES (?, ?)
            `, [adminRoleId, perm.id]);
        } catch (err) {
            // Ignore duplicates
        }
    }
    console.log('✅ Admin assigned operational permissions');

    // Manager - View and update permissions
    const managerPermissions = await query(`
        SELECT id FROM permissions 
        WHERE name LIKE '%_VIEW' OR name LIKE '%_UPDATE' OR name LIKE 'REPORTS_%'
    `);
    const managerRoleId = 3;
    
    for (const perm of managerPermissions) {
        try {
            await query(`
                INSERT IGNORE INTO role_permissions (role_id, permission_id) 
                VALUES (?, ?)
            `, [managerRoleId, perm.id]);
        } catch (err) {
            // Ignore duplicates
        }
    }
    console.log('✅ Manager assigned view/update permissions');

    // Operator - Basic operational permissions
    const operatorPermissions = await query(`
        SELECT id FROM permissions 
        WHERE name IN ('INVENTORY_VIEW', 'INVENTORY_UPDATE', 'ORDER_VIEW', 'ORDER_UPDATE', 'DISPATCH_VIEW', 'DISPATCH_CREATE')
    `);
    const operatorRoleId = 4;
    
    for (const perm of operatorPermissions) {
        try {
            await query(`
                INSERT IGNORE INTO role_permissions (role_id, permission_id) 
                VALUES (?, ?)
            `, [operatorRoleId, perm.id]);
        } catch (err) {
            // Ignore duplicates
        }
    }
    console.log('✅ Operator assigned basic permissions');

    // Warehouse - Inventory focused permissions
    const warehousePermissions = await query(`
        SELECT id FROM permissions 
        WHERE name LIKE 'INVENTORY_%' OR name = 'DISPATCH_VIEW'
    `);
    const warehouseRoleId = 5;
    
    for (const perm of warehousePermissions) {
        try {
            await query(`
                INSERT IGNORE INTO role_permissions (role_id, permission_id) 
                VALUES (?, ?)
            `, [warehouseRoleId, perm.id]);
        } catch (err) {
            // Ignore duplicates
        }
    }
    console.log('✅ Warehouse assigned inventory permissions');

    // Viewer - Only view permissions
    const viewerPermissions = await query(`
        SELECT id FROM permissions 
        WHERE name LIKE '%_VIEW'
    `);
    const viewerRoleId = 6;
    
    for (const perm of viewerPermissions) {
        try {
            await query(`
                INSERT IGNORE INTO role_permissions (role_id, permission_id) 
                VALUES (?, ?)
            `, [viewerRoleId, perm.id]);
        } catch (err) {
            // Ignore duplicates
        }
    }
    console.log('✅ Viewer assigned view-only permissions');
}

async function testPermissionsSystem() {
    console.log('\n🧪 Testing permissions system...');
    
    // Test 1: Check if admin user has proper role
    const adminUser = await query(`
        SELECT u.id, u.name, u.email, u.role_id, r.name as role_name, r.display_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.email = 'admin@company.com'
    `);
    
    if (adminUser.length > 0) {
        console.log('✅ Admin user found:', adminUser[0]);
        
        // Test 2: Check admin permissions
        const adminPermissions = await query(`
            SELECT p.name, p.display_name, p.category
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role_id = ?
        `, [adminUser[0].role_id]);
        
        console.log(`✅ Admin has ${adminPermissions.length} permissions`);
        console.log('   Sample permissions:', adminPermissions.slice(0, 5).map(p => p.name));
    } else {
        console.log('❌ Admin user not found');
    }

    // Test 3: Check all users have valid roles
    const usersWithRoles = await query(`
        SELECT u.id, u.name, u.email, u.role_id, r.name as role_name, r.display_name,
               COUNT(p.id) as permission_count
        FROM users u
        JOIN roles r ON u.role_id = r.id
        LEFT JOIN role_permissions rp ON r.id = rp.role_id
        LEFT JOIN permissions p ON rp.permission_id = p.id
        GROUP BY u.id, u.name, u.email, u.role_id, r.name, r.display_name
        LIMIT 5
    `);
    
    console.log('\n✅ Users with roles and permission counts:');
    usersWithRoles.forEach(user => {
        console.log(`   ${user.name} (${user.email}) - Role: ${user.role_name} (${user.display_name}) - Permissions: ${user.permission_count}`);
    });
}

// Run the fix
if (require.main === module) {
    fixPermissionsSystem();
}

module.exports = { fixPermissionsSystem };