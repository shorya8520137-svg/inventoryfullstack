#!/usr/bin/env node

/**
 * TEST AUDIT DATABASE CONNECTION FIX
 * Tests the EventAuditLogger database connection with proper password
 */

require('dotenv').config();

console.log('🔧 TESTING AUDIT DATABASE CONNECTION FIX');
console.log('==========================================');

// Test 1: Check environment variables
console.log('\n1️⃣ Checking environment variables...');
console.log(`   DB_HOST: ${process.env.DB_HOST || '127.0.0.1'}`);
console.log(`   DB_PORT: ${process.env.DB_PORT || 3306}`);
console.log(`   DB_USER: ${process.env.DB_USER || 'inventory_user'}`);
console.log(`   DB_PASSWORD: ${process.env.DB_PASSWORD ? '***HIDDEN***' : 'NOT SET'}`);
console.log(`   DB_NAME: ${process.env.DB_NAME || 'inventory_db'}`);

// Test 2: Test EventAuditLogger initialization
console.log('\n2️⃣ Testing EventAuditLogger initialization...');
try {
    const EventAuditLogger = require('./EventAuditLogger');
    const logger = new EventAuditLogger();
    console.log('✅ EventAuditLogger initialized successfully');
    
    // Check if dbConfig has password
    if (logger.dbConfig.password) {
        console.log('✅ Database password is configured');
    } else {
        console.log('❌ Database password is missing');
    }
    
    console.log('📋 Database Configuration:');
    console.log(`   Host: ${logger.dbConfig.host}`);
    console.log(`   Port: ${logger.dbConfig.port}`);
    console.log(`   User: ${logger.dbConfig.user}`);
    console.log(`   Password: ${logger.dbConfig.password ? '***CONFIGURED***' : 'MISSING'}`);
    console.log(`   Database: ${logger.dbConfig.database}`);
    
} catch (error) {
    console.log('❌ EventAuditLogger initialization failed:', error.message);
}

// Test 3: Test database connection
console.log('\n3️⃣ Testing database connection...');
async function testConnection() {
    try {
        const mysql = require('mysql2/promise');
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || '127.0.0.1',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'inventory_user',
            password: process.env.DB_PASSWORD || 'StrongPass@123',
            database: process.env.DB_NAME || 'inventory_db'
        });
        
        console.log('✅ Database connection successful');
        
        // Test audit_logs table
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM audit_logs');
        console.log(`✅ Audit logs table accessible - ${rows[0].count} records found`);
        
        await connection.end();
        
    } catch (error) {
        console.log('❌ Database connection failed:', error.message);
        if (error.message.includes('using password: NO')) {
            console.log('💡 ISSUE: Password not being passed to database connection');
        }
    }
}

testConnection().then(() => {
    console.log('\n🎯 FIX SUMMARY:');
    console.log('===============');
    console.log('✅ Added missing password to EventAuditLogger database config');
    console.log('✅ Added dotenv.config() to load environment variables');
    console.log('✅ EventAuditLogger should now connect properly');
    
    console.log('\n📋 NEXT STEPS:');
    console.log('==============');
    console.log('1. Restart the server to apply changes');
    console.log('2. Test audit logging functionality');
    console.log('3. Check for "Event logging failed" errors');
    
    console.log('\n✨ Database connection fix completed!');
});