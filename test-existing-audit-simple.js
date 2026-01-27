/**
 * Simple Test for Existing Audit System
 * This script tests the current audit system to understand how it works
 */

const axios = require('axios');
const https = require('https');

// Create axios instance with SSL bypass for testing
const api = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false // Only for testing - bypass SSL certificate issues
    }),
    timeout: 10000
});

const API_BASE = 'https://16.171.5.50.nip.io';
const ADMIN_CREDENTIALS = {
    email: 'admin@company.com',
    password: 'admin@123'
};

console.log('🔍 Testing Existing Audit System');
console.log('='.repeat(50));

async function testExistingAudit() {
    try {
        // Step 1: Login as admin
        console.log('🔐 Step 1: Admin Login');
        const loginResponse = await api.post(`${API_BASE}/api/auth/login`, ADMIN_CREDENTIALS);
        
        if (!loginResponse.data.token) {
            console.log('❌ Login failed');
            return;
        }
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        
        // Step 2: Create a test user to generate audit entry
        console.log('\n👤 Step 2: Create Test User (to generate audit)');
        const userData = {
            name: 'Audit Test User',
            email: `audittest${Date.now()}@company.com`,
            password: 'test123',
            role_id: 2,
            is_active: true
        };
        
        const createUserResponse = await api.post(`${API_BASE}/api/users`, userData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (createUserResponse.data.success) {
            console.log('✅ Test user created - this should generate audit entry');
            console.log(`📧 Email: ${userData.email}`);
        } else {
            console.log('❌ User creation failed');
        }
        
        // Step 3: Wait and check for audit logs
        console.log('\n⏳ Step 3: Waiting 3 seconds for audit to be recorded...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Step 4: Try different audit endpoints
        console.log('\n📊 Step 4: Checking Various Audit Endpoints');
        
        const auditEndpoints = [
            '/api/audit-logs',
            '/api/audit',
            '/api/logs',
            '/api/activities',
            '/api/permissions/audit-logs',
            '/api/users/audit',
            '/api/system/logs'
        ];
        
        for (const endpoint of auditEndpoints) {
            try {
                console.log(`\n🔍 Trying: ${endpoint}`);
                const response = await api.get(`${API_BASE}${endpoint}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                console.log(`✅ ${endpoint} - Status: ${response.status}`);
                console.log(`📊 Response structure:`, Object.keys(response.data));
                
                // Handle different response structures
                let logs = null;
                if (response.data.data && response.data.data.logs) {
                    logs = response.data.data.logs;
                } else if (response.data.logs) {
                    logs = response.data.logs;
                } else if (response.data.data) {
                    logs = response.data.data;
                } else if (Array.isArray(response.data)) {
                    logs = response.data;
                } else {
                    console.log(`📋 Full response:`, JSON.stringify(response.data, null, 2));
                }
                
                if (logs && Array.isArray(logs)) {
                    console.log(`📈 Found ${logs.length} audit entries`);
                    
                    // Show recent entries
                    if (logs.length > 0) {
                        console.log('📋 Recent entries:');
                        logs.slice(0, 5).forEach((log, i) => {
                            const description = log.description || log.action || log.activity || JSON.stringify(log);
                            console.log(`   ${i + 1}. ${description}`);
                        });
                        
                        // Look for our test user
                        const testEntry = logs.find(log => 
                            (log.description && log.description.includes('Audit Test User')) ||
                            (log.action && log.action.includes('CREATE')) ||
                            JSON.stringify(log).includes(userData.email)
                        );
                        
                        if (testEntry) {
                            console.log('🎯 FOUND OUR TEST ENTRY:');
                            console.log('   ', JSON.stringify(testEntry, null, 2));
                        }
                    }
                    
                    break; // Found working endpoint
                } else {
                    console.log('📊 Response is not an array of logs');
                }
            } catch (error) {
                console.log(`❌ ${endpoint} - Error: ${error.response?.status || error.message}`);
            }
        }
        
        // Step 5: Check the frontend audit page directly
        console.log('\n🌐 Step 5: Checking Frontend Audit Page');
        try {
            const frontendResponse = await api.get(`${API_BASE}/permissions`, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'text/html'
                }
            });
            
            if (frontendResponse.data.includes('audit') || frontendResponse.data.includes('Audit')) {
                console.log('✅ Frontend audit page accessible');
                
                // Look for audit data in the HTML
                if (frontendResponse.data.includes('Created user') || frontendResponse.data.includes('Deleted role')) {
                    console.log('🎯 Found audit data in frontend HTML');
                }
            }
        } catch (error) {
            console.log('❌ Frontend audit page not accessible');
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
}

console.log('🎯 Goal: Find where "Created user jiffy" entries are stored');
console.log('💡 This will help us understand your existing audit system');
console.log('='.repeat(50));

testExistingAudit();