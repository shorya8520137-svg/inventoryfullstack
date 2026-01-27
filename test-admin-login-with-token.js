/**
 * ADMIN LOGIN AND TOKEN AUTHENTICATION TEST
 * Tests real admin credentials and token-based API access
 */

const axios = require('axios');

// Configuration
const SERVER_IP = '54.179.63.233';
const LOCAL_URL = 'http://localhost:5000/api';
const REMOTE_URL = `https://${SERVER_IP}.nip.io/api`;

// Admin Credentials
const ADMIN_CREDENTIALS = {
    email: 'admin@company.com',
    password: 'Admin@123'
};

class AdminTokenTester {
    constructor() {
        this.adminToken = null;
        this.baseUrl = REMOTE_URL; // Default to remote, fallback to local
    }

    async testConnection() {
        console.log('🔍 Testing API Connection...');
        
        // Try remote first
        try {
            const response = await axios.get(`${REMOTE_URL}/health`, { timeout: 5000 });
            if (response.status === 200) {
                this.baseUrl = REMOTE_URL;
                console.log('✅ Connected to Remote API:', REMOTE_URL);
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
                console.log('✅ Connected to Local API:', LOCAL_URL);
                return true;
            }
        } catch (error) {
            console.log('❌ Both Remote and Local APIs are not accessible');
            return false;
        }
    }

    async loginAdmin() {
        console.log('\n🔐 Testing Admin Login...');
        console.log(`📧 Email: ${ADMIN_CREDENTIALS.email}`);
        console.log(`🔑 Password: ${ADMIN_CREDENTIALS.password.replace(/./g, '*')}`);
        
        try {
            const response = await axios.post(`${this.baseUrl}/auth/login`, ADMIN_CREDENTIALS, {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.status === 200 && response.data.token) {
                this.adminToken = response.data.token;
                console.log('✅ Admin Login: SUCCESS');
                console.log('🎫 Token Generated:', this.adminToken.substring(0, 20) + '...');
                console.log('👤 User Info:', {
                    id: response.data.user?.id,
                    name: response.data.user?.name,
                    email: response.data.user?.email,
                    role: response.data.user?.role
                });
                return true;
            } else {
                console.log('❌ Admin Login: FAILED - No token received');
                console.log('📊 Response:', response.data);
                return false;
            }
            
        } catch (error) {
            console.log('❌ Admin Login: FAILED');
            if (error.response) {
                console.log('📊 Status:', error.response.status);
                console.log('📊 Response:', error.response.data);
            } else {
                console.log('📊 Error:', error.message);
            }
            return false;
        }
    }

    async testTokenAuthentication() {
        if (!this.adminToken) {
            console.log('❌ No token available for testing');
            return false;
        }

        console.log('\n🎫 Testing Token Authentication...');
        
        const protectedEndpoints = [
            { name: 'User Profile', endpoint: '/auth/profile' },
            { name: 'Users List', endpoint: '/users' },
            { name: 'Products', endpoint: '/products' },
            { name: 'Orders', endpoint: '/orders' },
            { name: 'Dispatch', endpoint: '/dispatch' },
            { name: 'Notifications', endpoint: '/notifications' },
            { name: 'Audit Logs', endpoint: '/audit-logs' },
            { name: 'Permissions', endpoint: '/permissions' }
        ];

        const results = [];
        
        for (const test of protectedEndpoints) {
            try {
                console.log(`\n🔍 Testing ${test.name}...`);
                
                const response = await axios.get(`${this.baseUrl}${test.endpoint}`, {
                    headers: {
                        'Authorization': `Bearer ${this.adminToken}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                });
                
                console.log(`✅ ${test.name}: SUCCESS (${response.status})`);
                if (response.data && Array.isArray(response.data)) {
                    console.log(`📊 Records: ${response.data.length} items`);
                } else if (response.data && typeof response.data === 'object') {
                    console.log(`📊 Response: ${Object.keys(response.data).join(', ')}`);
                }
                
                results.push({ name: test.name, status: 'SUCCESS', code: response.status });
                
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    console.log(`⚠️ ${test.name}: ENDPOINT NOT FOUND (404)`);
                    results.push({ name: test.name, status: 'NOT_FOUND', code: 404 });
                } else if (error.response && error.response.status === 403) {
                    console.log(`⚠️ ${test.name}: FORBIDDEN (403) - May need specific permissions`);
                    results.push({ name: test.name, status: 'FORBIDDEN', code: 403 });
                } else {
                    console.log(`❌ ${test.name}: FAILED`);
                    if (error.response) {
                        console.log(`📊 Status: ${error.response.status}`);
                        console.log(`📊 Error: ${error.response.data?.message || error.response.data}`);
                    } else {
                        console.log(`📊 Error: ${error.message}`);
                    }
                    results.push({ name: test.name, status: 'FAILED', code: error.response?.status || 0 });
                }
            }
        }
        
        return results;
    }

    async test2FAStatus() {
        if (!this.adminToken) {
            console.log('❌ No token available for 2FA testing');
            return false;
        }

        console.log('\n🔐 Testing 2FA System...');
        
        try {
            const response = await axios.get(`${this.baseUrl}/2fa/status`, {
                headers: {
                    'Authorization': `Bearer ${this.adminToken}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            
            console.log('✅ 2FA Status: SUCCESS');
            console.log('📊 2FA Info:', response.data);
            return true;
            
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('⚠️ 2FA System: ENDPOINT NOT FOUND - May not be implemented');
            } else {
                console.log('❌ 2FA Status: FAILED');
                if (error.response) {
                    console.log('📊 Status:', error.response.status);
                    console.log('📊 Response:', error.response.data);
                } else {
                    console.log('📊 Error:', error.message);
                }
            }
            return false;
        }
    }

    async testAdminOperations() {
        if (!this.adminToken) {
            console.log('❌ No token available for admin operations testing');
            return false;
        }

        console.log('\n👑 Testing Admin Operations...');
        
        const adminOperations = [
            {
                name: 'Create User',
                method: 'POST',
                endpoint: '/users',
                data: {
                    name: 'Test User',
                    email: 'testuser@company.com',
                    password: 'TestPass123',
                    role: 'user'
                }
            },
            {
                name: 'Create Product',
                method: 'POST',
                endpoint: '/products',
                data: {
                    name: 'Test Product',
                    sku: 'TEST-001',
                    barcode: '1234567890123',
                    price: 99.99
                }
            }
        ];

        const results = [];
        
        for (const operation of adminOperations) {
            try {
                console.log(`\n🔍 Testing ${operation.name}...`);
                
                const response = await axios({
                    method: operation.method,
                    url: `${this.baseUrl}${operation.endpoint}`,
                    data: operation.data,
                    headers: {
                        'Authorization': `Bearer ${this.adminToken}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000
                });
                
                console.log(`✅ ${operation.name}: SUCCESS (${response.status})`);
                console.log(`📊 Response:`, response.data);
                results.push({ name: operation.name, status: 'SUCCESS', code: response.status });
                
            } catch (error) {
                if (error.response && error.response.status === 409) {
                    console.log(`⚠️ ${operation.name}: ALREADY EXISTS (409)`);
                    results.push({ name: operation.name, status: 'EXISTS', code: 409 });
                } else if (error.response && error.response.status === 404) {
                    console.log(`⚠️ ${operation.name}: ENDPOINT NOT FOUND (404)`);
                    results.push({ name: operation.name, status: 'NOT_FOUND', code: 404 });
                } else {
                    console.log(`❌ ${operation.name}: FAILED`);
                    if (error.response) {
                        console.log(`📊 Status: ${error.response.status}`);
                        console.log(`📊 Error: ${error.response.data?.message || error.response.data}`);
                    } else {
                        console.log(`📊 Error: ${error.message}`);
                    }
                    results.push({ name: operation.name, status: 'FAILED', code: error.response?.status || 0 });
                }
            }
        }
        
        return results;
    }

    async runCompleteTest() {
        console.log('🚀 Starting Complete Admin Token Authentication Test...');
        console.log('='.repeat(80));
        
        // Step 1: Test Connection
        const connected = await this.testConnection();
        if (!connected) {
            console.log('\n❌ Cannot proceed - API not accessible');
            return;
        }
        
        // Step 2: Login Admin
        const loginSuccess = await this.loginAdmin();
        if (!loginSuccess) {
            console.log('\n❌ Cannot proceed - Admin login failed');
            return;
        }
        
        // Step 3: Test Token Authentication
        const tokenResults = await this.testTokenAuthentication();
        
        // Step 4: Test 2FA
        await this.test2FAStatus();
        
        // Step 5: Test Admin Operations
        const adminResults = await this.testAdminOperations();
        
        // Summary
        this.printSummary(tokenResults, adminResults);
    }

    printSummary(tokenResults, adminResults) {
        console.log('\n' + '='.repeat(80));
        console.log('📋 ADMIN TOKEN AUTHENTICATION TEST SUMMARY');
        console.log('='.repeat(80));
        
        console.log(`🔗 API URL: ${this.baseUrl}`);
        console.log(`👤 Admin Email: ${ADMIN_CREDENTIALS.email}`);
        console.log(`🎫 Token: ${this.adminToken ? 'Generated Successfully' : 'Failed'}`);
        
        if (tokenResults) {
            console.log('\n📊 Token Authentication Results:');
            tokenResults.forEach(result => {
                const icon = result.status === 'SUCCESS' ? '✅' : 
                           result.status === 'NOT_FOUND' ? '⚠️' : 
                           result.status === 'FORBIDDEN' ? '⚠️' : '❌';
                console.log(`   ${icon} ${result.name}: ${result.status} (${result.code})`);
            });
        }
        
        if (adminResults) {
            console.log('\n👑 Admin Operations Results:');
            adminResults.forEach(result => {
                const icon = result.status === 'SUCCESS' ? '✅' : 
                           result.status === 'EXISTS' ? '⚠️' : 
                           result.status === 'NOT_FOUND' ? '⚠️' : '❌';
                console.log(`   ${icon} ${result.name}: ${result.status} (${result.code})`);
            });
        }
        
        const totalTests = (tokenResults?.length || 0) + (adminResults?.length || 0);
        const successfulTests = [
            ...(tokenResults || []).filter(r => r.status === 'SUCCESS'),
            ...(adminResults || []).filter(r => r.status === 'SUCCESS')
        ].length;
        
        console.log('\n' + '='.repeat(80));
        console.log(`🎯 OVERALL: ${successfulTests}/${totalTests} tests successful`);
        
        if (this.adminToken) {
            console.log('\n🎉 ADMIN AUTHENTICATION WORKING!');
            console.log('\n🔑 Token for API calls:');
            console.log(`Authorization: Bearer ${this.adminToken}`);
            console.log('\n📝 Usage Example:');
            console.log(`curl -H "Authorization: Bearer ${this.adminToken}" ${this.baseUrl}/users`);
        } else {
            console.log('\n❌ ADMIN AUTHENTICATION FAILED');
            console.log('Please check credentials and server status');
        }
        
        console.log('='.repeat(80));
    }
}

// Run the test
const tester = new AdminTokenTester();
tester.runCompleteTest().catch(console.error);