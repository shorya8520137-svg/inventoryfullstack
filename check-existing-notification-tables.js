const mysql = require('mysql2/promise');

async function checkExistingNotificationTables() {
    console.log('🔍 CHECKING EXISTING NOTIFICATION TABLES');
    console.log('========================================');
    
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
        
        // Step 1: Check all tables in database
        console.log('\n📋 Step 1: All tables in database');
        const [allTables] = await connection.execute('SHOW TABLES');
        console.log('Total tables:', allTables.length);
        allTables.forEach((table, index) => {
            const tableName = Object.values(table)[0];
            console.log(`   ${index + 1}. ${tableName}`);
        });
        
        // Step 2: Look for notification-related tables
        console.log('\n🔔 Step 2: Notification-related tables');
        const [notificationTables] = await connection.execute(`
            SHOW TABLES LIKE '%notification%'
        `);
        
        if (notificationTables.length > 0) {
            console.log('Found notification tables:');
            for (const table of notificationTables) {
                const tableName = Object.values(table)[0];
                console.log(`\n📊 Table: ${tableName}`);
                
                // Show table structure
                const [structure] = await connection.execute(`DESCRIBE ${tableName}`);
                console.table(structure);
                
                // Show sample data
                const [sampleData] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 3`);
                if (sampleData.length > 0) {
                    console.log(`\n📄 Sample data from ${tableName}:`);
                    console.table(sampleData);
                } else {
                    console.log(`\n📄 No data in ${tableName}`);
                }
            }
        } else {
            console.log('❌ No notification tables found');
        }
        
        // Step 3: Look for firebase-related tables
        console.log('\n🔥 Step 3: Firebase-related tables');
        const [firebaseTables] = await connection.execute(`
            SHOW TABLES LIKE '%firebase%'
        `);
        
        if (firebaseTables.length > 0) {
            console.log('Found Firebase tables:');
            for (const table of firebaseTables) {
                const tableName = Object.values(table)[0];
                console.log(`\n📊 Table: ${tableName}`);
                
                // Show table structure
                const [structure] = await connection.execute(`DESCRIBE ${tableName}`);
                console.table(structure);
                
                // Show sample data
                const [sampleData] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 3`);
                if (sampleData.length > 0) {
                    console.log(`\n📄 Sample data from ${tableName}:`);
                    console.table(sampleData);
                } else {
                    console.log(`\n📄 No data in ${tableName}`);
                }
            }
        } else {
            console.log('❌ No Firebase tables found');
        }
        
        // Step 4: Look for any other tables that might be used for notifications
        console.log('\n🔍 Step 4: Other potential notification tables');
        const potentialTables = ['messages', 'alerts', 'events', 'logs', 'activity'];
        
        for (const tableName of potentialTables) {
            const [tableExists] = await connection.execute(`
                SELECT COUNT(*) as count 
                FROM information_schema.tables 
                WHERE table_schema = 'inventory_db' 
                AND table_name = ?
            `, [tableName]);
            
            if (tableExists[0].count > 0) {
                console.log(`\n📊 Found table: ${tableName}`);
                
                // Show table structure
                const [structure] = await connection.execute(`DESCRIBE ${tableName}`);
                console.table(structure);
                
                // Show sample data
                const [sampleData] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 3`);
                if (sampleData.length > 0) {
                    console.log(`\n📄 Sample data from ${tableName}:`);
                    console.table(sampleData);
                } else {
                    console.log(`\n📄 No data in ${tableName}`);
                }
            }
        }
        
        // Step 5: Check audit_logs table structure (for location columns)
        console.log('\n📋 Step 5: Audit logs table structure');
        try {
            const [auditStructure] = await connection.execute('DESCRIBE audit_logs');
            console.table(auditStructure);
            
            // Check if location columns exist
            const locationColumns = auditStructure.filter(col => 
                col.Field.includes('location')
            );
            
            if (locationColumns.length > 0) {
                console.log('\n📍 Location columns found in audit_logs:');
                locationColumns.forEach(col => {
                    console.log(`   ✅ ${col.Field} (${col.Type})`);
                });
            } else {
                console.log('\n⚠️  No location columns found in audit_logs');
            }
            
        } catch (error) {
            console.log('❌ Error checking audit_logs:', error.message);
        }
        
        // Step 6: Summary and recommendations
        console.log('\n📝 SUMMARY AND RECOMMENDATIONS');
        console.log('==============================');
        
        const hasNotificationTables = notificationTables.length > 0;
        const hasFirebaseTables = firebaseTables.length > 0;
        
        if (hasNotificationTables) {
            console.log('✅ Notification system tables already exist');
            console.log('💡 Recommendation: Use existing tables and adapt the code');
        } else {
            console.log('❌ No notification tables found');
            console.log('💡 Recommendation: Create new notification tables');
        }
        
        if (hasFirebaseTables) {
            console.log('✅ Firebase tables already exist');
        } else {
            console.log('❌ No Firebase tables found');
            console.log('💡 Recommendation: Create Firebase token tables');
        }
        
        console.log('\n🚀 NEXT STEPS:');
        if (hasNotificationTables) {
            console.log('1. Analyze existing notification table structure');
            console.log('2. Adapt FirebaseNotificationService to use existing tables');
            console.log('3. Update notification controller to match existing schema');
            console.log('4. Test with existing data');
        } else {
            console.log('1. Create notification system tables');
            console.log('2. Run setup-notification-system.js');
            console.log('3. Test notification system');
            console.log('4. Integrate with frontend');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 Possible solutions:');
        console.log('1. Check database connection settings');
        console.log('2. Verify database credentials');
        console.log('3. Ensure MySQL server is running');
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

// Run the analysis
checkExistingNotificationTables();