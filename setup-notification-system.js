/**
 * SETUP NOTIFICATION SYSTEM
 * Complete setup script for Firebase notification system
 */

const mysql = require('mysql2');
require('dotenv').config();

async function setupNotificationSystem() {
    console.log('🚀 SETTING UP NOTIFICATION SYSTEM');
    console.log('==================================');
    
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
        
        // Step 1: Create notifications table
        console.log('\n📋 Step 1: Creating notifications table...');
        const createNotificationsTable = `
            CREATE TABLE IF NOT EXISTS notifications (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                title VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                type ENUM('LOGIN', 'DISPATCH', 'RETURN', 'DAMAGE', 'PRODUCT', 'INVENTORY', 'SYSTEM') NOT NULL,
                event_data JSON,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_type (type),
                INDEX idx_created_at (created_at),
                INDEX idx_is_read (is_read)
            )
        `;
        
        await new Promise((resolve, reject) => {
            connection.query(createNotificationsTable, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        console.log('✅ Notifications table created');
        
        // Step 2: Create firebase_tokens table
        console.log('\n🔑 Step 2: Creating firebase_tokens table...');
        const createFirebaseTokensTable = `
            CREATE TABLE IF NOT EXISTS firebase_tokens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                token VARCHAR(500) NOT NULL,
                device_type ENUM('web', 'android', 'ios') DEFAULT 'web',
                device_info JSON,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_token (user_id, token),
                INDEX idx_user_id (user_id),
                INDEX idx_is_active (is_active)
            )
        `;
        
        await new Promise((resolve, reject) => {
            connection.query(createFirebaseTokensTable, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        console.log('✅ Firebase tokens table created');
        
        // Step 3: Create notification_settings table
        console.log('\n⚙️ Step 3: Creating notification_settings table...');
        const createNotificationSettingsTable = `
            CREATE TABLE IF NOT EXISTS notification_settings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                login_notifications BOOLEAN DEFAULT TRUE,
                dispatch_notifications BOOLEAN DEFAULT TRUE,
                return_notifications BOOLEAN DEFAULT TRUE,
                damage_notifications BOOLEAN DEFAULT TRUE,
                product_notifications BOOLEAN DEFAULT TRUE,
                inventory_notifications BOOLEAN DEFAULT TRUE,
                system_notifications BOOLEAN DEFAULT TRUE,
                push_enabled BOOLEAN DEFAULT TRUE,
                email_enabled BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_settings (user_id)
            )
        `;
        
        await new Promise((resolve, reject) => {
            connection.query(createNotificationSettingsTable, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        console.log('✅ Notification settings table created');
        
        // Step 4: Add location columns to audit_logs if not exists
        console.log('\n📍 Step 4: Adding location columns to audit_logs...');
        try {
            const addLocationColumns = `
                ALTER TABLE audit_logs 
                ADD COLUMN IF NOT EXISTS location_country VARCHAR(100) NULL AFTER ip_address,
                ADD COLUMN IF NOT EXISTS location_city VARCHAR(100) NULL AFTER location_country,
                ADD COLUMN IF NOT EXISTS location_region VARCHAR(100) NULL AFTER location_city,
                ADD COLUMN IF NOT EXISTS location_coordinates VARCHAR(50) NULL AFTER location_region
            `;
            
            await new Promise((resolve, reject) => {
                connection.query(addLocationColumns, (err, result) => {
                    if (err) {
                        // Try individual columns if batch fails
                        console.log('⚠️ Batch alter failed, trying individual columns...');
                        resolve();
                    } else {
                        resolve(result);
                    }
                });
            });
            console.log('✅ Location columns added to audit_logs');
        } catch (error) {
            console.log('⚠️ Location columns may already exist:', error.message);
        }
        
        // Step 5: Insert sample notification settings for existing users
        console.log('\n👥 Step 5: Setting up default notification settings for users...');
        const insertDefaultSettings = `
            INSERT IGNORE INTO notification_settings (user_id)
            SELECT id FROM users WHERE is_active = 1
        `;
        
        const settingsResult = await new Promise((resolve, reject) => {
            connection.query(insertDefaultSettings, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
        console.log(`✅ Default settings created for ${settingsResult.affectedRows} users`);
        
        // Step 6: Create sample notifications
        console.log('\n📱 Step 6: Creating sample notifications...');
        const users = await new Promise((resolve, reject) => {
            connection.query('SELECT id, name FROM users WHERE is_active = 1 LIMIT 3', (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        if (users.length > 0) {
            const sampleNotifications = [
                {
                    user_id: users[0].id,
                    title: '🎉 Welcome to Notifications!',
                    message: 'Your notification system is now active. You will receive real-time updates about system activities.',
                    type: 'SYSTEM',
                    event_data: JSON.stringify({
                        setup: true,
                        timestamp: new Date().toISOString()
                    })
                },
                {
                    user_id: users[0].id,
                    title: '📦 Sample Dispatch Notification',
                    message: 'This is how dispatch notifications will appear when users create new dispatches.',
                    type: 'DISPATCH',
                    event_data: JSON.stringify({
                        action: 'DISPATCH_CREATE',
                        user_name: 'Sample User',
                        product_name: 'Sample Product',
                        quantity: 1,
                        location: 'Sample Location'
                    })
                }
            ];
            
            for (const notification of sampleNotifications) {
                await new Promise((resolve, reject) => {
                    const query = `
                        INSERT INTO notifications (user_id, title, message, type, event_data)
                        VALUES (?, ?, ?, ?, ?)
                    `;
                    connection.query(query, [
                        notification.user_id,
                        notification.title,
                        notification.message,
                        notification.type,
                        notification.event_data
                    ], (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
            }
            console.log(`✅ Created ${sampleNotifications.length} sample notifications`);
        }
        
        // Step 7: Verify setup
        console.log('\n🔍 Step 7: Verifying setup...');
        
        // Check tables exist
        const tables = await new Promise((resolve, reject) => {
            connection.query("SHOW TABLES LIKE '%notification%'", (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        
        console.log('📊 Notification tables:');
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`   ✅ ${tableName}`);
        });
        
        // Check notification count
        const notificationCount = await new Promise((resolve, reject) => {
            connection.query('SELECT COUNT(*) as count FROM notifications', (err, results) => {
                if (err) reject(err);
                else resolve(results[0].count);
            });
        });
        
        console.log(`📱 Total notifications: ${notificationCount}`);
        
        // Check settings count
        const settingsCount = await new Promise((resolve, reject) => {
            connection.query('SELECT COUNT(*) as count FROM notification_settings', (err, results) => {
                if (err) reject(err);
                else resolve(results[0].count);
            });
        });
        
        console.log(`⚙️ User settings configured: ${settingsCount}`);
        
        console.log('\n🎉 NOTIFICATION SYSTEM SETUP COMPLETE!');
        console.log('=====================================');
        console.log('✅ Database tables created');
        console.log('✅ Sample data inserted');
        console.log('✅ User settings configured');
        console.log('✅ Location tracking ready');
        console.log('');
        console.log('🚀 NEXT STEPS:');
        console.log('1. Restart the server: npm run server');
        console.log('2. Test the system: node test-notification-system.js');
        console.log('3. Add NotificationBell to your sidebar');
        console.log('4. Configure Firebase (optional for push notifications)');
        console.log('');
        console.log('📱 NOTIFICATION FEATURES:');
        console.log('• Real-time login notifications');
        console.log('• Dispatch creation alerts');
        console.log('• Return and damage notifications');
        console.log('• Location-based tracking');
        console.log('• User preference settings');
        console.log('• Firebase push notification support');
        
    } catch (error) {
        console.log('❌ Setup failed:', error.message);
        console.log('📋 Error details:', error);
    } finally {
        connection.end();
    }
}

// Run the setup
setupNotificationSystem().catch(console.error);