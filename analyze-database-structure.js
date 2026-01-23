/**
 * Database Structure Analysis Script
 * Connects to the production database to understand all tables and relationships
 * This will help us build a proper audit logging system with real data
 */

const mysql = require('mysql2/promise');

// Database connection configuration
const dbConfig = {
    host: '16.171.5.50',
    user: 'root', // Assuming root user, adjust if different
    password: '', // Will need the actual password
    database: 'inventory_system' // Assuming database name, adjust if different
};

async function analyzeDatabase() {
    let connection;
    
    try {
        console.log('🔍 Connecting to database at 16.171.5.50...\n');
        
        // First, let's try to connect and see what databases exist
        connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });
        
        console.log('✅ Connected to MySQL server\n');
        
        // Show all databases
        console.log('📊 Available Databases:');
        const [databases] = await connection.execute('SHOW DATABASES');
        databases.forEach(db => {
            console.log(`  - ${db.Database}`);
        });
        
        // Try to use the inventory database (common names)
        const possibleDbNames = ['inventory_system', 'inventory', 'stockiq', 'warehouse', 'stock_management'];
        let selectedDb = null;
        
        for (const dbName of possibleDbNames) {
            try {
                await connection.execute(`USE ${dbName}`);
                selectedDb = dbName;
                console.log(`\n✅ Using database: ${dbName}\n`);
                break;
            } catch (err) {
                // Database doesn't exist, try next
            }
        }
        
        if (!selectedDb) {
            console.log('\n❌ Could not find inventory database. Please specify the correct database name.');
            return;
        }
        
        // Get all tables
        console.log('📋 Database Tables:');
        const [tables] = await connection.execute('SHOW TABLES');
        
        for (const table of tables) {
            const tableName = table[`Tables_in_${selectedDb}`];
            console.log(`\n🔸 Table: ${tableName}`);
            
            // Get table structure
            const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
            console.log('   Columns:');
            columns.forEach(col => {
                console.log(`     - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? `[${col.Key}]` : ''}`);
            });
            
            // Get row count
            const [count] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
            console.log(`   Rows: ${count[0].count}`);
            
            // Show sample data (first 3 rows)
            if (count[0].count > 0) {
                const [sampleData] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 3`);
                console.log('   Sample Data:');
                sampleData.forEach((row, index) => {
                    console.log(`     Row ${index + 1}:`, JSON.stringify(row, null, 2));
                });
            }
        }
        
        // Look for existing audit/log tables
        console.log('\n🔍 Looking for existing audit/log tables...');
        const auditTables = tables.filter(table => {
            const tableName = table[`Tables_in_${selectedDb}`].toLowerCase();
            return tableName.includes('audit') || tableName.includes('log') || tableName.includes('activity') || tableName.includes('history');
        });
        
        if (auditTables.length > 0) {
            console.log('📝 Found existing audit/log tables:');
            auditTables.forEach(table => {
                console.log(`  - ${table[`Tables_in_${selectedDb}`]}`);
            });
        } else {
            console.log('❌ No existing audit/log tables found');
        }
        
        // Look for user-related tables
        console.log('\n👥 User Management Tables:');
        const userTables = tables.filter(table => {
            const tableName = table[`Tables_in_${selectedDb}`].toLowerCase();
            return tableName.includes('user') || tableName.includes('role') || tableName.includes('permission');
        });
        
        userTables.forEach(table => {
            console.log(`  - ${table[`Tables_in_${selectedDb}`]}`);
        });
        
        // Look for business operation tables
        console.log('\n📦 Business Operation Tables:');
        const businessTables = tables.filter(table => {
            const tableName = table[`Tables_in_${selectedDb}`].toLowerCase();
            return tableName.includes('dispatch') || tableName.includes('return') || tableName.includes('damage') || 
                   tableName.includes('product') || tableName.includes('inventory') || tableName.includes('order') ||
                   tableName.includes('transfer') || tableName.includes('bulk');
        });
        
        businessTables.forEach(table => {
            console.log(`  - ${table[`Tables_in_${selectedDb}`]}`);
        });
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        console.log('\n💡 Common issues:');
        console.log('1. Check if MySQL is running on 16.171.5.50');
        console.log('2. Verify database credentials');
        console.log('3. Check firewall settings');
        console.log('4. Ensure database name is correct');
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the analysis
analyzeDatabase();