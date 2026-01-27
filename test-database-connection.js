/**
 * TEST DATABASE CONNECTION
 * Try different connection methods to find working credentials
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnections() {
    const connectionConfigs = [
        {
            name: 'Root without password',
            config: {
                host: '127.0.0.1',
                port: 3306,
                user: 'root',
                password: '',
                database: 'inventory_db'
            }
        },
        {
            name: 'Root with common passwords',
            config: {
                host: '127.0.0.1',
                port: 3306,
                user: 'root',
                password: 'root',
                database: 'inventory_db'
            }
        },
        {
            name: 'inventory_user from env',
            config: {
                host: process.env.DB_HOST || '127.0.0.1',
                port: process.env.DB_PORT || 3306,
                user: process.env.DB_USER || 'inventory_user',
                password: process.env.DB_PASSWORD || 'StrongPass@123',
                database: process.env.DB_NAME || 'inventory_db'
            }
        }
    ];

    for (const { name, config } of connectionConfigs) {
        let connection;
        try {
            console.log(`\n🔄 Testing: ${name}`);
            console.log(`   Host: ${config.host}:${config.port}`);
            console.log(`   User: ${config.user}`);
            console.log(`   Database: ${config.database}`);
            
            connection = await mysql.createConnection(config);
            console.log(`✅ ${name} - CONNECTION SUCCESSFUL!`);
            
            // Test a simple query
            const [rows] = await connection.execute('SELECT COUNT(*) as count FROM audit_logs');
            console.log(`   📊 Found ${rows[0].count} audit log entries`);
            
            // Check if location columns exist
            const [columns] = await connection.execute(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = '${config.database}' 
                AND TABLE_NAME = 'audit_logs' 
                AND COLUMN_NAME IN ('location_country', 'location_city', 'location_region', 'location_coordinates')
            `);
            
            if (columns.length > 0) {
                console.log(`   📍 Location columns already exist: ${columns.map(c => c.COLUMN_NAME).join(', ')}`);
            } else {
                console.log(`   ⚠️ Location columns not found - migration needed`);
            }
            
            return { success: true, config, name };
            
        } catch (error) {
            console.log(`❌ ${name} - FAILED: ${error.message}`);
        } finally {
            if (connection) {
                await connection.end();
            }
        }
    }
    
    return { success: false };
}

// Run test
testConnections().then(result => {
    if (result.success) {
        console.log(`\n🎉 Found working connection: ${result.name}`);
        console.log('✅ You can use this configuration for the migration');
    } else {
        console.log('\n❌ No working database connection found');
        console.log('💡 Please check your MySQL server and credentials');
    }
});