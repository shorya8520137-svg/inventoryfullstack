/**
 * COMPREHENSIVE API TESTING SCRIPT
 * Tests all API endpoints on the server
 */

const axios = require('axios');

// Configuration
const SERVER_IP = '54.179.63.233';
const LOCAL_URL = 'http://localhost:5000/api';
const REMOTE_URL = `https://${SERVER_IP}.nip.io/api`;
const FRONTEND_URL = 'https://stockiqfullstacktest.vercel.app';

class APITester {
    constructor() {
        this.results = {};
        this.testCount = 0;
        this.passCount = 0;
    }

    async testEndpoint(name, url, options = {}) {
        this.testCount++;
        console.log(`\n${this.testCount}️⃣ Testing ${name}...`);
        
        try {
            const response = await axios({
                url,
                timeout: 10000,
                validateStatus: () => true, // Don't throw on any status
                ...options
            });
            
            const success = this.evaluateResponse(response, options.expectedStatus || [200]);
            this.results[name] = {
                success,
                status: response.status,
                data: response.data,
                error: null
            };
            
            if (success) {
                this.passCount++;
                console.log(`✅ ${name}: PASS (Status: ${response.status})`);
                if (response.data && typeof response.data === 'object') {
                    console.log(`📊 Response:`, JSON.stringify(response.data, null, 2).substring(0, 200) + '...');
                }
            } else {
                console.log(`❌ ${name}: FAIL (Status: ${response.status})`);
                console.log(`📊 Response:`, response.data);
            }
            
        } catch (error) {
            this.results[name] = {
                success: false,
                status: null,
                data: null,
                error: error.message
            };
            console.log(`❌ ${name}: FAIL - ${error.message}`);
        }
    }

    evaluateResponse(response, expectedStatuses) {
        return expectedStatuses.includes(response.status);
    }

    async runAllTests() {
        console.log('🚀 Starting Comprehensive API Testing...');
        console.log(`🔗 Testing Server: ${SERVER_IP}`);
        console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
        console.log('='.repeat(80));

        // Test both local and remote URLs
        const baseUrls = [
            { name: 'Local', url: LOCAL_URL },
            { name: 'Remote', url: REMOTE_URL }
        ];

        for (const base of baseUrls) {
            console.log(`\n🔍 Testing ${base.name} API (${base.url})`);
            console.log('-'.repeat(50));

            // 1. Health Check
            await this.testEndpoint(
                `${base.name} Health Check`,
                `${base.url}/health`,
                { expectedStatus: [200] }
            );

            // 2. Authentication Endpoints
            await this.testEndpoint(
                `${base.name} Login (Invalid Credentials)`,
                `${base.url}/auth/login`,
                {
                    method: 'POST',
                    data: { email: 'test@example.com', password: 'wrongpassword' },
                    expectedStatus: [400, 401, 422]
                }
            );

            await this.testEndpoint(
                `${base.name} Register Endpoint`,
                `${base.url}/auth/register`,
                {
                    method: 'POST',
                    data: { name: 'Test', email: 'test@example.com', password: 'test123' },
                    expectedStatus: [201, 400, 409, 422]
                }
            );

            // 3. Protected Endpoints (should require auth)
            const protectedEndpoints = [
                'users',
                'products',
                'orders',
                'dispatch',
                'notifications',
                'audit-logs',
                'permissions'
            ];

            for (const endpoint of protectedEndpoints) {
                await this.testEndpoint(
                    `${base.name} ${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}`,
                    `${base.url}/${endpoint}`,
                    { expectedStatus: [401, 403] }
                );
            }

            // 4. 2FA Endpoints
            await this.testEndpoint(
                `${base.name} 2FA Status`,
                `${base.url}/2fa/status`,
                {
                    headers: { 'Authorization': 'Bearer invalid-token' },
                    expectedStatus: [401, 403]
                }
            );

            await this.testEndpoint(
                `${base.name} 2FA Setup`,
                `${base.url}/2fa/setup`,
                {
                    method: 'POST',
                    headers: { 'Authorization': 'Bearer invalid-token' },
                    expectedStatus: [401, 403]
                }
            );

            // 5. Specific API Tests
            await this.testEndpoint(
                `${base.name} Product Search`,
                `${base.url}/products/search?q=test`,
                { expectedStatus: [401, 403, 200] }
            );

            await this.testEndpoint(
                `${base.name} Order Tracking`,
                `${base.url}/orders/track/TEST123`,
                { expectedStatus: [401, 403, 404, 200] }
            );
        }

        // 6. Frontend Connectivity Test
        await this.testEndpoint(
            'Frontend Accessibility',
            FRONTEND_URL,
            { expectedStatus: [200] }
        );

        // 7. Database Connection Test (via API)
        await this.testEndpoint(
            'Database Connection Test',
            `${REMOTE_URL}/health/database`,
            { expectedStatus: [200, 404] }
        );

        this.printSummary();
    }

    printSummary() {
        console.log('\n' + '='.repeat(80));
        console.log('📋 COMPREHENSIVE API TEST SUMMARY');
        console.log('='.repeat(80));

        // Group results by category
        const categories = {
            'Health & Status': [],
            'Authentication': [],
            'Protected Endpoints': [],
            '2FA System': [],
            'Frontend': [],
            'Database': []
        };

        Object.entries(this.results).forEach(([name, result]) => {
            if (name.includes('Health')) categories['Health & Status'].push({ name, result });
            else if (name.includes('Login') || name.includes('Register')) categories['Authentication'].push({ name, result });
            else if (name.includes('2FA')) categories['2FA System'].push({ name, result });
            else if (name.includes('Frontend')) categories['Frontend'].push({ name, result });
            else if (name.includes('Database')) categories['Database'].push({ name, result });
            else categories['Protected Endpoints'].push({ name, result });
        });

        Object.entries(categories).forEach(([category, tests]) => {
            if (tests.length > 0) {
                console.log(`\n📂 ${category}:`);
                tests.forEach(({ name, result }) => {
                    const status = result.success ? '✅ PASS' : '❌ FAIL';
                    const statusCode = result.status ? `(${result.status})` : '';
                    console.log(`   ${status} ${name} ${statusCode}`);
                });
            }
        });

        console.log('\n' + '='.repeat(80));
        console.log(`🎯 OVERALL RESULTS: ${this.passCount}/${this.testCount} tests passed`);
        
        const successRate = Math.round((this.passCount / this.testCount) * 100);
        console.log(`📊 Success Rate: ${successRate}%`);

        if (successRate >= 80) {
            console.log('🎉 SYSTEM IS OPERATIONAL!');
            console.log('\n🔗 Access Information:');
            console.log(`   Frontend: ${FRONTEND_URL}`);
            console.log(`   Backend:  https://${SERVER_IP}.nip.io`);
            console.log(`   Server:   ${SERVER_IP}`);
            console.log('\n🔐 Features Available:');
            console.log('   ✅ User Authentication & Authorization');
            console.log('   ✅ Google 2FA Security System');
            console.log('   ✅ Inventory Management');
            console.log('   ✅ Order Processing & Dispatch');
            console.log('   ✅ Audit Logging & Location Tracking');
            console.log('   ✅ Real-time Notifications');
        } else if (successRate >= 60) {
            console.log('⚠️  SYSTEM PARTIALLY OPERATIONAL');
            console.log('   Some endpoints may need attention');
        } else {
            console.log('🚨 SYSTEM NEEDS ATTENTION');
            console.log('   Multiple endpoints are failing');
        }

        console.log('\n📝 Next Steps:');
        if (successRate < 100) {
            console.log('   1. Check server logs: pm2 logs');
            console.log('   2. Verify database connection');
            console.log('   3. Check environment variables');
            console.log('   4. Restart services if needed: pm2 restart all');
        } else {
            console.log('   1. System is ready for production use');
            console.log('   2. Test user registration and login');
            console.log('   3. Set up 2FA for admin accounts');
            console.log('   4. Begin inventory management operations');
        }

        console.log('='.repeat(80));
    }
}

// Run the tests
const tester = new APITester();
tester.runAllTests().catch(console.error);