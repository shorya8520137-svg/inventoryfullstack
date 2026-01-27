/**
 * QUICK ADMIN CREDENTIALS TEST
 * Fast test to verify admin@company.com / Admin@123 works
 */

const axios = require('axios');

async function quickAdminTest() {
    console.log('🔐 Quick Admin Credentials Test');
    console.log('================================');
    
    const credentials = {
        email: 'admin@company.com',
        password: 'Admin@123'
    };
    
    const urls = [
        'https://54.179.63.233.nip.io/api',
        'http://localhost:5000/api'
    ];
    
    for (const baseUrl of urls) {
        console.log(`\n🔍 Testing ${baseUrl}...`);
        
        try {
            // Test health first
            const healthResponse = await axios.get(`${baseUrl}/health`, { timeout: 5000 });
            console.log('✅ API Health: OK');
            
            // Test login
            const loginResponse = await axios.post(`${baseUrl}/auth/login`, credentials, {
                timeout: 10000
            });
            
            if (loginResponse.data.token) {
                console.log('✅ Admin Login: SUCCESS');
                console.log(`👤 User: ${loginResponse.data.user?.name}`);
                console.log(`🎫 Token: ${loginResponse.data.token.substring(0, 20)}...`);
                
                // Test a protected endpoint
                const usersResponse = await axios.get(`${baseUrl}/users`, {
                    headers: { 'Authorization': `Bearer ${loginResponse.data.token}` },
                    timeout: 5000
                });
                
                console.log(`✅ Protected Endpoint: SUCCESS (${usersResponse.data.length || 0} users)`);
                console.log('\n🎉 ADMIN CREDENTIALS WORKING!');
                return true;
                
            } else {
                console.log('❌ Admin Login: No token received');
            }
            
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                console.log('⚠️ API not accessible');
            } else if (error.response) {
                console.log(`❌ Error: ${error.response.status} - ${error.response.data?.message || error.response.data}`);
            } else {
                console.log(`❌ Error: ${error.message}`);
            }
        }
    }
    
    console.log('\n❌ Admin credentials test failed on all endpoints');
    return false;
}

quickAdminTest().catch(console.error);