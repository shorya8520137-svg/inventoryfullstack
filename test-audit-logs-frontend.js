/**
 * Test Audit Logs Frontend Integration
 */

const https = require('https');

const API_BASE = 'https://16.171.5.50.nip.io';

// Test credentials
const testCredentials = {
    email: 'admin@company.com',
    password: 'admin@123'
};

console.log('🧪 Testing Audit Logs Frontend Integration...\n');

async function makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
        const url = `${API_BASE}${path}`;
        const requestOptions = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            // Ignore SSL certificate issues for testing
            rejectUnauthorized: false
        };

        const req = https.request(url, requestOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (error) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', reject);
        
        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        
        req.end();
    });
}

async function testLogin() {
    console.log('🔐 Testing login...');
    
    try {
        const response = await makeRequest('/api/login', {
            method: 'POST',
            body: testCredentials
        });
        
        if (response.status === 200 && response.data.success) {
            console.log('✅ Login successful');
            console.log(`   User: ${response.data.user.name}`);
            console.log(`   Role: ${response.data.user.role_name}`);
            return response.data.token;
        } else {
            console.log('❌ Login failed:', response.data.message);
            return null;
        }
    } catch (error) {
        console.log('❌ Login error:', error.message);
        return null;
    }
}

async function testAuditLogs(token) {
    console.log('\n📋 Testing audit logs API...');
    
    try {
        const response = await makeRequest('/api/audit-logs?limit=10', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 200) {
            console.log('✅ Audit logs API working');
            
            if (response.data.success && response.data.data) {
                const logs = response.data.data.logs || response.data.data;
                console.log(`   Found ${logs.length} audit logs`);
                
                if (logs.length > 0) {
                    console.log('\n📊 Sample audit logs:');
                    logs.slice(0, 3).forEach((log, index) => {
                        console.log(`   ${index + 1}. ${log.action} - ${log.resource} (${log.created_at})`);
                        if (log.details) {
                            const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                            if (details.name) console.log(`      User: ${details.name}`);
                            if (details.email) console.log(`      Email: ${details.email}`);
                        }
                    });
                }
                
                return true;
            } else {
                console.log('⚠️ Unexpected response format:', response.data);
                return false;
            }
        } else {
            console.log('❌ Audit logs API failed:', response.status, response.data);
            return false;
        }
    } catch (error) {
        console.log('❌ Audit logs error:', error.message);
        return false;
    }
}

async function testAuditPermissions(token) {
    console.log('\n🔒 Testing audit permissions...');
    
    try {
        const response = await makeRequest('/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 200 && response.data.success) {
            const user = response.data.user;
            const permissions = user.permissions || [];
            const hasAuditPermission = permissions.some(p => 
                p.name === 'SYSTEM_AUDIT_LOG' || p.includes('AUDIT')
            );
            
            console.log(`✅ User permissions checked`);
            console.log(`   Total permissions: ${permissions.length}`);
            console.log(`   Has audit permission: ${hasAuditPermission ? 'Yes' : 'No'}`);
            
            return hasAuditPermission;
        } else {
            console.log('❌ Permission check failed:', response.data);
            return false;
        }
    } catch (error) {
        console.log('❌ Permission check error:', error.message);
        return false;
    }
}

async function runTests() {
    console.log('🚀 Starting Audit Logs Frontend Tests\n');
    console.log('='.repeat(50));
    
    const results = {
        total: 0,
        passed: 0,
        failed: 0
    };
    
    // Test 1: Login
    results.total++;
    const token = await testLogin();
    if (token) {
        results.passed++;
    } else {
        results.failed++;
        console.log('\n❌ Cannot continue without valid token');
        return;
    }
    
    // Test 2: Audit Logs API
    results.total++;
    if (await testAuditLogs(token)) {
        results.passed++;
    } else {
        results.failed++;
    }
    
    // Test 3: Audit Permissions
    results.total++;
    if (await testAuditPermissions(token)) {
        results.passed++;
    } else {
        results.failed++;
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${results.total}`);
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`Success Rate: ${Math.round((results.passed / results.total) * 100)}%`);
    
    if (results.failed === 0) {
        console.log('\n🎉 All tests passed! Audit logs system is working correctly.');
        console.log('\n📋 Next Steps:');
        console.log('1. Open the frontend permissions page');
        console.log('2. Click on the "Audit Logs" tab');
        console.log('3. You should see user-friendly audit activities');
        console.log('4. Test the search and filter functionality');
    } else {
        console.log('\n⚠️ Some tests failed. Please check the API endpoints and permissions.');
    }
}

// Run the tests
runTests().catch(console.error);