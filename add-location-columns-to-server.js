const mysql = require('mysql2/promise');

async function addLocationColumns() {
    let connection;
    
    try {
        console.log('🔗 Connecting to database...');
        
        // Database connection
        connection = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3306,
            user: 'inventory_user',
            password: 'StrongPass@123',
            database: 'inventory_db'
        });
        
        console.log('✅ Connected to database successfully');
        
        // Check current table structure
        console.log('\n📋 Current audit_logs table structure:');
        const [currentStructure] = await connection.execute('DESCRIBE audit_logs');
        console.table(currentStructure);
        
        // Check if location columns already exist
        const [existingColumns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'inventory_db' 
            AND TABLE_NAME = 'audit_logs' 
            AND COLUMN_NAME IN ('location_country', 'location_city', 'location_region', 'location_coordinates')
        `);
        
        if (existingColumns.length > 0) {
            console.log('\n⚠️  Some location columns already exist:');
            existingColumns.forEach(col => console.log(`   - ${col.COLUMN_NAME}`));
        }
        
        // Add location columns one by one
        const columnsToAdd = [
            { name: 'location_country', type: 'VARCHAR(100) NULL', after: 'ip_address' },
            { name: 'location_city', type: 'VARCHAR(100) NULL', after: 'location_country' },
            { name: 'location_region', type: 'VARCHAR(100) NULL', after: 'location_city' },
            { name: 'location_coordinates', type: 'VARCHAR(50) NULL', after: 'location_region' }
        ];
        
        console.log('\n🔧 Adding location columns...');
        
        for (const column of columnsToAdd) {
            try {
                // Check if column exists
                const [columnExists] = await connection.execute(`
                    SELECT COUNT(*) as count 
                    FROM INFORMATION_SCHEMA.COLUMNS 
                    WHERE TABLE_SCHEMA = 'inventory_db' 
                    AND TABLE_NAME = 'audit_logs' 
                    AND COLUMN_NAME = ?
                `, [column.name]);
                
                if (columnExists[0].count === 0) {
                    const alterQuery = `ALTER TABLE audit_logs ADD COLUMN ${column.name} ${column.type} AFTER ${column.after}`;
                    await connection.execute(alterQuery);
                    console.log(`   ✅ Added column: ${column.name}`);
                } else {
                    console.log(`   ⏭️  Column already exists: ${column.name}`);
                }
            } catch (error) {
                console.log(`   ❌ Error adding column ${column.name}:`, error.message);
            }
        }
        
        // Show updated table structure
        console.log('\n📋 Updated audit_logs table structure:');
        const [updatedStructure] = await connection.execute('DESCRIBE audit_logs');
        console.table(updatedStructure);
        
        // Show sample data
        console.log('\n📊 Sample audit logs with location columns:');
        const [sampleData] = await connection.execute(`
            SELECT id, ip_address, location_country, location_city, location_region, location_coordinates, created_at 
            FROM audit_logs 
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        
        if (sampleData.length > 0) {
            console.table(sampleData);
        } else {
            console.log('   No audit logs found');
        }
        
        console.log('\n🎉 SUCCESS: Location columns have been added to audit_logs table!');
        console.log('\n📝 Next steps:');
        console.log('   1. Restart the server: pm2 restart all');
        console.log('   2. Test the audit logs API');
        console.log('   3. Check frontend location display');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

// Run the script
addLocationColumns();