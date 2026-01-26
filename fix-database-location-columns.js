/**
 * FIX DATABASE LOCATION COLUMNS
 * Adds the missing location columns to the audit_logs table
 */

const mysql = require('mysql2');
require('dotenv').config();

async function fixDatabaseLocationColumns() {
    console.log('🔧 FIXING DATABASE LOCATION COLUMNS');
    console.log('===================================');
    
    const connection = mysql.createConnection({
        host: process.env.DB_HOST || '127.0.0.1',
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'inventory_user',
        password: process.env.DB_PASSWORD || 'StrongPass@123',
        database: process.env.DB_NAME || 'inventory_db'
    });
    
    try {
        console.log('🔗 Connecting to database...');
        await new Promise((resolve, reject) => {
            connection.connect((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        console.log('✅ Connected to database');
        
        // Check current table structure
        console.log('\n📋 Checking current audit_logs table structure...');
        const currentStructure = await new Promise((resolve, reject) => {
            connection.query('DESCRIBE audit_logs', (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        const hasLocationColumns = currentStructure.some(col => col.Field === 'location_country');
        
        if (hasLocationColumns) {
            console.log('✅ Location columns already exist!');
            console.log('📊 Current columns:');
            currentStructure.forEach(col => {
                if (col.Field.startsWith('location_')) {
                    console.log(`   - ${col.Field}: ${col.Type}`);
                }
            });
        } else {
            console.log('❌ Location columns missing. Adding them now...');
            
            // Add location columns
            const alterQueries = [
                'ALTER TABLE audit_logs ADD COLUMN location_country VARCHAR(100) NULL AFTER ip_address',
                'ALTER TABLE audit_logs ADD COLUMN location_city VARCHAR(100) NULL AFTER location_country',
                'ALTER TABLE audit_logs ADD COLUMN location_region VARCHAR(100) NULL AFTER location_city',
                'ALTER TABLE audit_logs ADD COLUMN location_coordinates VARCHAR(50) NULL AFTER location_region'
            ];
            
            for (const query of alterQueries) {
                console.log(`🔧 Executing: ${query}`);
                await new Promise((resolve, reject) => {
                    connection.query(query, (err, results) => {
                        if (err) reject(err);
                        else resolve(results);
                    });
                });
            }
            
            console.log('✅ Location columns added successfully!');
        }
        
        // Verify the updated structure
        console.log('\n📊 Updated table structure:');
        const updatedStructure = await new Promise((resolve, reject) => {
            connection.query('DESCRIBE audit_logs', (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        updatedStructure.forEach(col => {
            if (col.Field.includes('location') || col.Field === 'ip_address') {
                console.log(`   ✅ ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
            }
        });
        
        // Show sample data
        console.log('\n📋 Sample audit logs with location columns:');
        const sampleData = await new Promise((resolve, reject) => {
            connection.query(`
                SELECT id, ip_address, location_country, location_city, location_region, 
                       location_coordinates, created_at 
                FROM audit_logs 
                ORDER BY created_at DESC 
                LIMIT 5
            `, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        sampleData.forEach(row => {
            console.log(`   📋 ID ${row.id}: IP=${row.ip_address || 'NULL'}, Location=${row.location_country || 'NULL'}`);
        });
        
        console.log('\n🎉 DATABASE SCHEMA UPDATE COMPLETE!');
        console.log('✅ The audit_logs table now has location columns');
        console.log('🚀 The server can now store location data properly');
        console.log('');
        console.log('🧪 Next steps:');
        console.log('1. Test the API: node test-location-api-response.js');
        console.log('2. Check location tracking: node test-complete-location-system.js');
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        console.log('');
        console.log('💡 Possible solutions:');
        console.log('1. Check database connection settings');
        console.log('2. Verify database credentials in .env file');
        console.log('3. Ensure MySQL server is running');
        console.log('4. Run manually: mysql -u inventory_user -p inventory_db < add-location-columns-to-audit-logs.sql');
    } finally {
        connection.end();
    }
}

// Run the fix
fixDatabaseLocationColumns().catch(console.error);