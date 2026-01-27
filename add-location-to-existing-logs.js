/**
 * ADD LOCATION TO EXISTING AUDIT LOGS
 * This script will add location data to existing audit logs so you can see location immediately
 */

const mysql = require('mysql2/promise');
const IPGeolocationTracker = require('./IPGeolocationTracker');
require('dotenv').config();

async function addLocationToExistingLogs() {
    console.log('🌍 ADDING LOCATION TO EXISTING AUDIT LOGS');
    console.log('==========================================');
    
    let connection;
    const geoTracker = new IPGeolocationTracker();
    
    try {
        // Try different connection methods
        const connectionConfigs = [
            {
                name: 'inventory_user',
                config: {
                    host: '127.0.0.1',
                    port: 3306,
                    user: 'inventory_user',
                    password: 'StrongPass@123',
                    database: 'inventory_db'
                }
            },
            {
                name: 'root',
                config: {
                    host: '127.0.0.1',
                    port: 3306,
                    user: 'root',
                    password: '',
                    database: 'inventory_db'
                }
            }
        ];
        
        for (const { name, config } of connectionConfigs) {
            try {
                console.log(`🔄 Trying connection with ${name}...`);
                connection = await mysql.createConnection(config);
                console.log(`✅ Connected successfully with ${name}`);
                break;
            } catch (error) {
                console.log(`❌ ${name} failed: ${error.message}`);
            }
        }
        
        if (!connection) {
            console.log('❌ Could not connect to database');
            console.log('💡 Please run this script with proper database access');
            return;
        }
        
        // First, check if location columns exist
        console.log('\n🔍 Checking database structure...');
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'inventory_db' 
            AND TABLE_NAME = 'audit_logs' 
            AND COLUMN_NAME IN ('location_country', 'location_city', 'location_region', 'location_coordinates')
        `);
        
        if (columns.length === 0) {
            console.log('⚠️ Location columns not found. Adding them now...');
            
            await connection.execute(`
                ALTER TABLE audit_logs 
                ADD COLUMN location_country VARCHAR(100) DEFAULT NULL,
                ADD COLUMN location_city VARCHAR(100) DEFAULT NULL,
                ADD COLUMN location_region VARCHAR(100) DEFAULT NULL,
                ADD COLUMN location_coordinates VARCHAR(50) DEFAULT NULL
            `);
            
            console.log('✅ Location columns added successfully');
        } else {
            console.log(`✅ Found ${columns.length} location columns`);
        }
        
        // Get existing audit logs without location data
        console.log('\n📋 Fetching existing audit logs...');
        const [logs] = await connection.execute(`
            SELECT id, ip_address, details 
            FROM audit_logs 
            WHERE ip_address IS NOT NULL 
            AND (location_country IS NULL OR location_country = '')
            ORDER BY created_at DESC 
            LIMIT 20
        `);
        
        console.log(`📊 Found ${logs.length} logs without location data`);
        
        if (logs.length === 0) {
            console.log('✅ All logs already have location data!');
            return;
        }
        
        // Process each log
        for (const log of logs) {
            console.log(`\n🔄 Processing log ID ${log.id} with IP ${log.ip_address}`);
            
            try {
                // Get location data for this IP
                const locationData = await geoTracker.getLocationData(log.ip_address);
                
                // Update the database record
                await connection.execute(`
                    UPDATE audit_logs 
                    SET location_country = ?, 
                        location_city = ?, 
                        location_region = ?, 
                        location_coordinates = ?
                    WHERE id = ?
                `, [
                    locationData.country || null,
                    locationData.city || null,
                    locationData.region || null,
                    `${locationData.latitude || 0},${locationData.longitude || 0}`,
                    log.id
                ]);
                
                // Also update the details JSON to include location
                let details;
                try {
                    details = log.details ? JSON.parse(log.details) : {};
                } catch {
                    details = {};
                }
                
                details.location = {
                    country: locationData.country,
                    city: locationData.city,
                    region: locationData.region,
                    address: locationData.address,
                    flag: locationData.flag,
                    coordinates: `${locationData.latitude},${locationData.longitude}`,
                    timezone: locationData.timezone,
                    isp: locationData.isp
                };
                
                await connection.execute(`
                    UPDATE audit_logs 
                    SET details = ?
                    WHERE id = ?
                `, [JSON.stringify(details), log.id]);
                
                console.log(`✅ Updated log ${log.id}: ${locationData.flag} ${locationData.city}, ${locationData.country}`);
                
                // Small delay to avoid overwhelming the APIs
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                console.log(`❌ Error processing log ${log.id}: ${error.message}`);
            }
        }
        
        console.log('\n🎉 LOCATION UPDATE COMPLETED!');
        console.log('=============================');
        
        // Verify the updates
        const [updatedLogs] = await connection.execute(`
            SELECT id, ip_address, location_country, location_city, location_region
            FROM audit_logs 
            WHERE location_country IS NOT NULL
            ORDER BY created_at DESC 
            LIMIT 10
        `);
        
        console.log(`\n✅ Verification: ${updatedLogs.length} logs now have location data:`);
        updatedLogs.forEach(log => {
            console.log(`   ID ${log.id}: ${log.ip_address} → ${log.location_city}, ${log.location_country}`);
        });
        
        console.log('\n🚀 NEXT STEPS:');
        console.log('1. Refresh your audit logs page');
        console.log('2. You should now see location badges: 🇮🇳 Gurugram, India');
        console.log('3. Location details will appear in the expanded sections');
        
    } catch (error) {
        console.error('❌ Script failed:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run the script
addLocationToExistingLogs().catch(console.error);