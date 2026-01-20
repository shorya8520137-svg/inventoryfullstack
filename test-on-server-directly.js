// RUN THIS DIRECTLY ON YOUR SERVER - NO NETWORK CALLS
// Test admin vs thems user permissions locally

require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'inventory_user',
    password: process.env.DB_PASSWORD || 'StrongPass@123',
    database: process.env.DB_NAME || 'inventory_db'
});

async function testUsersDirectly() {
    console.log('🧪 TESTING USERS DIRECTLY ON SERVER');
    console.log('===================================');

    try {
        // Test 1: Check admin user
        console.log('\n1️⃣ CHECKING ADMIN USER');
        console.log('======================');
        await checkUser('admin@company.com', 'ADMIN');

        // Test 2: Check thems user  
        console.log('\n2️⃣ CHECKING THEMS USER');
        console.log('======================');
        await checkUser('thems@company.com', 'THEMS');

        // Test 3: Check permissions system
        console.log('\n3️⃣ CHECKING PERMISSIONS SYSTEM');
        console.log('==============================');
        await checkPermissionsSystem();

    } catch (error) {
        console.error('❌ Test error:', error);
    } finally {
        db.end();
    }
}

async function checkUser(email, userType) {
    try {
        // Get user details with role and permissions
        const userQuery = `
            SELECT 
                u.id, u.name, u.email, u.role_id, u.role,
                r.name as role_name, r.display_name,
                COUNT(rp.permission_id) as permission_count
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            LEFT JOIN role_permissions rp ON r.id = rp.role_id
            WHERE u.email = ?
            GROUP BY u.id, u.name, u.email, u.role_id, u.role, r.name, r.display_name
        `;

        const users = await query(userQuery, [email]);
        
        if (users.length === 0) {
            console.log(`❌ ${userType} user not found: ${email}`);
            return;
        }

        const user = users[0];
        console.log(`✅ ${userType} user found:`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role ID: ${user.role_id}`);
        console.log(`   Role Column: ${user.role}`);
        console.log(`   Role Name: ${user.role_name || 'NULL'}`);
        console.log(`   Display Name: ${user.display_name || 'NULL'}`);
        console.log(`   Permission Count: ${user.permission_count}`);

        // Check specific permissions for this user
        if (user.role_id) {
            const permissionsQuery = `
                SELECT p.name, p.display_name, p.category
                FROM permissions p
                JOIN role_permissions rp ON p.id = rp.permission_id
                WHERE rp.role_id = ?
                ORDER BY p.category, p.name
                LIMIT 5
            `;
            
            const permissions = await query(permissionsQuery, [user.role_id]);
            
            if (permissions.length > 0) {
                console.log(`   Sample Permissions:`);
                permissions.forEach(perm => {
                    console.log(`     - ${perm.name} (${perm.display_name})`);
                });
            } else {
                console.log(`   ❌ NO PERMISSIONS FOUND FOR ROLE ${user.role_id}`);
            }
        }

        // Identify the issue
        if (user.permission_count === 0) {
            console.log(`   🚫 ISSUE: ${userType} has ZERO permissions!`);
            if (!user.role_name) {
                console.log(`   💡 Problem: role_id ${user.role_id} doesn't exist in roles table`);
            } else {
                console.log(`   💡 Problem: role ${user.role_name} has no permissions assigned`);
            }
        }

    } catch (error) {
        console.log(`❌ Error checking ${userType}:`, error.message);
    }
}

async function checkPermissionsSystem() {
    try {
        // Check if tables exist and have data
        const tables = ['roles', 'permissions', 'role_permissions'];
        
        for (const table of tables) {
            const count = await query(`SELECT COUNT(*) as count FROM ${table}`);
            console.log(`📊 ${table} table: ${count[0].count} records`);
            
            if (count[0].count === 0) {
                console.log(`   ❌ ${table} table is EMPTY!`);
            }
        }

        // Check role-permission mappings
        const mappings = await query(`
            SELECT r.name as role_name, COUNT(rp.permission_id) as perm_count
            FROM roles r
            LEFT JOIN role_permissions rp ON r.id = rp.role_id
            GROUP BY r.id, r.name
            ORDER BY r.id
        `);

        console.log('\n📋 Role-Permission Mappings:');
        mappings.forEach(mapping => {
            console.log(`   ${mapping.role_name}: ${mapping.perm_count} permissions`);
        });

        // Check if permissions match route names
        const routePermissions = [
            'products.view', 'inventory.view', 'operations.return',
            'SYSTEM_USER_MANAGEMENT', 'SYSTEM_ROLE_MANAGEMENT'
        ];

        console.log('\n🔍 Checking route permission names:');
        for (const permName of routePermissions) {
            const exists = await query('SELECT COUNT(*) as count FROM permissions WHERE name = ?', [permName]);
            if (exists[0].count > 0) {
                console.log(`   ✅ ${permName} exists`);
            } else {
                console.log(`   ❌ ${permName} MISSING`);
            }
        }

    } catch (error) {
        console.log('❌ Error checking permissions system:', error.message);
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

// Run the test
if (require.main === module) {
    testUsersDirectly();
}

module.exports = { testUsersDirectly };