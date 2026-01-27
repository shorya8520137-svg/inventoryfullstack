/**
 * Complete Audit System Test
 */

const https = require('https');

const API_BASE = 'https://16.171.5.50.nip.io';

console.log('🧪 Testing Complete Audit System...\n');

async function makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
        const url = `${API_BASE}${path}`;
        const requestOptions = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            rejectUnauthorized: false
        };

        console.log(`📡 ${options.method || 'GET'} ${path}`);

        const req = https.request(url, requestOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`   Status: ${res.statusCode}`);
                try {
                    const jsonData = JSON.parse(data);
                    console.log(`   Response: ${JSON.stringify(jsonData, null, 2).substring(0, 200)}...`);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (error) {
                    console.log(`   Response: ${data.substring(0, 200)}...`);
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });

        req.on('error', (error) => {
            console.log(`   Error: ${error.message}`);
            reject(error);
        });
        
        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        
        req.end();
    });
}

async function testLogin() {
    console.log('🔐 Testing login with admin@company.com...');
    
    try {
        const response = await makeRequest('/api/login', {
            method: 'POST',
            body: {
                email: 'admin@company.com',
                password: 'admin@123'
            }
        });
        
        if (response.status === 200 && response.data.success) {
            console.log('✅ Login successful');
            return response.data.token;
        } else {
            console.log('❌ Login failed');
            return null;
        }
    } catch (error) {
        console.log('❌ Login error:', error.message);
        return null;
    }
}

async function testAuditLogsAPI(token) {
    console.log('\n📋 Testing audit logs API...');
    
    try {
        const response = await makeRequest('/api/audit-logs?limit=5', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 200) {
            console.log('✅ Audit logs API working');
            return response.data;
        } else {
            console.log('❌ Audit logs API failed');
            return null;
        }
    } catch (error) {
        console.log('❌ Audit logs error:', error.message);
        return null;
    }
}

async function testPermissionsAPI(token) {
    console.log('\n🔒 Testing permissions API...');
    
    try {
        const response = await makeRequest('/api/users/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.status === 200) {
            console.log('✅ Permissions API working');
            return response.data;
        } else {
            console.log('❌ Permissions API failed');
            return null;
        }
    } catch (error) {
        console.log('❌ Permissions error:', error.message);
        return null;
    }
}

async function testDatabaseConnection() {
    console.log('\n🗄️ Testing database connection via SSH...');
    
    const { Client } = require('ssh2');
    const fs = require('fs');
    
    const conn = new Client();
    
    return new Promise((resolve) => {
        conn.on('ready', async () => {
            console.log('✅ SSH connection established');
            
            try {
                const result = await executeSSHCommand(conn, 'sudo mysql -e "USE inventory_db; SELECT COUNT(*) as total FROM audit_logs LIMIT 1;"');
                console.log('✅ Database connection working');
                console.log(`   Audit logs count: ${result}`);
                resolve(true);
            } catch (error) {
                console.log('❌ Database query failed:', error.message);
                resolve(false);
            } finally {
                conn.end();
            }
        }).on('error', (err) => {
            console.log('❌ SSH connection failed:', err.message);
            resolve(false);
        });
        
        conn.connect({
            host: '16.171.5.50',
            port: 22,
            username: 'ubuntu',
            privateKey: fs.readFileSync('C:\\Users\\Admin\\awsconection.pem')
        });
    });
}

function executeSSHCommand(conn, command) {
    return new Promise((resolve, reject) => {
        conn.exec(command, (err, stream) => {
            if (err) {
                reject(err);
                return;
            }
            
            let output = '';
            stream.on('close', () => {
                resolve(output);
            }).on('data', (data) => {
                output += data;
            });
        });
    });
}

async function runCompleteTest() {
    console.log('🚀 Starting Complete Audit System Test\n');
    console.log('='.repeat(60));
    
    const results = {
        database: false,
        login: false,
        auditAPI: false,
        permissions: false
    };
    
    // Test 1: Database Connection
    console.log('\n1️⃣ DATABASE TEST');
    console.log('-'.repeat(30));
    results.database = await testDatabaseConnection();
    
    // Test 2: Login
    console.log('\n2️⃣ LOGIN TEST');
    console.log('-'.repeat(30));
    const token = await testLogin();
    results.login = !!token;
    
    if (!token) {
        console.log('\n❌ Cannot continue without valid token');
        printSummary(results);
        return;
    }
    
    // Test 3: Audit Logs API
    console.log('\n3️⃣ AUDIT LOGS API TEST');
    console.log('-'.repeat(30));
    const auditData = await testAuditLogsAPI(token);
    results.auditAPI = !!auditData;
    
    // Test 4: Permissions
    console.log('\n4️⃣ PERMISSIONS TEST');
    console.log('-'.repeat(30));
    const permissionsData = await testPermissionsAPI(token);
    results.permissions = !!permissionsData;
    
    // Summary
    printSummary(results);
    
    if (results.auditAPI && auditData) {
        console.log('\n📊 SAMPLE AUDIT DATA:');
        console.log('-'.repeat(30));
        if (auditData.data && auditData.data.logs) {
            auditData.data.logs.slice(0, 3).forEach((log, index) => {
                console.log(`${index + 1}. ${log.action} - ${log.resource} (${log.created_at})`);
            });
        } else if (Array.isArray(auditData)) {
            auditData.slice(0, 3).forEach((log, index) => {
                console.log(`${index + 1}. ${log.action} - ${log.resource} (${log.created_at})`);
            });
        }
    }
}

function printSummary(results) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    
    const tests = [
        { name: 'Database Connection', status: results.database },
        { name: 'Login Authentication', status: results.login },
        { name: 'Audit Logs API', status: results.auditAPI },
        { name: 'Permissions Check', status: results.permissions }
    ];
    
    tests.forEach(test => {
        const icon = test.status ? '✅' : '❌';
        console.log(`${icon} ${test.name}`);
    });
    
    const passedCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;
    
    console.log(`\n📈 Success Rate: ${passedCount}/${totalCount} (${Math.round((passedCount/totalCount)*100)}%)`);
    
    if (passedCount === totalCount) {
        console.log('\n🎉 ALL TESTS PASSED! Audit system is fully functional.');
        console.log('\n📋 Next Steps:');
        console.log('1. Open your frontend application');
        console.log('2. Login with admin@company.com / admin@123');
        console.log('3. Navigate to Permissions page');
        console.log('4. Click on "Audit Logs" tab');
        console.log('5. View user-friendly audit activities');
    } else {
        console.log('\n⚠️ Some tests failed. Check the API server and database connection.');
    }
}

// Run the complete test
runCompleteTest().catch(console.error);