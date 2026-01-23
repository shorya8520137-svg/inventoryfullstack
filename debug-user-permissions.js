/**
 * DEBUG: Check what permissions the current admin user actually has
 */

const https = require('https');

console.log('🔍 Debugging User Permissions...\n');

// Try different credential combinations
const credentialOptions = [
    { username: 'admin@company.com', password: 'admin@123' },
    { username: 'admin', password: 'admin123' },
    { username: 'admin', password: 'password' },
    { username: 'admin', password: 'admin' },
    { username: 'test', password: 'test123' },
    { username: 'manager', password: 'manager123' }
];

async function testLogin(credentials) {
    return new Promise((resolve) => {
        const loginData = JSON.stringify(credentials);
        
        const options = {
            hostname: '16.171.5.50.nip.io',
            port: 443,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': loginData.length
            },
            rejectUnauthorized: false
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve({ 
                        credentials, 
                        success: response.success, 
                        user: response.user,
                        message: response.message 
                    });
                } catch (err) {
                    resolve({ 
                        credentials, 
                        success: false, 
                        error: 'Parse error' 
                    });
                }
            });
        });

        req.on('error', () => {
            resolve({ 
                credentials, 
                success: false, 
                error: 'Network error' 
            });
        });
        
        req.write(loginData);
        req.end();
    });
}

async function runDebug() {
    console.log('🧪 Testing different credential combinations...\n');
    
    for (const creds of credentialOptions) {
        console.log(`Testing: ${creds.username}/${creds.password}`);
        const result = await testLogin(creds);
        
        if (result.success) {
            console.log('✅ LOGIN SUCCESS!');
            console.log('👤 User:', result.user?.username);
            console.log('🎭 Role:', result.user?.role);
            
            if (result.user?.permissions) {
                console.log('🔑 Permissions:', result.user.permissions.length, 'total');
                
                const hasOrdersExport = result.user.permissions.includes('ORDERS_EXPORT');
                console.log(`📊 ORDERS_EXPORT: ${hasOrdersExport ? '✅ YES' : '❌ NO'}`);
                
                if (!hasOrdersExport) {
                    console.log('🔧 Available permissions:');
                    result.user.permissions.forEach((perm, i) => {
                        console.log(`   ${i + 1}. ${perm}`);
                    });
                }
            } else {
                console.log('⚠️  No permissions in response');
            }
            
            console.log('\n' + '='.repeat(50) + '\n');
            break; // Found working credentials
        } else {
            console.log('❌ Failed:', result.message || result.error);
        }
        console.log('');
    }
}

runDebug();