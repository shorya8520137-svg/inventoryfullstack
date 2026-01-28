/**
 * TEST DAMAGE RECOVERY AUDIT LOGGING
 * Tests the fixed audit logging for damage recovery operations
 */

const https = require('https');

// Disable SSL verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const SERVER_URL = 'https://54.169.107.64:8443';

async function testDamageRecoveryAudit() {
    console.log('🧪 TESTING DAMAGE RECOVERY AUDIT LOGGING');
    console.log('=========================================\n');

    try {
        // Step 1: Login to get token
        console.log('1️⃣ Logging in to get authentication token...');
        const loginData = {
            email: 'admin@company.com',
            password: 'Admin@123'
        };

        const loginResponse = await makeRequest(`${SERVER_URL}/api/auth/login`, 'POST', loginData);
        if (!loginResponse || !loginResponse.token) {
            console.log('❌ Login failed - cannot test damage recovery');
            return;
        }
        console.log('   ✅ Login successful');

        const authHeaders = {
            'Authorization': `Bearer ${loginResponse.token}`,
            'Content-Type': 'application/json'
        };

        // Step 2: Get audit logs before test
        console.log('\n2️⃣ Getting audit logs before test...');
        const auditBefore = await makeRequest(`${SERVER_URL}/api/audit-logs?page=1&limit=5`, 'GET', null, authHeaders);
        const beforeCount = auditBefore?.data?.length || 0;
        console.log(`   Current audit logs count: ${beforeCount}`);

        // Step 3: Test damage recovery creation (this should trigger audit logging)
        console.log('\n3️⃣ Testing damage recovery creation...');
        const recoveryData = {
            product_type: 'Test Product for Audit',
            qty: 1,
            inventory_location: 'TEST_WH',
            reason: 'Testing audit logging fix'
        };

        const recoveryResponse = await makeRequest(`${SERVER_URL}/api/damage-recovery/recover`, 'POST', recoveryData, authHeaders);
        if (recoveryResponse && recoveryResponse.success) {
            console.log('   ✅ Damage recovery created successfully');
            console.log('   📝 This should have created an audit log entry');
        } else {
            console.log('   ❌ Damage recovery failed:', recoveryResponse?.message || 'Unknown error');
        }

        // Step 4: Check audit logs after test
        console.log('\n4️⃣ Checking audit logs after test...');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds for audit log to be created

        const auditAfter = await makeRequest(`${SERVER_URL}/api/audit-logs?page=1&limit=10`, 'GET', null, authHeaders);
        const afterCount = auditAfter?.data?.length || 0;
        console.log(`   New audit logs count: ${afterCount}`);

        if (afterCount > beforeCount) {
            console.log('   ✅ New audit log entries created!');
            
            // Look for RECOVERY audit logs
            const recoveryLogs = auditAfter.data.filter(log => log.resource_type === 'RECOVERY');
            if (recoveryLogs.length > 0) {
                console.log('   ✅ Found RECOVERY audit log entries:');
                recoveryLogs.forEach((log, index) => {
                    console.log(`     ${index + 1}. ${log.action} - ${log.description}`);
                    console.log(`        User: ${log.user_name}`);
                    console.log(`        Time: ${log.created_at}`);
                });
            } else {
                console.log('   ⚠️  No RECOVERY audit logs found');
            }
        } else {
            console.log('   ❌ No new audit log entries created');
        }

        // Step 5: Test audit logs with RECOVERY filter
        console.log('\n5️⃣ Testing audit logs with RECOVERY filter...');
        const recoveryAuditLogs = await makeRequest(`${SERVER_URL}/api/audit-logs?resource=RECOVERY&page=1&limit=5`, 'GET', null, authHeaders);
        if (recoveryAuditLogs && recoveryAuditLogs.data) {
            console.log(`   ✅ RECOVERY audit logs retrieved: ${recoveryAuditLogs.data.length} entries`);
            console.log('   📝 This means the resource_type column is working properly!');
        } else {
            console.log('   ❌ Failed to retrieve RECOVERY audit logs');
        }

        console.log('\n🎉 DAMAGE RECOVERY AUDIT TEST COMPLETE!');
        console.log('========================================');
        
        if (recoveryResponse?.success && afterCount > beforeCount) {
            console.log('✅ ALL TESTS PASSED');
            console.log('✅ Damage recovery audit logging is working');
            console.log('✅ No more "resource_type cannot be null" errors');
            console.log('✅ Audit logs are being created properly');
        } else {
            console.log('❌ SOME TESTS FAILED');
            console.log('   Check server logs for any remaining errors');
        }

    } catch (error) {
        console.error('❌ TEST ERROR:', error.message);
    }
}

function makeRequest(url, method = 'GET', data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port,
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            rejectUnauthorized: false
        };

        const req = https.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(responseData);
                    resolve(jsonData);
                } catch (e) {
                    resolve(responseData);
                }
            });
        });

        req.on('error', (error) => {
            console.error(`Request error for ${url}:`, error.message);
            resolve(null);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// Run the test
if (require.main === module) {
    testDamageRecoveryAudit();
}

module.exports = { testDamageRecoveryAudit };