// Disable SSL certificate validation
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const API_BASE = 'https://16.171.161.150.nip.io';

console.log('Starting test...');
console.log('API Base:', API_BASE);

async function testLogin() {
    try {
        console.log('\nTesting admin login...');
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@company.com',
                password: 'admin@123'
            })
        });
        
        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Success:', data.success);
        console.log('Token:', data.token ? 'Received' : 'Not received');
        
        if (data.success && data.token) {
            console.log('\n✅ Login test PASSED');
            return data.token;
        } else {
            console.log('\n❌ Login test FAILED');
            return null;
        }
    } catch (error) {
        console.log('\n❌ Login test ERROR:', error.message);
        return null;
    }
}

testLogin().then(() => {
    console.log('\nTest complete');
    process.exit(0);
});
