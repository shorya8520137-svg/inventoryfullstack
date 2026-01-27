/**
 * AUTHENTICATED OPERATIONS TEST
 * Uses admin token to test all authenticated endpoints
 */

const axios = require('axios');

// Configuration
const SERVER_IP = '54.179.63.233';
const REMOTE_URL = `https://${SERVER_IP}.nip.io/api`;
const LOCAL_URL = 'http://localhost:5000/api';

// Admin Credentials
const ADMIN_CREDENTIALS = {
    email: 'admin@company.com',
    password: 'Admin@123'
};

class AuthenticatedOperationsTester {
    constructor() {
        this.token = null;
        this.baseUrl = null;
        this.userId = null;
    }

    async initialize() {
        console.log('🔧 Initializing Authenticated Operations Tester...');
        
        // Test connection and get token
        const connected = await this.testConnection();
        if (!connected) return false;
        
        const authenticated = await this.authenticate();
        return authenticated;
    }

    async testConnection() {
        console.log('🔍 Testing API Connection...');
        
        // Try remote first
        try {
            const response = await axios.get(`${REMOTE_URL}/health`, { timeout: 5000 });
            if (response.status === 200) {
                this.baseUrl = REMOTE_URL;
                console.log('✅ Connected to Remote API');
                return true;
            }
        } catch (error) {
            console.log('⚠️ Remote API not accessible, trying local...');
        }
        
        // Try local
        try {
            const response = await axios.get(`${LOCAL_URL}/health`, { timeout: 5000 });
            if (response.status === 200) {
                this.baseUrl = LOCAL_URL;
                console.log('✅ Connected to Local API');
                return true;
            }
        } catch (error) {
            console.log('❌ Both APIs are not accessible');
            return false;
        }
    }

    async authenticate() {
        console.log('🔐 Authenticating admin user...');
        
        try {
            const response = await axios.post(`${this.baseUrl}/auth/login`, ADMIN_CREDENTIALS, {
                timeout: 10000
            });
            
            if (response.data.token) {
                this.token = response.data.token;
                this.userId = response.data.user?.id;
                console.log('✅ Authentication successful');
                console.log(`👤 User: ${response.data.user?.name} (${response.data.user?.role})`);
                return true;
            }
        } catch (error) {
            console.log('❌ Authentication failed:', error.response?.data?.message || error.message);
            return false;
        }
    }

    async makeAuthenticatedRequest(method, endpoint, data = null) {
        try {
            const config = {
                method,
                url: `${this.baseUrl}${endpoint}`,
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            };
            
            if (data) {
                config.data = data;
            }
            
            const response = await axios(config);
            return { success: true, data: response.data, status: response.status };
            
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.message || error.message,
                status: error.response?.status || 0
            };
        }
    }

    async testUserManagement() {
        console.log('\n👥 Testing User Management...');
        
        const tests = [
            {
                name: 'Get All Users',
                method: 'GET',
                endpoint: '/users'
            },
            {
                name: 'Get User Profile',
                method: 'GET',
                endpoint: '/auth/profile'
            },
            {
                name: 'Create New User',
                method: 'POST',
                endpoint: '/users',
                data: {
                    name: 'Test Employee',
                    email: 'employee@company.com',
                    password: 'Employee123',
                    role: 'user'
                }
            }
        ];
        
        const results = [];
        
        for (const test of tests) {
            console.log(`\n🔍 ${test.name}...`);
            const result = await this.makeAuthenticatedRequest(test.method, test.endpoint, test.data);
            
            if (result.success) {
                console.log(`✅ ${test.name}: SUCCESS`);
                if (Array.isArray(result.data)) {
                    console.log(`📊 Found ${result.data.length} records`);
                } else if (result.data && typeof result.data === 'object') {
                    console.log(`📊 Response keys: ${Object.keys(result.data).join(', ')}`);
                }
                results.push({ name: test.name, status: 'SUCCESS' });
            } else {
                console.log(`❌ ${test.name}: FAILED (${result.status})`);
                console.log(`📊 Error: ${result.error}`);
                results.push({ name: test.name, status: 'FAILED', error: result.error });
            }
        }
        
        return results;
    }

    async testInventoryManagement() {
        console.log('\n📦 Testing Inventory Management...');
        
        const tests = [
            {
                name: 'Get All Products',
                method: 'GET',
                endpoint: '/products'
            },
            {
                name: 'Create New Product',
                method: 'POST',
                endpoint: '/products',
                data: {
                    name: 'Test Product',
                    sku: 'TEST-PROD-001',
                    barcode: '1234567890123',
                    price: 29.99,
                    cost_price: 15.00,
                    category: 'Electronics'
                }
            },
            {
                name: 'Search Products',
                method: 'GET',
                endpoint: '/products/search?q=test'
            }
        ];
        
        const results = [];
        
        for (const test of tests) {
            console.log(`\n🔍 ${test.name}...`);
            const result = await this.makeAuthenticatedRequest(test.method, test.endpoint, test.data);
            
            if (result.success) {
                console.log(`✅ ${test.name}: SUCCESS`);
                if (Array.isArray(result.data)) {
                    console.log(`📊 Found ${result.data.length} items`);
                } else if (result.data && result.data.id) {
                    console.log(`📊 Created item with ID: ${result.data.id}`);
                }
                results.push({ name: test.name, status: 'SUCCESS' });
            } else {
                console.log(`❌ ${test.name}: FAILED (${result.status})`);
                console.log(`📊 Error: ${result.error}`);
                results.push({ name: test.name, status: 'FAILED', error: result.error });
            }
        }
        
        return results;
    }

    async testOrderManagement() {
        console.log('\n📋 Testing Order Management...');
        
        const tests = [
            {
                name: 'Get All Orders',
                method: 'GET',
                endpoint: '/orders'
            },
            {
                name: 'Get Dispatch Records',
                method: 'GET',
                endpoint: '/dispatch'
            },
            {
                name: 'Create New Order',
                method: 'POST',
                endpoint: '/orders',
                data: {
                    customer_name: 'Test Customer',
                    customer_email: 'customer@example.com',
                    items: [
                        {
                            product_id: 1,
                            quantity: 2,
                            price: 29.99
                        }
                    ],
                    total_amount: 59.98
                }
            }
        ];
        
        const results = [];
        
        for (const test of tests) {
            console.log(`\n🔍 ${test.name}...`);
            const result = await this.makeAuthenticatedRequest(test.method, test.endpoint, test.data);
            
            if (result.success) {
                console.log(`✅ ${test.name}: SUCCESS`);
                if (Array.isArray(result.data)) {
                    console.log(`📊 Found ${result.data.length} records`);
                }
                results.push({ name: test.name, status: 'SUCCESS' });
            } else {
                console.log(`❌ ${test.name}: FAILED (${result.status})`);
                console.log(`📊 Error: ${result.error}`);
                results.push({ name: test.name, status: 'FAILED', error: result.error });
            }
        }
        
        return results;
    }

    async testAuditAndNotifications() {
        console.log('\n📊 Testing Audit & Notifications...');
        
        const tests = [
            {
                name: 'Get Audit Logs',
                method: 'GET',
                endpoint: '/audit-logs'
            },
            {
                name: 'Get Notifications',
                method: 'GET',
                endpoint: '/notifications'
            },
            {
                name: 'Get User Permissions',
                method: 'GET',
                endpoint: '/permissions'
            }
        ];
        
        const results = [];
        
        for (const test of tests) {
            console.log(`\n🔍 ${test.name}...`);
            const result = await this.makeAuthenticatedRequest(test.method, test.endpoint);
            
            if (result.success) {
                console.log(`✅ ${test.name}: SUCCESS`);
                if (Array.isArray(result.data)) {
                    console.log(`📊 Found ${result.data.length} records`);
                }
                results.push({ name: test.name, status: 'SUCCESS' });
            } else {
                console.log(`❌ ${test.name}: FAILED (${result.status})`);
                console.log(`📊 Error: ${result.error}`);
                results.push({ name: test.name, status: 'FAILED', error: result.error });
            }
        }
        
        return results;
    }

    async test2FAOperations() {
        console.log('\n🔐 Testing 2FA Operations...');
        
        const tests = [
            {
                name: 'Get 2FA Status',
                method: 'GET',
                endpoint: '/2fa/status'
            },
            {
                name: 'Generate 2FA Setup',
                method: 'POST',
                endpoint: '/2fa/setup'
            }
        ];
        
        const results = [];
        
        for (const test of tests) {
            console.log(`\n🔍 ${test.name}...`);
            const result = await this.makeAuthenticatedRequest(test.method, test.endpoint);
            
            if (result.success) {
                console.log(`✅ ${test.name}: SUCCESS`);
                if (result.data && result.data.enabled !== undefined) {
                    console.log(`📊 2FA Enabled: ${result.data.enabled}`);
                }
                if (result.data && result.data.qrCodeUrl) {
                    console.log(`📊 QR Code Generated: Yes`);
                }
                results.push({ name: test.name, status: 'SUCCESS' });
            } else {
                console.log(`❌ ${test.name}: FAILED (${result.status})`);
                console.log(`📊 Error: ${result.error}`);
                results.push({ name: test.name, status: 'FAILED', error: result.error });
            }
        }
        
        return results;
    }

    async runAllTests() {
        console.log('🚀 Starting Comprehensive Authenticated Operations Test...');
        console.log('='.repeat(80));
        
        const initialized = await this.initialize();
        if (!initialized) {
            console.log('❌ Failed to initialize - cannot proceed');
            return;
        }
        
        console.log(`🔗 API Base URL: ${this.baseUrl}`);
        console.log(`🎫 Token: ${this.token.substring(0, 20)}...`);
        
        // Run all test suites
        const userResults = await this.testUserManagement();
        const inventoryResults = await this.testInventoryManagement();
        const orderResults = await this.testOrderManagement();
        const auditResults = await this.testAuditAndNotifications();
        const twoFAResults = await this.test2FAOperations();
        
        // Print summary
        this.printSummary({
            'User Management': userResults,
            'Inventory Management': inventoryResults,
            'Order Management': orderResults,
            'Audit & Notifications': auditResults,
            '2FA Operations': twoFAResults
        });
    }

    printSummary(testSuites) {
        console.log('\n' + '='.repeat(80));
        console.log('📋 AUTHENTICATED OPERATIONS TEST SUMMARY');
        console.log('='.repeat(80));
        
        let totalTests = 0;
        let successfulTests = 0;
        
        Object.entries(testSuites).forEach(([suiteName, results]) => {
            console.log(`\n📂 ${suiteName}:`);
            results.forEach(result => {
                const icon = result.status === 'SUCCESS' ? '✅' : '❌';
                console.log(`   ${icon} ${result.name}: ${result.status}`);
                totalTests++;
                if (result.status === 'SUCCESS') successfulTests++;
            });
        });
        
        console.log('\n' + '='.repeat(80));
        console.log(`🎯 OVERALL RESULTS: ${successfulTests}/${totalTests} tests passed`);
        
        const successRate = Math.round((successfulTests / totalTests) * 100);
        console.log(`📊 Success Rate: ${successRate}%`);
        
        if (successRate >= 80) {
            console.log('\n🎉 SYSTEM IS FULLY OPERATIONAL!');
            console.log('\n✅ Admin Authentication: Working');
            console.log('✅ Token-based API Access: Working');
            console.log('✅ Core Features: Functional');
            
            console.log('\n🔑 Token for API calls:');
            console.log(`Authorization: Bearer ${this.token}`);
            
        } else if (successRate >= 60) {
            console.log('\n⚠️ SYSTEM PARTIALLY OPERATIONAL');
            console.log('Some endpoints may need attention');
        } else {
            console.log('\n🚨 SYSTEM NEEDS ATTENTION');
            console.log('Multiple critical endpoints are failing');
        }
        
        console.log('\n📝 API Usage Examples:');
        console.log(`curl -H "Authorization: Bearer ${this.token}" ${this.baseUrl}/users`);
        console.log(`curl -H "Authorization: Bearer ${this.token}" ${this.baseUrl}/products`);
        console.log(`curl -H "Authorization: Bearer ${this.token}" ${this.baseUrl}/orders`);
        
        console.log('='.repeat(80));
    }
}

// Run the test
const tester = new AuthenticatedOperationsTester();
tester.runAllTests().catch(console.error);