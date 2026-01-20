const axios = require('axios');
const https = require('https');

// Create an agent that ignores SSL certificate errors
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

async function testCoreAPIs() {
    const baseURL = 'https://16.171.197.86.nip.io';
    
    console.log('🧪 Testing Core Business APIs...\n');
    
    try {
        // First login to get token
        console.log('1. Getting auth token...');
        const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
            email: 'admin@company.com',
            password: 'admin@123'
        }, {
            timeout: 10000,
            httpsAgent: httpsAgent,
            headers: { 'Content-Type': 'application/json' }
        });
        
        const token = loginResponse.data.token;
        console.log('✅ Token received');
        
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        // Test core APIs
        const tests = [
            // Products API
            { name: 'Products - Get All', url: '/api/products', method: 'GET' },
            { name: 'Products - Get Categories', url: '/api/products/categories/all', method: 'GET' },
            { name: 'Products - Get Warehouses', url: '/api/products/warehouses', method: 'GET' },
            
            // Inventory API
            { name: 'Inventory - Get All', url: '/api/inventory', method: 'GET' },
            { name: 'Inventory - Get by Warehouse', url: '/api/inventory/by-warehouse?warehouse=BLR_WH', method: 'GET' },
            
            // Orders API
            { name: 'Orders - Get All', url: '/api/orders', method: 'GET' },
            
            // Dispatch API
            { name: 'Dispatch - Get All', url: '/api/dispatch', method: 'GET' },
            
            // Returns API
            { name: 'Returns - Get All', url: '/api/returns', method: 'GET' },
            
            // Timeline API
            { name: 'Timeline - Get Summary', url: '/api/timeline', method: 'GET' },
        ];
        
        console.log('\n🔍 Testing Core APIs:\n');
        
        for (const test of tests) {
            try {
                const response = await axios({
                    method: test.method,
                    url: `${baseURL}${test.url}`,
                    headers,
                    httpsAgent,
                    timeout: 10000
                });
                
                console.log(`✅ ${test.name}: ${response.status} - ${response.data?.data?.length || 'OK'}`);
                
            } catch (error) {
                console.log(`❌ ${test.name}: ${error.response?.status || 'ERROR'} - ${error.response?.data?.message || error.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Login failed:', error.response?.data || error.message);
    }
}

testCoreAPIs();