/**
 * RUN LOCATION MIGRATION
 * Adds location tracking columns to audit_logs table
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function runLocationMigration() {
    let connection;
    try {
        console.log('🔄 Connecting to database...');
        
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            port: process.env.DB_PORT || 3306,
            user: 'root', // Using root user with sudo
            password: '', // No password for root with sudo
            database: process.env.DB_NAME || 'inventory_db'
        });

        console.log('✅ Connected to database');

        // Check if columns already exist
        console.log('🔍 Checking existing table structure...');
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'inventory_db' 
            AND TABLE_NAME = 'audit_logs' 
            AND COLUMN_NAME IN ('location_country', 'location_city', 'location_region', 'location_coordinates')
        `);

        if (columns.length > 0) {
            console.log('⚠️ Location columns already exist:', columns.map(c => c.COLUMN_NAME));
            console.log('✅ Migration already completed');
            return;
        }

        console.log('🔄 Adding location columns to audit_logs table...');

        // Add location columns
        await connection.execute(`
            ALTER TABLE audit_logs 
            ADD COLUMN location_country VARCHAR(100) DEFAULT NULL COMMENT 'Country name from IP geolocation',
            ADD COLUMN location_city VARCHAR(100) DEFAULT NULL COMMENT 'City name from IP geolocation',
            ADD COLUMN location_region VARCHAR(100) DEFAULT NULL COMMENT 'Region/State from IP geolocation',
            ADD COLUMN location_coordinates VARCHAR(50) DEFAULT NULL COMMENT 'Latitude,Longitude coordinates'
        `);

        console.log('✅ Location columns added successfully');

        // Add indexes for better performance
        console.log('🔄 Adding indexes for better query performance...');
        
        try {
            await connection.execute(`CREATE INDEX idx_audit_logs_location_country ON audit_logs(location_country)`);
            console.log('✅ Country index created');
        } catch (err) {
            if (err.code === 'ER_DUP_KEYNAME') {
                console.log('⚠️ Country index already exists');
            } else {
                throw err;
            }
        }

        try {
            await connection.execute(`CREATE INDEX idx_audit_logs_location_city ON audit_logs(location_city)`);
            console.log('✅ City index created');
        } catch (err) {
            if (err.code === 'ER_DUP_KEYNAME') {
                console.log('⚠️ City index already exists');
            } else {
                throw err;
            }
        }

        try {
            await connection.execute(`CREATE INDEX idx_audit_logs_ip_location ON audit_logs(ip_address, location_country)`);
            console.log('✅ IP-Location index created');
        } catch (err) {
            if (err.code === 'ER_DUP_KEYNAME') {
                console.log('⚠️ IP-Location index already exists');
            } else {
                throw err;
            }
        }

        // Show updated table structure
        console.log('🔍 Updated table structure:');
        const [tableStructure] = await connection.execute(`DESCRIBE audit_logs`);
        
        console.log('\n📋 AUDIT_LOGS TABLE STRUCTURE:');
        console.log('================================');
        tableStructure.forEach(column => {
            console.log(`${column.Field.padEnd(25)} | ${column.Type.padEnd(20)} | ${column.Null.padEnd(5)} | ${column.Key.padEnd(5)} | ${column.Default || 'NULL'}`);
        });

        console.log('\n🎉 Location tracking migration completed successfully!');
        console.log('📍 The system can now track user locations based on IP addresses');

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run migration
runLocationMigration();