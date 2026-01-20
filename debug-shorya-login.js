const axios = require('axios');
const https = require('https');

// Ignore SSL certificate errors for testing
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

const API_BASE = 'https://16.171.197.86.nip.io';

async function debugShoryaLogin() {
    console.log('🔍 Debug Shorya Login...\n');

    try {
        console.log('Testing login with shorya@company.com / shorya123...');
        
        const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
            email: 'shorya@company.com',
            password: 'shorya123'
        }, { httpsAgent });

        console.log('Response:', loginResponse.data);

    } catch (error) {
        console.log('❌ Login failed');
        console.log('Status:', error.response?.status);
        console.log('Response:', error.response?.data);
        
        // Try with admin login to verify server is working
        console.log('\n🔍 Testing admin login for comparison...');
        try {
            const adminResponse = await axios.post(`${API_BASE}/api/auth/login`, {
                email: 'admin@company.com',
                password: 'admin@123'
            }, { httpsAgent });
            
            console.log('✅ Admin login works:', adminResponse.data.success);
        } catch (adminError) {
            console.log('❌ Admin login also failed:', adminError.response?.data);
        }
    }
}

debugShoryaLogin();