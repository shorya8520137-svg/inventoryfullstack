/**
 * ANALYZE ACTUAL DATABASE STRUCTURE
 * First understand the database, then fix the audit system
 */

const mysql = require('mysql2/promise');

const dbConfig = {
    host: '127.0.0.1',
    port: 3306,
    user: 'inventory_user',
    database: 'inventory_db'
};

console.log('🔍 ANALYZING ACTUAL DATABASE STRUCTURE');
console.log('='.repeat(60));
console.log('🎯 Goal: Understand current audit system and why LOGIN/DISPATCH events are missing');
console.log('='.repeat(60));

async function analyzeDatabase() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database');
        
        // 1. Check audit_logs table structure
        console.log('\n📊 STEP 1: Audit Logs Table Structure');
        console.log('-'.repeat(50));
        
        const [auditStructure] = await connection.execute('DESCRIBE audit_logs');
        console.log('📋 audit_logs table columns:');
        auditStructure.forEach(col => {
            console.log(`   ${col.Field} | ${col.Type} | ${col.Null} | ${col.Default}`);
        });
        
        // 2. Check current audit data
        console.log('\n📊 STEP 2: Current Audit Data Analysis');
        console.log('-'.repeat(50));
        
        const [auditData] = await connection.execute(`
            SELECT id, user_id, action, resource, resource_id, ip_address, user_agent, created_at 
            FROM audit_logs 
            ORDER BY created_at DESC 
            LIMIT 10
        `);
        
        console.log('📋 Recent audit entries:');
        auditData.forEach(row => {
            console.log(`   ID: ${row.id} | User: ${row.user_id} | Action: ${row.action} | Resource: ${row.resource} | IP: ${row.ip_address} | Time: ${row.created_at}`);
        });
        
        // 3. Check what actions/resources exist
        console.log('\n📊 STEP 3: Existing Actions and Resources');
        console.log('-'.repeat(50));
        
        const [actions] = await connection.execute(`
            SELECT DISTINCT action, resource, COUNT(*) as count 
            FROM audit_logs 
            GROUP BY action, resource 
            ORDER BY count DESC
        `);
        
        console.log('📋 Current audit event types:');
        actions.forEach(row => {
            console.log(`   ${row.action} ${row.resource} - ${row.count} entries`);
        });
        
        // 4. Check for LOGIN-related tables
        console.log('\n📊 STEP 4: Looking for Login/Session Tables');
        console.log('-'.repeat(50));
        
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('📋 All database tables:');
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`   ${tableName}`);
        });
        
        // 5. Check users table for login tracking
        console.log('\n📊 STEP 5: Users Table Structure (for login tracking)');
        console.log('-'.repeat(50));
        
        const [usersStructure] = await connection.execute('DESCRIBE users');
        console.log('📋 users table columns:');
        usersStructure.forEach(col => {
            console.log(`   ${col.Field} | ${col.Type} | ${col.Null} | ${col.Default}`);
        });
        
        // 6. Check dispatch tables
        console.log('\n📊 STEP 6: Dispatch Tables (for dispatch tracking)');
        console.log('-'.repeat(50));
        
        try {
            const [dispatchStructure] = await connection.execute('DESCRIBE warehouse_dispatch');
            console.log('📋 warehouse_dispatch table columns:');
            dispatchStructure.forEach(col => {
                console.log(`   ${col.Field} | ${col.Type} | ${col.Null} | ${col.Default}`);
            });
            
            // Check recent dispatches
            const [recentDispatches] = await connection.execute(`
                SELECT id, order_ref, customer, product_name, awb, timestamp 
                FROM warehouse_dispatch 
                ORDER BY timestamp DESC 
                LIMIT 5
            `);
            
            console.log('\n📋 Recent dispatches (should be in audit but missing):');
            recentDispatches.forEach(row => {
                console.log(`   ID: ${row.id} | Order: ${row.order_ref} | Customer: ${row.customer} | Time: ${row.timestamp}`);
            });
            
        } catch (error) {
            console.log('❌ warehouse_dispatch table not found or accessible');
        }
        
        // 7. Find where audit logging is currently implemented
        console.log('\n📊 STEP 7: Current Audit Implementation Analysis');
        console.log('-'.repeat(50));
        
        console.log('🔍 Based on the data, current audit system:');
        console.log('   ✅ Tracks: USER CREATE/UPDATE/DELETE');
        console.log('   ✅ Tracks: ROLE CREATE/UPDATE/DELETE');
        console.log('   ❌ Missing: LOGIN events');
        console.log('   ❌ Missing: DISPATCH events');
        console.log('   ❌ Missing: LOGOUT events');
        console.log('   ❌ Issue: user_id is NULL');
        console.log('   ❌ Issue: ip_address is NULL');
        
        // 8. Check authentication routes
        console.log('\n📊 STEP 8: Authentication System Analysis');
        console.log('-'.repeat(50));
        
        console.log('🔍 Need to check:');
        console.log('   1. Where is login handled? (routes/authRoutes.js?)');
        console.log('   2. Where is dispatch handled? (routes/dispatchRoutes.js?)');
        console.log('   3. Where is current audit logging called from?');
        console.log('   4. Why are only USER/ROLE operations tracked?');
        
        console.log('\n🎯 NEXT STEPS TO FIX:');
        console.log('   1. Find login route and add LOGIN event tracking');
        console.log('   2. Find dispatch route and add DISPATCH event tracking');
        console.log('   3. Fix user_id capture in existing audit system');
        console.log('   4. Fix ip_address capture in existing audit system');
        
    } catch (error) {
        console.error('❌ Database analysis failed:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

analyzeDatabase();