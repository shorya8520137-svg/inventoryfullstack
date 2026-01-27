const http = require('http');
const https = require('https');

// Disable SSL verification
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const IP = '16.171.5.50';
const PORTS_TO_TEST = [
    { port: 5000, protocol: 'http' },
    { port: 3000, protocol: 'http' },
    { port: 8000, protocol: 'http' },
    { port: 80, protocol: 'http' },
    { port: 443, protocol: 'https' },
    { port: 5000, protocol: 'https' },
    { port: 3000, protocol: 'https' }
];

const DOMAINS_TO_TEST = [
    `${IP}`,
    `${IP}.nip.io`
];

console.log('🔍 FINDING THE CORRECT API ENDPOINT');
console.log('='.repeat(60));
console.log(`🎯 Target IP: ${IP}`);
console.log(`📋 Testing ${PORTS_TO_TEST.length} ports × ${DOMAINS_TO_TEST.length} domains = ${PORTS_TO_TEST.length * DOMAINS_TO_TEST.length} combinations`);

function testEndpoint(url, protocol) {
    return new Promise((resolve, reject) => {
        const client = protocol === 'https' ? https : http;
        const startTime = Date.now();
        
        const req = client.request(url, {
            method: 'GET',
            timeout: 5000,
            headers: {
                'User-Agent': 'Port-Scanner'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                resolve({
                    success: true,
                    statusCode: res.statusCode,
                    data: data.substring(0, 200),
                    responseTime: responseTime
                });
            });
        });
        
        req.on('error', (error) => {
            const responseTime = Date.now() - startTime;
            reject({
                success: false,
                error: error.message,
                responseTime: responseTime
            });
        });
        
        req.on('timeout', () => {
            req.destroy();
            const responseTime = Date.now() - startTime;
            reject({
                success: false,
                error: 'Timeout',
                responseTime: responseTime
            });
        });
        
        req.end();
    });
}

async function scanPorts() {
    const workingEndpoints = [];
    
    console.log('\n🔍 Scanning endpoints...\n');
    
    for (const domain of DOMAINS_TO_TEST) {
        for (const { port, protocol } of PORTS_TO_TEST) {
            const url = `${protocol}://${domain}${port !== 80 && port !== 443 ? `:${port}` : ''}`;
            
            try {
                process.stdout.write(`   Testing ${url}... `);
                const result = await testEndpoint(url, protocol);
                
                console.log(`✅ ${result.statusCode} (${result.responseTime}ms)`);
                workingEndpoints.push({
                    url: url,
                    statusCode: result.statusCode,
                    responseTime: result.responseTime,
                    data: result.data
                });
                
            } catch (error) {
                console.log(`❌ ${error.error}`);
            }
        }
    }
    
    return workingEndpoints;
}

async function testLogin(baseUrl) {
    const client = baseUrl.startsWith('https://') ? https : http;
    
    return new Promise((resolve, reject) => {
        const loginData = JSON.stringify({
            email: 'admin@company.com',
            password: 'admin@123'
        });
        
        const url = `${baseUrl}/api/auth/login`;
        
        const req = client.request(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 5000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        success: jsonData.success,
                        hasToken: !!jsonData.token,
                        statusCode: res.statusCode
                    });
                } catch (e) {
                    resolve({
                        success: false,
                        hasToken: false,
                        statusCode: res.statusCode,
                        error: 'JSON Parse Error'
                    });
                }
            });
        });
        
        req.on('error', error => reject({ success: false, error: error.message }));
        req.on('timeout', () => {
            req.destroy();
            reject({ success: false, error: 'Timeout' });
        });
        
        req.write(loginData);
        req.end();
    });
}

async function main() {
    const workingEndpoints = await scanPorts();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 SCAN RESULTS');
    console.log('='.repeat(60));
    
    if (workingEndpoints.length === 0) {
        console.log('❌ No working endpoints found!');
        console.log('🔧 Possible issues:');
        console.log('   - Server is not running');
        console.log('   - Firewall is blocking connections');
        console.log('   - Server is running on a different port');
        return;
    }
    
    console.log(`\n✅ Found ${workingEndpoints.length} working endpoint(s):`);
    
    for (const endpoint of workingEndpoints) {
        console.log(`\n🔗 ${endpoint.url}`);
        console.log(`   Status: ${endpoint.statusCode} (${endpoint.responseTime}ms)`);
        console.log(`   Response: ${endpoint.data}...`);
        
        // Test login on this endpoint
        try {
            console.log('   Testing login...');
            const loginResult = await testLogin(endpoint.url);
            
            if (loginResult.success && loginResult.hasToken) {
                console.log('   ✅ Login works! This is your API endpoint.');
                console.log(`\n🎯 RECOMMENDED CONFIGURATION:`);
                console.log(`   NEXT_PUBLIC_API_BASE=${endpoint.url}`);
                break;
            } else {
                console.log('   ❌ Login failed on this endpoint');
            }
        } catch (loginError) {
            console.log(`   ❌ Login test failed: ${loginError.error}`);
        }
    }
}

main().catch(console.error);