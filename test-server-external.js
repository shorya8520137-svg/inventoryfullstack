// Test AWS server using built-in fetch (Node.js 18+)
const SERVER_URL = 'http://16.171.161.150:5000';

console.log('🔍 TESTING AWS SERVER EXTERNALLY');
console.log('================================');
console.log('Server URL:', SERVER_URL);
console.log('');

async function testServer() {
    try {
        // Test 1: Health Check
        console.log('1️⃣ Health Check...');
        const healthResponse = await fetch(`${SERVER_URL}/`);
        const healthData = await healthResponse.json();
        console.log('✅ Health Check:', healthData);
        console.log('');

        // Test 2: Login Test
        console.log('2️⃣ Login Test...');
        
        // Try with email field
        try {
            const loginResponse = await fetch(`${SERVER_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: 'admin@admin.com',
                    password: 'admin123'
                })
            });
            
            const loginData = await loginResponse.json();
            console.log('✅ Login Response:', loginData);
            
            if (loginData.token) {
                console.log('✅ Token received!');
                
                // Test 3: Protected Route
                console.log('');
                console.log('3️⃣ Testing Protected Route...');
                const productsResponse = await fetch(`${SERVER_URL}/api/products`, {
                    headers: {
                        'Authorization': `Bearer ${loginData.token}`
                    }
                });
                
                if (productsResponse.ok) {
                    const productsData = await productsResponse.json();
                    console.log('✅ Products API works:', productsData?.length || 0, 'records');
                } else {
                    console.log('❌ Products API failed:', productsResponse.status, productsResponse.statusText);
                }
            } else {
                console.log('❌ No token received');
            }
            
        } catch (loginError) {
            console.log('❌ Login failed:', loginError.message);
        }
        
        console.log('');
        console.log('🎉 EXTERNAL TEST COMPLETED!');
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('🔥 SERVER NOT ACCESSIBLE FROM OUTSIDE!');
            console.log('Check:');
            console.log('1. Server is running');
            console.log('2. Port 5000 is open in security group');
            console.log('3. Firewall allows port 5000');
        }
    }
}

testServer();