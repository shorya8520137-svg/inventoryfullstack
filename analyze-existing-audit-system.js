/**
 * Analyze Existing Audit System
 * Understanding the current database structure to integrate properly
 */

const mysql = require('mysql2/promise');

console.log('🔍 Analyzing Existing Audit System');
console.log('='.repeat(60));

async function analyzeAuditSystem() {
    const connection = await mysql.createConnection({
        host: '127.0.0.1',
        port: 3306,
        user: 'inventory_user',
        database: 'inventory_db'
    });

    try {
        console.log('📊 Connected to inventory_db');
        
        // 1. Find existing audit tables
        console.log('\n1. 🔍 Looking for existing audit tables...');
        const [tables] = await connection.execute(`
            SHOW TABLES LIKE '%audit%' OR SHOW TABLES LIKE '%log%' OR SHOW TABLES LIKE '%activity%'
        `);
        
        if (tables.length > 0) {
            console.log('✅ Found existing audit tables:');
            tables.forEach(table => {
                console.log(`  - ${Object.values(table)[0]}`);
            });
        } else {
            console.log('❌ No audit tables found with standard names');
        }

        // 2. Check all tables to find the one storing current audit data
        console.log('\n2. 📋 Checking all tables for audit-like data...');
        const [allTables] = await connection.execute('SHOW TABLES');
        
        for (const tableRow of allTables) {
            const tableName = Object.values(tableRow)[0];
            
            try {
                // Check if table has audit-like columns
                const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
                const columnNames = columns.map(col => col.Field.toLowerCase());
                
                const hasAuditColumns = columnNames.some(col => 
                    col.includes('action') || 
                    col.includes('activity') || 
                    col.includes('event') ||
                    col.includes('created') ||
                    col.includes('user')
                );
                
                if (hasAuditColumns) {
                    console.log(`\n📊 Table: ${tableName}`);
                    console.log('   Columns:', columnNames.join(', '));
                    
                    // Check for recent data
                    const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
                    console.log(`   Records: ${count[0].count}`);
                    
                    // If it has data, show sample
                    if (count[0].count > 0) {
                        const [sample] = await connection.execute(`SELECT * FROM ${tableName} ORDER BY id DESC LIMIT 3`);
                        console.log('   Sample data:');
                        sample.forEach((row, i) => {
                            console.log(`     ${i + 1}. ${JSON.stringify(row)}`);
                        });
                    }
                }
            } catch (err) {
                // Skip tables we can't access
            }
        }

        // 3. Look for the specific audit data we see in the UI
        console.log('\n3. 🎯 Looking for the exact audit data from your UI...');
        
        // Search for tables containing "CREATE USER" or "DELETE ROLE" actions
        for (const tableRow of allTables) {
            const tableName = Object.values(tableRow)[0];
            
            try {
                const [createUserData] = await connection.execute(`
                    SELECT * FROM ${tableName} 
                    WHERE (description LIKE '%Created user%' OR action LIKE '%CREATE%' OR activity LIKE '%user%')
                    LIMIT 5
                `);
                
                if (createUserData.length > 0) {
                    console.log(`\n🎯 FOUND AUDIT DATA in table: ${tableName}`);
                    console.log('Structure:');
                    const [structure] = await connection.execute(`DESCRIBE ${tableName}`);
                    structure.forEach(col => {
                        console.log(`  ${col.Field}: ${col.Type}`);
                    });
                    
                    console.log('\nSample audit records:');
                    createUserData.forEach((record, i) => {
                        console.log(`  ${i + 1}. ${JSON.stringify(record)}`);
                    });
                    break;
                }
            } catch (err) {
                // Skip
            }
        }

    } catch (error) {
        console.error('❌ Database analysis failed:', error.message);
        
        console.log('\n💡 Alternative approach needed:');
        console.log('Since we cannot connect to the database directly, we need to:');
        console.log('1. Check your server for existing audit table structure');
        console.log('2. Find where "Created user jiffy" and "Deleted role" entries are stored');
        console.log('3. Integrate with your existing audit system instead of creating new one');
        
    } finally {
        await connection.end();
    }
}

// Run analysis
analyzeAuditSystem().catch(console.error);

console.log('\n📋 What we need to find:');
console.log('1. 🔍 Which table stores "Created user jiffy" entries');
console.log('2. 📊 What columns exist in that table');
console.log('3. 🔧 How to add DISPATCH events to the same table');
console.log('4. 🎯 Complete user journey tracking in existing system');
console.log('\n💡 Once we find the existing audit table, we can:');
console.log('- Add dispatch events to the same table');
console.log('- Track complete user journey');
console.log('- Show all activities in one place');
console.log('='.repeat(60));