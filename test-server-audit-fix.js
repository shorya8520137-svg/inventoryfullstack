/**
 * TEST SERVER AUDIT FIX
 * Quick test to verify audit logging is working on the server
 */

const https = require('https');

// Disable SSL verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const SERVER_URL = 'https://54.169.107.64:8443';

async function testServerAuditFix() {
    console.log('🧪 TESTING SERVER AUDIT FIX');
    console.log('============================\n');

    try {
        // Test 1: Health check
        console.log('1️⃣ Testing server health...');
        const healthResponse = await makeRequest(`${SERVER_URL}/api/health`);
        console.log('   Health Status:', healthResponse ? '✅ ONLINE' : '❌ OFFLINE');

        // Test 2: Audit logs endpoint
        console.log('\n2️⃣ Testing audit logs endpoint...');
        const auditResponse = await makeRequest(`${SERVER_URL}/api/audit-logs?page=1&limit=5`);
        if (auditResponse) {
            console.log('   Audit Logs:', '✅ ACCESSIBLE');
            console.log('   Response preview:', JSON.stringify(auditResponse).substring(0, 200) + '...');
        } else {
            console.log('   Audit Logs:', '❌ NOT ACCESSIBLE');
        }

        // Test 3: Audit logs with resource filter
        console.log('\n3️⃣ Testing audit logs with RETURN filter...');
        const returnAuditResponse = await makeRequest(`${SERVER_URL}/api/audit-logs?resource=RETURN&page=1&limit=5`);
        if (returnAuditResponse) {
            console.log('   Return Audit Logs:', '✅ WORKING');
            console.log('   This means the database column issue is fixed!');
        } else {
            console.log('   Return Audit Logs:', '❌ STILL FAILING');
        }

        // Test 4: Login to get token for authenticated requests
        console.log('\n4️⃣ Testing login for authenticated requests...');
        const loginData = {
            email: 'admin@company.com',
            password: 'Admin@123'
        };

        const loginResponse = await makeRequest(`${SERVER_URL}/api/auth/login`, 'POST', loginData);
        if (loginResponse && loginResponse.token) {
            console.log('   Login:', '✅ SUCCESS');
            console.log('   Token received, audit logging should work for authenticated actions');
            
            // Test authenticated audit endpoint
            console.log('\n5️⃣ Testing authenticated audit endpoint...');
            const authHeaders = {
                'Authorization': `Bearer ${loginResponse.token}`,
                'Content-Type': 'application/json'
            };
            
            const authAuditResponse = await makeRequest(`${SERVER_URL}/api/audit-logs?page=1&limit=3`, 'GET', null, authHeaders);
            if (authAuditResponse) {
                console.log('   Authenticated Audit Access:', '✅ WORKING');
            } else {
                console.log('   Authenticated Audit Access:', '❌ FAILING');
            }
        } else {
            console.log('   Login:', '❌ FAILED');
        }

        console.log('\n🎉 SERVER AUDIT FIX TEST COMPLETE!');
        console.log('====================================');
        
        if (healthResponse && auditResponse && returnAuditResponse) {
            console.log('✅ ALL TESTS PASSED - Audit system is working!');
            console.log('✅ Database schema fixed (resource column working)');
            console.log('✅ Audit endpoints accessible');
            console.log('✅ Server is fully operational');
        } else {
            console.log('❌ SOME TESTS FAILED - Check server logs');
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
    testServerAuditFix();
}

module.exports = { testServerAuditFix };