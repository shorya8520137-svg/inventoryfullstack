/**
 * ANALYZE NOTIFICATION TABLE STRUCTURE
 * Examines the notification table and related tables
 */

const mysql = require('mysql2');

// Database configuration
const dbConfig = {
    host: '127.0.0.1',
    user: 'inventory_user',
    password: 'StrongPass@123',
    database: 'inventory_db'
};

async function analyzeNotificationTables() {
    const connection = mysql.createConnection(dbConfig);
    
    console.log('🔍 ANALYZING NOTIFICATION TABLE STRUCTURE');
    console.log('==========================================\n');
    
    try {
        // Connect to database
        await new Promise((resolve, reject) => {
            connection.connect((err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        console.log('✅ Connected to database: inventory_db\n');
        
        // 1. Check if notifications table exists
        console.log('1️⃣ CHECKING NOTIFICATIONS TABLE...');
        const tablesQuery = "SHOW TABLES LIKE 'notifications'";
        const tables = await queryDatabase(connection, tablesQuery);
        
        if (tables.length === 0) {
            console.log('❌ notifications table does NOT exist');
            console.log('📝 Need to create notifications table');
        } else {
            console.log('✅ notifications table exists');
            
            // Get table structure
            const structureQuery = "DESCRIBE notifications";
            const structure = await queryDatabase(connection, structureQuery);
            
            console.log('\n📋 NOTIFICATIONS TABLE STRUCTURE:');
            console.log('+-----------------+-------------+------+-----+---------+-------+');
            console.log('| Field           | Type        | Null | Key | Default | Extra |');
            console.log('+-----------------+-------------+------+-----+---------+-------+');
            structure.forEach(row => {
                console.log(`| ${row.Field.padEnd(15)} | ${row.Type.padEnd(11)} | ${row.Null.padEnd(4)} | ${row.Key.padEnd(3)} | ${(row.Default || 'NULL').toString().padEnd(7)} | ${row.Extra.padEnd(5)} |`);
            });
            console.log('+-----------------+-------------+------+-----+---------+-------+');
            
            // Get sample data
            const sampleQuery = "SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5";
            const sampleData = await queryDatabase(connection, sampleQuery);
            
            console.log(`\n📊 SAMPLE DATA (${sampleData.length} records):`);
            if (sampleData.length > 0) {
                sampleData.forEach((row, index) => {
                    console.log(`\n${index + 1}. ID: ${row.id}`);
                    console.log(`   Title: ${row.title}`);
                    console.log(`   Message: ${row.message}`);
                    console.log(`   Type: ${row.type}`);
                    console.log(`   User ID: ${row.user_id}`);
                    console.log(`   Is Read: ${row.is_read}`);
                    console.log(`   Created: ${row.created_at}`);
                });
            } else {
                console.log('   No notification records found');
            }
        }
        
        // 2. Check firebase_tokens table
        console.log('\n\n2️⃣ CHECKING FIREBASE_TOKENS TABLE...');
        const firebaseTablesQuery = "SHOW TABLES LIKE 'firebase_tokens'";
        const firebaseTables = await queryDatabase(connection, firebaseTablesQuery);
        
        if (firebaseTables.length === 0) {
            console.log('❌ firebase_tokens table does NOT exist');
        } else {
            console.log('✅ firebase_tokens table exists');
            
            const firebaseStructure = await queryDatabase(connection, "DESCRIBE firebase_tokens");
            console.log('\n📋 FIREBASE_TOKENS TABLE STRUCTURE:');
            console.log('+-----------------+-------------+------+-----+---------+-------+');
            console.log('| Field           | Type        | Null | Key | Default | Extra |');
            console.log('+-----------------+-------------+------+-----+---------+-------+');
            firebaseStructure.forEach(row => {
                console.log(`| ${row.Field.padEnd(15)} | ${row.Type.padEnd(11)} | ${row.Null.padEnd(4)} | ${row.Key.padEnd(3)} | ${(row.Default || 'NULL').toString().padEnd(7)} | ${row.Extra.padEnd(5)} |`);
            });
            console.log('+-----------------+-------------+------+-----+---------+-------+');
        }
        
        // 3. Check notification_settings table
        console.log('\n\n3️⃣ CHECKING NOTIFICATION_SETTINGS TABLE...');
        const settingsTablesQuery = "SHOW TABLES LIKE 'notification_settings'";
        const settingsTables = await queryDatabase(connection, settingsTablesQuery);
        
        if (settingsTables.length === 0) {
            console.log('❌ notification_settings table does NOT exist');
        } else {
            console.log('✅ notification_settings table exists');
            
            const settingsStructure = await queryDatabase(connection, "DESCRIBE notification_settings");
            console.log('\n📋 NOTIFICATION_SETTINGS TABLE STRUCTURE:');
            console.log('+-----------------+-------------+------+-----+---------+-------+');
            console.log('| Field           | Type        | Null | Key | Default | Extra |');
            console.log('+-----------------+-------------+------+-----+---------+-------+');
            settingsStructure.forEach(row => {
                console.log(`| ${row.Field.padEnd(15)} | ${row.Type.padEnd(11)} | ${row.Null.padEnd(4)} | ${row.Key.padEnd(3)} | ${(row.Default || 'NULL').toString().padEnd(7)} | ${row.Extra.padEnd(5)} |`);
            });
            console.log('+-----------------+-------------+------+-----+---------+-------+');
        }
        
        // 4. Check notification_preferences table
        console.log('\n\n4️⃣ CHECKING NOTIFICATION_PREFERENCES TABLE...');
        const preferencesTablesQuery = "SHOW TABLES LIKE 'notification_preferences'";
        const preferencesTables = await queryDatabase(connection, preferencesTablesQuery);
        
        if (preferencesTables.length === 0) {
            console.log('❌ notification_preferences table does NOT exist');
        } else {
            console.log('✅ notification_preferences table exists');
        }
        
        // 5. Get total counts
        console.log('\n\n5️⃣ NOTIFICATION STATISTICS:');
        if (tables.length > 0) {
            const totalQuery = "SELECT COUNT(*) as total FROM notifications";
            const totalResult = await queryDatabase(connection, totalQuery);
            console.log(`📊 Total notifications: ${totalResult[0].total}`);
            
            const unreadQuery = "SELECT COUNT(*) as unread FROM notifications WHERE is_read = 0";
            const unreadResult = await queryDatabase(connection, unreadQuery);
            console.log(`📬 Unread notifications: ${unreadResult[0].unread}`);
            
            const typeQuery = "SELECT type, COUNT(*) as count FROM notifications GROUP BY type";
            const typeResult = await queryDatabase(connection, typeQuery);
            console.log('\n📈 Notifications by type:');
            typeResult.forEach(row => {
                console.log(`   ${row.type}: ${row.count}`);
            });
        }
        
        console.log('\n🎉 NOTIFICATION TABLE ANALYSIS COMPLETE!');
        
    } catch (error) {
        console.error('❌ Analysis error:', error);
    } finally {
        connection.end();
    }
}

function queryDatabase(connection, query) {
    return new Promise((resolve, reject) => {
        connection.query(query, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

// Run the analysis
if (require.main === module) {
    analyzeNotificationTables();
}

module.exports = { analyzeNotificationTables };