/**
 * Find Existing Audit Table on Server
 * This script should be run on your server to find the current audit system
 */

const mysql = require('mysql2/promise');

console.log('🔍 Finding Existing Audit Table Structure');
console.log('='.repeat(60));

async function findAuditTable() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        port: 3306,
        user: 'inventory_user',
        password: process.env.DB_PASSWORD || 'your_password_here',
        database: 'inventory_db'
    });

    try {
        console.log('✅ Connected to inventory_db');
        
        // 1. Search for the exact audit entries we see in UI
        console.log('\n🎯 Searching for "Created user jiffy" entry...');
        
        const [allTables] = await connection.execute('SHOW TABLES');
        let auditTableFound = false;
        
        for (const tableRow of allTables) {
            const tableName = Object.values(tableRow)[0];
            
            try {
                // Look for the specific entries we see in the UI
                const [results] = await connection.execute(`
                    SELECT * FROM ${tableName} 
                    WHERE description LIKE '%Created user%' 
                       OR description LIKE '%Deleted role%'
                       OR action LIKE '%CREATE%'
                       OR action LIKE '%DELETE%'
                    LIMIT 5
                `);
                
                if (results.length > 0) {
                    console.log(`\n🎯 FOUND AUDIT TABLE: ${tableName}`);
                    auditTableFound = true;
                    
                    // Show table structure
                    console.log('\n📊 Table Structure:');
                    const [structure] = await connection.execute(`DESCRIBE ${tableName}`);
                    structure.forEach(col => {
                        console.log(`  ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(Required)' : '(Optional)'}`);
                    });
                    
                    // Show sample data
                    console.log('\n📋 Sample Audit Records:');
                    results.forEach((record, i) => {
                        console.log(`\n  Record ${i + 1}:`);
                        Object.entries(record).forEach(([key, value]) => {
                            console.log(`    ${key}: ${value}`);
                        });
                    });
                    
                    // Show recent records
                    console.log('\n📅 Recent Records:');
                    const [recent] = await connection.execute(`
                        SELECT * FROM ${tableName} 
                        ORDER BY created_at DESC 
                        LIMIT 10
                    `);
                    
                    recent.forEach((record, i) => {
                        const description = record.description || record.action || record.activity || 'No description';
                        const time = record.created_at || record.timestamp || record.date || 'No time';
                        console.log(`    ${i + 1}. ${description} (${time})`);
                    });
                    
                    break;
                }
            } catch (err) {
                // Skip tables we can't query
            }
        }
        
        if (!auditTableFound) {
            console.log('\n❌ Could not find existing audit table');
            console.log('📋 All tables in database:');
            allTables.forEach(table => {
                console.log(`  - ${Object.values(table)[0]}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await connection.end();
    }
}

// Instructions for running on server
console.log('📋 INSTRUCTIONS:');
console.log('1. Upload this file to your server');
console.log('2. SSH to server: ssh -i "C:\\Users\\Admin\\awsconection.pem" ubuntu@16.171.5.50');
console.log('3. cd /home/ubuntu/inventoryfullstack');
console.log('4. node find-existing-audit-table.js');
console.log('');
console.log('This will show us:');
console.log('- Which table stores your current audit logs');
console.log('- The exact structure of that table');
console.log('- How to add dispatch events to the same table');
console.log('='.repeat(60));

// Only run if we're on the server (has proper database access)
if (process.env.NODE_ENV === 'production' || process.argv.includes('--run')) {
    findAuditTable().catch(console.error);
}