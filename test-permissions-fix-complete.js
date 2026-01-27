// COMPREHENSIVE PERMISSIONS FIX TEST
// Tests both database permissions and frontend behavior

require('dotenv').config();
const mysql = require('mysql2');
const https = require('https');

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'inventory_user',
    password: process.env.DB_PASSWORD || 'StrongPass@123',
    database: process.env.DB_NAME || 'inventory_db'
});

const API_BASE = 'https://16.171.197.86.nip.io';

const TEST_USERS = {
    admin: {
        email: 'admin@company.com',
        password: 'admin@123',
        expectedPermissions: ['products.view', 'inventory.view', 'orders.view']
    },
    thems: {
        email: 'thems@company.com',
        password: 'gfx998sd',
        expectedPermissions: [] // Will be determined by database
    }
};

async function runCompleteTest() {
    console.log('🧪 COMPREHENSIVE PERMISSIONS FIX TEST');
    console.log('=====================================');
    
    try {
        // 1. Test Database Permissions
        console.log('\n1️⃣ TESTING DATABASE PERMISSIONS');
        console.log('================================');
        await testDatabasePermissions();
        
        // 2. Test API Authentication & Authorization
        console.log('\n2️⃣ TESTING API AUTHENTICATION & AUTHORIZATION');
        console.log('==============================================');
        await testAPIPermissions();
        
        // 3. Generate Frontend Test Instructions
        console.log('\n3️⃣ FRONTEND TEST INSTRUCTIONS');
        console.log('==============================');
        generateFrontendTestInstructions();
        
    } catch (error) {
        console.error('❌ Test error:', error);
    } finally {
        db.end();
    }
}

async function testDatabasePermissions() {
    for (const [userType, userData] of Object.entries(TEST_USERS)) {
        console.log(`\n🔍 Testing ${userType.toUpperCase()} user database permissions`);
        
        // Get user details
        const userQuery = `
            SELECT u.id, u.name, u.email, u.role_id, u.role,
                   r.name as role_name, r.display_name as role_display_name
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.email = ?
        `;
        
        const users = await query(userQuery, [userData.email]);
        
        if (users.length === 0) {
            console.log(`❌ User ${userData.email} not found`);
            continue;
        }
        
        const user = users[0];
        console.log(`✅ Found: ${user.name} (Role: ${user.role_name || user.role})`);
        
        // Get user permissions
        const permissionsQuery = `
            SELECT p.name, p.display_name, p.category
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            WHERE rp.role_id = ?
            ORDER BY p.category, p.name
        `;
        
        const permissions = await query(permissionsQuery, [user.role_id]);
        console.log(`   Permissions (${permissions.length}):`);
        
        const permissionNames = permissions.map(p => p.name);
        permissions.fo