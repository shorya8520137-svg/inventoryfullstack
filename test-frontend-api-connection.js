// Frontend API Connection Test
// This simulates how the frontend will connect to the API

const https = require('https');

// Disable SSL verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

// Use the same environment variable that the frontend uses
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://16.171.5.50.nip.io';

console.log('🌐 Testing Frontend API Connection');
console.log('='.repeat(50));
console.log(`📡 API Base URL: ${API_BASE}`);
console.log(`🔧 Environment Variable: NEXT_PUBLIC_API_BASE=${process.env.NEXT_PUBLIC_API_BASE || 'Not set'}`);

// Simulate the frontend API utility functions
class FrontendAPITest {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.token = null;
    }

    async makeRequest(endpoint, options = {}) {
        return new Promise((resolve, reject) => {
            const url = `${this.baseUrl}${endpoint}`;
            const startTime = Date.now();
            
            const requestOptions = {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Frontend-Test-Client',
                    ...options.headers
                },
                timeout: 10000
            };

            if (this.token && !options.headers?.Authorization) {
                requestOptions.headers.Authorization = `Bearer ${this.token}`;
            }

            const req = https.request(url, requestOptions, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    const responseTime = Date.now() - startTime;
                    try {
                        const jsonData = JSON.parse(data);
                        resolve({
                            success: true,
                            statusCode: res.statusCode,
                            data: jsonData,
                            responseTime
                        });
                    } catch (parseError) {
                        resolve({
                            success: false,
                            statusCode: res.statusCode,
                            data: data,
                            responseTime,
                            error: 'JSON Parse Error'
                        });
                    }
                });
            });
            
            req.on('error', (error) => {
                const responseTime = Date.now() - startTime;
                reject({
                    success: false,
                    error: error.message,
                    responseTime
                });
            });
            
            req.on('timeout', () => {
                req.destroy();
                reject({
                    success: false,
                    error: 'Request timeout',
                    responseTime: 10000
                });
            });
            
            if (options.body) {
                req.write(JSON.stringify(options.body));
            }
            
            req.end();
        });
    }

    async login(credentials) {
        console.log('\n🔐 Testing Login Flow');
        console.log('-'.repeat(30));
        
        try {
            const response = await this.makeRequest('/api/auth/login', {
                method: 'POST',
                body: credentials
            });
            
            console.log(`✅ Login Status: ${response.statusCode}`);
            console.log(`⏱️  Response Time: ${response.responseTime}ms`);
            
            if (response.data && response.data.token) {
                this.token = response.data.token;
                console.log(`🔑 Token Received: ${this.token.substring(0, 20)}...`);
                console.log(`👤 User: ${response.data.user?.email || 'Unknown'}`);
                return true;
            } else {
                console.log(`❌ Login failed: ${response.data?.message || 'No token received'}`);
                return false;
            }
        } catch (error) {
            console.log(`❌ Login error: ${error.error}`);
            return false;
        }
    }

    async testProtectedEndpoint(endpoint, description) {
        console.log(`\n🔒 Testing ${description}`);
        console.log('-'.repeat(30));
        
        try {
            const response = await this.makeRequest(endpoint);
            
            console.log(`✅ Status: ${response.statusCode}`);
            console.log(`⏱️  Response Time: ${response.responseTime}ms`);
            
            if (response.data) {
                console.log(`📊 Success: ${response.data.success}`);
                if (response.data.data) {
                    const dataLength = Array.isArray(response.data.data) ? response.data.data.length : 'Object';
                    console.log(`📦 Data: ${dataLength} items`);
                }
            }
            
            return response.statusCode === 200;
        } catch (error) {
            console.log(`❌ ${description} failed: ${error.error}`);
            return false;
        }
    }

    async runFullTest() {
        const results = {
            login: false,
            products: false,
            inventory: false,
            dashboard: false
        };

        // Test login
        results.login = await this.login({
            email: 'admin@company.com',
            password: 'admin@123'
        });

        if (results.login) {
            // Test protected endpoints
            results.products = await this.testProtectedEndpoint('/api/products?limit=5', 'Products API');
            results.inventory = await this.testProtectedEndpoint('/api/inventory?limit=5', 'Inventory API');
            results.dashboard = await this.testProtectedEndpoint('/api/dashboard', 'Dashboard API');
        }

        return results;
    }
}

// Test different scenarios
async function runTests() {
    console.log('\n📋 Test Scenarios:');
    console.log('1. Environment variable configuration');
    console.log('2. Frontend API utility simulation');
    console.log('3. Authentication flow');
    console.log('4. Protected endpoint access');

    const api = new FrontendAPITest(API_BASE);
    const results = await api.runFullTest();

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 FRONTEND CONNECTION TEST SUMMARY');
    console.log('='.repeat(50));

    const tests = [
        { name: 'Login Authentication', status: results.login },
        { name: 'Products API Access', status: results.products },
        { name: 'Inventory API Access', status: results.inventory },
        { name: 'Dashboard API Access', status: results.dashboard }
    ];

    tests.forEach(test => {
        const icon = test.status ? '✅' : '❌';
        const status = test.status ? 'PASS' : 'FAIL';
        console.log(`${icon} ${test.name}: ${status}`);
    });

    const passedTests = tests.filter(t => t.status).length;
    const totalTests = tests.length;

    console.log('\n' + '-'.repeat(40));
    console.log(`🎯 Frontend Connection: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
        console.log('\n🎉 Frontend can successfully connect to the new API!');
        console.log('✅ The IP address change is working correctly.');
    } else {
        console.log('\n⚠️  Some frontend connections failed.');
        console.log('🔧 Check the API server and authentication.');
    }

    console.log(`\n📡 API Endpoint: ${API_BASE}`);
    console.log(`⏰ Test completed at: ${new Date().toISOString()}`);
}

// Run the tests
runTests().catch(error => {
    console.error('\n💥 Frontend test failed:', error);
    process.exit(1);
});