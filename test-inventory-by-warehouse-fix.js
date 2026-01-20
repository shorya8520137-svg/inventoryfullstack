const axios = require('axios');
const https = require('https');

const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

async function testInventoryByWarehouse() {
    const baseURL = 'https://16.171.197.86.nip.io';
    
    try {
        // Login first
        const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
            email: 'admin@company.com',
            password: 'admin@123'
        }, {
            httpsAgent,
            headers: { 'Content-Type': 'application/json' }
        });
        
        const token = loginResponse.data.token;
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
        
        console.log('🧪 Testing Inventory By Warehouse Endpoints...\n');
        
        // Test different URL formats
        const tests = [
            '/api/inventory/by-warehouse',
            '/api/inventory/by-warehouse/BLR_WH',
            '/api/inventory/by-warehouse?warehouse=BLR_WH',
            '/api/inventory?warehouse=BLR_WH'
        ];
        
        for (const url of tests) {
            try {
                const response = await axios.get(`${baseURL}${url}`, {
                    headers,
                    httpsAgent,
                    timeout: 10000
                });
                
                console.log(`✅ ${url}: ${response.status} - ${response.data?.data?.length || 'OK'}`);
                
            } catch (error) {
                console.log(`❌ ${url}: ${error.response?.status || 'ERROR'} - ${error.response?.data?.message || error.message}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Login failed:', error.response?.data || error.message);
    }
}

testInventoryByWarehouse();