/**
 * COMPLETE DATABASE STRUCTURE ANALYZER
 * Shows all tables, columns, and relationships in your StockIQ database
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'inventory_user',
    password: process.env.DB_PASSWORD || 'StrongPass@123',
    database: process.env.DB_NAME || 'inventory_db',
    port: process.env.DB_PORT || 3306
};

console.log('🗄️  STOCKIQ COMPLETE DATABASE STRUCTURE');
console.log('='.repeat(80));
console.log(`📊 Database: ${dbConfig.database}`);
console.log(`🏠 Host: ${dbConfig.host}:${dbConfig.port}`);
console.log(`👤 User: ${dbConfig.user}`);
console.log('='.repeat(80));

async function showCompleteDatabase() {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to database successfully\n');
        
        // 1. Show all tables
        console.log('📋 ALL DATABASE TABLES');
        console.log('-'.repeat(50));
        
        const [tables] = await connection.execute(`
            SELECT TABLE_NAME, TABLE_ROWS, DATA_LENGTH, INDEX_LENGTH, CREATE_TIME
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ?
            ORDER BY TABLE_NAME
        `, [dbConfig.database]);
        
        console.log('Table Name'.padEnd(25) + 'Rows'.padEnd(8) + 'Size (KB)'.padEnd(12) + 'Created');
        console.log('-'.repeat(70));
        
        const tableNames = [];
        tables.forEach(table => {
            const sizeKB = Math.round((table.DATA_LENGTH + table.INDEX_LENGTH) / 1024);
            const created = table.CREATE_TIME ? table.CREATE_TIME.toISOString().split('T')[0] : 'Unknown';
            console.log(
                table.TABLE_NAME.padEnd(25) + 
                (table.TABLE_ROWS || 0).toString().padEnd(8) + 
                sizeKB.toString().padEnd(12) + 
                created
            );
            tableNames.push(table.TABLE_NAME);
        });
        
        console.log(`\n📊 Total Tables: ${tables.length}\n`);
        
        // 2. Show detailed structure for each table
        for (const tableName of tableNames) {
            console.log(`🔍 TABLE: ${tableName.toUpperCase()}`);
            console.log('-'.repeat(60));
            
            // Get table structure
            const [columns] = await connection.execute(`DESCRIBE ${tableName}`);
            
            console.log('Column'.padEnd(25) + 'Type'.padEnd(20) + 'Null'.padEnd(8) + 'Key'.padEnd(8) + 'Default');
            console.log('-'.repeat(75));
            
            columns.forEach(col => {
                console.log(
                    col.Field.padEnd(25) + 
                    col.Type.padEnd(20) + 
                    col.Null.padEnd(8) + 
                    (col.Key || '').padEnd(8) + 
                    (col.Default || 'NULL')
                );
            });
            
            // Show sample data (first 3 rows)
            try {
                const [sampleData] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 3`);
                if (sampleData.length > 0) {
                    console.log('\n📄 Sample Data:');
                    console.log(JSON.stringify(sampleData, null, 2));
                }
            } catch (error) {
                console.log('⚠️  Could not fetch sample data');
            }
            
            console.log('\n' + '='.repeat(80) + '\n');
        }
        
        // 3. Show foreign key relationships
        console.log('🔗 FOREIGN KEY RELATIONSHIPS');
        console.log('-'.repeat(50));
        
        const [foreignKeys] = await connection.execute(`
            SELECT 
                TABLE_NAME,
                COLUMN_NAME,
                CONSTRAINT_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM information_schema.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = ? 
            AND REFERENCED_TABLE_NAME IS NOT NULL
            ORDER BY TABLE_NAME, COLUMN_NAME
        `, [dbConfig.database]);
        
        if (foreignKeys.length > 0) {
            console.log('Table'.padEnd(20) + 'Column'.padEnd(20) + 'References'.padEnd(30) + 'Constraint');
            console.log('-'.repeat(90));
            
            foreignKeys.forEach(fk => {
                const reference = `${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`;
                console.log(
                    fk.TABLE_NAME.padEnd(20) + 
                    fk.COLUMN_NAME.padEnd(20) + 
                    reference.padEnd(30) + 
                    fk.CONSTRAINT_NAME
                );
            });
        } else {
            console.log('No foreign key relationships found');
        }
        
        // 4. Show indexes
        console.log('\n📇 DATABASE INDEXES');
        console.log('-'.repeat(50));
        
        const [indexes] = await connection.execute(`
            SELECT 
                TABLE_NAME,
                INDEX_NAME,
                COLUMN_NAME,
                NON_UNIQUE,
                INDEX_TYPE
            FROM information_schema.STATISTICS
            WHERE TABLE_SCHEMA = ?
            ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX
        `, [dbConfig.database]);
        
        if (indexes.length > 0) {
            console.log('Table'.padEnd(20) + 'Index'.padEnd(25) + 'Column'.padEnd(20) + 'Unique'.padEnd(8) + 'Type');
            console.log('-'.repeat(85));
            
            indexes.forEach(idx => {
                const unique = idx.NON_UNIQUE === 0 ? 'YES' : 'NO';
                console.log(
                    idx.TABLE_NAME.padEnd(20) + 
                    idx.INDEX_NAME.padEnd(25) + 
                    idx.COLUMN_NAME.padEnd(20) + 
                    unique.padEnd(8) + 
                    idx.INDEX_TYPE
                );
            });
        }
        
        // 5. Database summary
        console.log('\n📊 DATABASE SUMMARY');
        console.log('-'.repeat(50));
        
        const [dbSize] = await connection.execute(`
            SELECT 
                ROUND(SUM(DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024, 2) AS size_mb,
                COUNT(*) as table_count,
                SUM(TABLE_ROWS) as total_rows
            FROM information_schema.TABLES 
            WHERE TABLE_SCHEMA = ?
        `, [dbConfig.database]);
        
        const summary = dbSize[0];
        console.log(`📊 Total Tables: ${summary.table_count}`);
        console.log(`📊 Total Rows: ${summary.total_rows || 0}`);
        console.log(`📊 Database Size: ${summary.size_mb} MB`);
        
        // 6. Show key tables for StockIQ functionality
        console.log('\n🎯 KEY STOCKIQ TABLES IDENTIFIED');
        console.log('-'.repeat(50));
        
        const keyTables = {
            'Authentication & Users': ['users', 'roles', 'permissions', 'role_permissions', 'user_roles'],
            'Inventory Management': ['products', 'categories', 'inventory_ledger', 'stock_movements'],
            'Orders & Dispatch': ['orders', 'warehouse_dispatch', 'order_items', 'dispatch_tracking'],
            'Audit & Logging': ['audit_logs', 'system_logs', 'activity_logs'],
            'Notifications': ['notifications', 'firebase_tokens', 'notification_settings'],
            '2FA Security': ['two_factor_auth', 'backup_codes'],
            'Location Tracking': ['location_logs', 'ip_geolocation']
        };
        
        Object.entries(keyTables).forEach(([category, tables]) => {
            console.log(`\n📂 ${category}:`);
            tables.forEach(table => {
                const exists = tableNames.includes(table);
                const status = exists ? '✅' : '❌';
                console.log(`   ${status} ${table}`);
            });
        });
        
        console.log('\n' + '='.repeat(80));
        console.log('🎉 DATABASE ANALYSIS COMPLETE!');
        console.log('💡 Use this information to understand your complete database structure');
        console.log('='.repeat(80));
        
    } catch (error) {
        console.error('❌ Database analysis failed:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.error('💡 Connection refused - check if MySQL server is running');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('💡 Access denied - check database credentials');
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            console.error('💡 Database not found - check database name');
        }
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

showCompleteDatabase();