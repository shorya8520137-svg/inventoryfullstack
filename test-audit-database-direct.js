/**
 * DIRECT DATABASE AUDIT TEST
 * Tests audit system by directly querying the database
 */

const mysql = require('mysql2/promise');

const dbConfig = {
    host: '127.0.0.1',
    port: 3306,
    user: 'inventory_user',
    password: 'StrongPass@123',
    database: 'inventory_db'
};

async function testAuditDatabase() {
    let connection;
    
    try {
        console.log('🔍 DIRECT DATABASE AUDIT TEST');
        console.log('==============================');
        
        // Connect to database
        console.log('📡 Connecting to database...');
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Database connected');
        
        // Check if audit_logs table exists
        console.log('\n📋 Checking audit_logs table structure...');
        const [tableInfo] = await connection.execute('DESCRIBE audit_logs');
        console.log('✅ audit_logs table structure:');
        tableInfo.forEach(column => {
            console.log(`   ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
        
        // Get recent audit logs
        console.log('\n📊 Fetching recent audit logs...');
        const [logs] = await connection.execute(`
            SELECT al.*, u.name as user_name, u.email as user_email
            FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id
            ORDER BY al.created_at DESC
            LIMIT 10
        `);
        
        console.log(`✅ Found ${logs.length} recent audit logs:`);
        logs.forEach((log, index) => {
            console.log(`\n${index + 1}. ${log.action} ${log.resource} (ID: ${log.id})`);
            console.log(`   User: ${log.user_name || log.user_id || 'Unknown'} (${log.user_email || 'No email'})`);
            console.log(`   IP: ${log.ip_address || 'Unknown'}`);
            console.log(`   Time: ${log.created_at}`);
            console.log(`   Resource ID: ${log.resource_id || 'N/A'}`);
            
            if (log.details) {
                try {
                    const details = JSON.parse(log.details);
                    console.log(`   Details: ${Object.keys(details).join(', ')}`);
                } catch (e) {
                    console.log(`   Details: ${log.details}`);
                }
            }
        });
        
        // Check for specific event types
        console.log('\n📈 Audit log statistics by action:');
        const [actionStats] = await connection.execute(`
            SELECT action, COUNT(*) as count
            FROM audit_logs
            GROUP BY action
            ORDER BY count DESC
        `);
        
        actionStats.forEach(stat => {
            console.log(`   ${stat.action}: ${stat.count} events`);
        });
        
        console.log('\n📈 Audit log statistics by resource:');
        const [resourceStats] = await connection.execute(`
            SELECT resource, COUNT(*) as count
            FROM audit_logs
            GROUP BY resource
            ORDER BY count DESC
        `);
        
        resourceStats.forEach(stat => {
            console.log(`   ${stat.resource}: ${stat.count} events`);
        });
        
        // Check for recent events (last 24 hours)
        console.log('\n⏰ Recent events (last 24 hours):');
        const [recentEvents] = await connection.execute(`
            SELECT action, resource, COUNT(*) as count
            FROM audit_logs
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
            GROUP BY action, resource
            ORDER BY count DESC
        `);
        
        if (recentEvents.length > 0) {
            recentEvents.forEach(event => {
                console.log(`   ${event.action} ${event.resource}: ${event.count} times`);
            });
        } else {
            console.log('   No events in the last 24 hours');
        }
        
        // Test audit log creation
        console.log('\n🧪 Testing audit log creation...');
        const testDetails = {
            test_action: 'direct_database_test',
            timestamp: new Date().toISOString(),
            test_data: 'This is a test audit log entry'
        };
        
        const [insertResult] = await connection.execute(`
            INSERT INTO audit_logs (user_id, action, resource, resource_id, details, ip_address, user_agent, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `, [
            1, // Test user ID
            'TEST',
            'DATABASE',
            'test_123',
            JSON.stringify(testDetails),
            '127.0.0.1',
            'Direct Database Test'
        ]);
        
        console.log(`✅ Test audit log created with ID: ${insertResult.insertId}`);
        
        // Verify the test log was created
        const [testLog] = await connection.execute(`
            SELECT * FROM audit_logs WHERE id = ?
        `, [insertResult.insertId]);
        
        if (testLog.length > 0) {
            console.log('✅ Test audit log verified in database');
            console.log(`   Action: ${testLog[0].action}`);
            console.log(`   Resource: ${testLog[0].resource}`);
            console.log(`   Details: ${testLog[0].details}`);
        }
        
        // Clean up test log
        await connection.execute('DELETE FROM audit_logs WHERE id = ?', [insertResult.insertId]);
        console.log('🧹 Test audit log cleaned up');
        
        console.log('\n🎉 AUDIT DATABASE TEST COMPLETED SUCCESSFULLY');
        
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        if (connection) {
            await connection.end();
            console.log('📡 Database connection closed');
        }
    }
}

// Run the test
testAuditDatabase();