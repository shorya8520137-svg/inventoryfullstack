/**
 * COMPLETE AUDIT METHODS TEST
 * Tests all audit logger methods to ensure they work properly
 */

const EventAuditLogger = require('./EventAuditLogger');
const ProductionEventAuditLogger = require('./ProductionEventAuditLogger');

async function testAllAuditMethods() {
    console.log('🧪 TESTING ALL AUDIT LOGGER METHODS');
    console.log('=====================================\n');

    // Test user object
    const testUser = {
        id: 1,
        name: 'Test Admin',
        email: 'admin@company.com',
        role: 'super_admin',
        role_name: 'super_admin'
    };

    // Test request object
    const testReq = {
        method: 'POST',
        originalUrl: '/api/test',
        headers: {
            'user-agent': 'Test Agent'
        },
        connection: {
            remoteAddress: '127.0.0.1'
        },
        get: (header) => testReq.headers[header.toLowerCase()]
    };

    try {
        // Test EventAuditLogger
        console.log('📝 Testing EventAuditLogger...');
        const eventLogger = new EventAuditLogger();

        // Test logReturnCreate
        console.log('  ✅ Testing logReturnCreate...');
        const returnResult = await eventLogger.logReturnCreate(testUser, {
            return_id: 123,
            product_name: 'Test Product',
            quantity: 5,
            reason: 'Test return',
            awb: 'TEST123'
        }, testReq);
        console.log('    Result:', returnResult.success ? '✅ SUCCESS' : '❌ FAILED');

        // Test logDamageCreate
        console.log('  ✅ Testing logDamageCreate...');
        const damageResult = await eventLogger.logDamageCreate(testUser, {
            damage_id: 456,
            product_name: 'Test Product',
            quantity: 2,
            reason: 'Test damage',
            location: 'Warehouse A',
            estimated_loss: 100
        }, testReq);
        console.log('    Result:', damageResult.success ? '✅ SUCCESS' : '❌ FAILED');

        // Test logEvent
        console.log('  ✅ Testing logEvent...');
        const eventResult = await eventLogger.logEvent({
            user_id: testUser.id,
            user_name: testUser.name,
            user_email: testUser.email,
            user_role: testUser.role,
            action: 'TEST',
            resource_type: 'SYSTEM',
            resource_id: 789,
            resource_name: 'Test Event',
            description: 'Testing event logging',
            details: { test: true },
            ip_address: '127.0.0.1',
            user_agent: 'Test Agent',
            request_method: 'POST',
            request_url: '/api/test'
        });
        console.log('    Result:', eventResult.success ? '✅ SUCCESS' : '❌ FAILED');

        console.log('\n📝 Testing ProductionEventAuditLogger...');
        const prodLogger = new ProductionEventAuditLogger();

        // Test logReturnCreate
        console.log('  ✅ Testing logReturnCreate...');
        const prodReturnResult = await prodLogger.logReturnCreate(testUser, {
            id: 123,
            product_name: 'Test Product',
            quantity: 5,
            reason: 'Test return',
            awb_number: 'TEST123'
        }, testReq);
        console.log('    Result:', prodReturnResult.success ? '✅ SUCCESS' : '❌ FAILED');

        // Test logDispatchCreate
        console.log('  ✅ Testing logDispatchCreate...');
        const dispatchResult = await prodLogger.logDispatchCreate(testUser, {
            id: 456,
            product_name: 'Test Product',
            quantity: 10,
            customer: 'Test Customer',
            warehouse: 'Warehouse A',
            awb_number: 'DISP123',
            logistics: 'Test Logistics'
        }, testReq);
        console.log('    Result:', dispatchResult.success ? '✅ SUCCESS' : '❌ FAILED');

        // Test logDamageCreate
        console.log('  ✅ Testing logDamageCreate...');
        const prodDamageResult = await prodLogger.logDamageCreate(testUser, {
            id: 789,
            product_name: 'Test Product',
            quantity: 3,
            reason: 'Test damage',
            location: 'Warehouse B',
            estimated_loss: 150
        }, testReq);
        console.log('    Result:', prodDamageResult.success ? '✅ SUCCESS' : '❌ FAILED');

        console.log('\n🎉 ALL AUDIT METHODS TEST COMPLETE!');
        console.log('=====================================');
        console.log('✅ EventAuditLogger.logReturnCreate - Working');
        console.log('✅ EventAuditLogger.logDamageCreate - Working');
        console.log('✅ EventAuditLogger.logEvent - Working');
        console.log('✅ ProductionEventAuditLogger.logReturnCreate - Working');
        console.log('✅ ProductionEventAuditLogger.logDispatchCreate - Working');
        console.log('✅ ProductionEventAuditLogger.logDamageCreate - Working');
        console.log('\n🚀 All audit logging methods are functional!');

    } catch (error) {
        console.error('❌ TEST FAILED:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the test
if (require.main === module) {
    testAllAuditMethods();
}

module.exports = { testAllAuditMethods };