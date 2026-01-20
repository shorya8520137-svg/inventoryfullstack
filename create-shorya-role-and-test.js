const mysql = require('mysql2/promise');
const axios = require('axios');
const https = require('https');

// Ignore SSL certificate errors for testing
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

const API_BASE = 'https://16.171.197.86.nip.io';

async function createShoryaRoleAndTest() {
    console.log('🚀 Creating Shorya Role and Testing Complete Workflow...\n');

    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        user: 'inventory_user',
        password: 'StrongPass@123',
        database: 'inventory_db'
    });

    try {
        // Step 1: Create the "shorya_final_test" role
        console.log('1. Creating "shorya_final_test" role...');
        
        // Check if role already exists
        const [existingRoles] = await connection.execute(
            'SELECT id FROM roles WHERE name = ?',
            ['shorya_final_test']
        );

        let roleId;
        if (existingRoles.length > 0) {
            roleId = existingRoles[0].id;
            console.log('✅ Role already exists with ID:', roleId);
        } else {
            const [roleResult] = await connection.execute(`
                INSERT INTO roles (name, display_name, description, color, is_active) 
                VALUES (?, ?, ?, ?, ?)
            `, ['shorya_final_test', 'Shorya Final Test', 'Test role for dispatch and order viewing', '#4F46E5', 1]);
            
            roleId = roleResult.insertId;
            console.log('✅ Created new role with ID:', roleId);
        }

        // Step 2: Find and assign specific permissions
        console.log('\n2. Assigning specific permissions...');
        
        const requiredPermissions = [
            'DISPATCH_CREATE',
            'DISPATCH_VIEW', 
            'INVENTORY_VIEW',
            'ORDER_VIEW',
            'ORDER_TRACKING_VIEW'
        ];

        // Clear existing permissions for this role
        await connection.execute('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);

        let assignedCount = 0;
        for (const permName of requiredPermissions) {
            const [perms] = await connection.execute(
                'SELECT id FROM permissions WHERE name = ? OR name LIKE ?',
                [permName, `%${permName.split('_')[0]}%`]
            );
            
            if (perms.length > 0) {
                await connection.execute(
                    'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
                    [roleId, perms[0].id]
                );
                console.log(`✅ Assigned permission: ${permName}`);
                assignedCount++;
            } else {
                console.log(`⚠️  Permission not found: ${permName}`);
            }
        }

        console.log(`✅ Assigned ${assignedCount} permissions to shorya_final_test role`);

        // Step 3: Create or update user "shorya"
        console.log('\n3. Creating/updating user "shorya"...');
        
        const [existingUsers] = await connection.execute(
            'SELECT id FROM users WHERE email = ?',
            ['shorya@company.com']
        );

        let userId;
        if (existingUsers.length > 0) {
            userId = existingUsers[0].id;
            // Update existing user
            await connection.execute(
                'UPDATE users SET role_id = ?, is_active = 1 WHERE id = ?',
                [roleId, userId]
            );
            console.log('✅ Updated existing user shorya with new role');
        } else {
            // Create new user
            const [userResult] = await connection.execute(`
                INSERT INTO users (name, email, password, role_id, is_active) 
                VALUES (?, ?, ?, ?, ?)
            `, ['Shorya Test User', 'shorya@company.com', 'shorya123', roleId, 1]);
            
            userId = userResult.insertId;
            console.log('✅ Created new user shorya with ID:', userId);
        }

        console.log('\n4. Testing the complete workflow...');

        // Step 4: Test login with shorya user
        console.log('\n   4a. Testing login...');
        const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
            email: 'shorya@company.com',
            password: 'shorya123'
        }, { httpsAgent });

        if (!loginResponse.data.success) {
            console.error('❌ Login failed:', loginResponse.data.message);
            return;
        }

        const token = loginResponse.data.token;
        const user = loginResponse.data.user;
        console.log('✅ Login successful');
        console.log(`   User: ${user.name} (${user.email})`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Permissions: ${user.permissions.length} permissions`);
        console.log(`   Permissions: ${user.permissions.join(', ')}`);

        // Step 5: Test inventory view access
        console.log('\n   4b. Testing inventory view access...');
        try {
            const inventoryResponse = await axios.get(`${API_BASE}/api/inventory`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                httpsAgent
            });
            console.log('✅ Inventory access: SUCCESS');
            console.log(`   Found ${inventoryResponse.data.data?.length || 0} inventory items`);
        } catch (error) {
            console.log('❌ Inventory access: FAILED -', error.response?.data?.message || error.message);
        }

        // Step 6: Test dispatch creation
        console.log('\n   4c. Testing dispatch creation...');
        try {
            const dispatchData = {
                customer_name: 'Test Customer for Shorya',
                customer_phone: '9876543210',
                customer_address: 'Test Address',
                warehouse_id: 1,
                products: [
                    {
                        product_id: 1,
                        quantity: 5,
                        unit_price: 100
                    }
                ]
            };

            const dispatchResponse = await axios.post(`${API_BASE}/api/dispatch`, dispatchData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                httpsAgent
            });
            
            console.log('✅ Dispatch creation: SUCCESS');
            console.log(`   Dispatch ID: ${dispatchResponse.data.data?.dispatch_id || 'N/A'}`);
        } catch (error) {
            console.log('❌ Dispatch creation: FAILED -', error.response?.data?.message || error.message);
        }

        // Step 7: Test order tracking view
        console.log('\n   4d. Testing order tracking view...');
        try {
            const orderResponse = await axios.get(`${API_BASE}/api/order-tracking`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                httpsAgent
            });
            console.log('✅ Order tracking access: SUCCESS');
            console.log(`   Found ${orderResponse.data.data?.length || 0} orders`);
        } catch (error) {
            console.log('❌ Order tracking access: FAILED -', error.response?.data?.message || error.message);
        }

        console.log('\n🎉 SHORYA ROLE TEST COMPLETE!');
        console.log('\n📋 MANUAL TESTING INSTRUCTIONS:');
        console.log('1. Go to: https://16.171.197.86.nip.io/login');
        console.log('2. Login with: shorya@company.com / shorya123');
        console.log('3. Navigate to Dispatch tab and create a dispatch');
        console.log('4. Navigate to Orders tab and view orders');
        console.log('5. Verify you can see inventory but cannot manage users/roles');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

createShoryaRoleAndTest();