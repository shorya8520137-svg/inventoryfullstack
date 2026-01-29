/**
 * Simple server connection test
 */

const http = require('http');

// Test different possible ports
const ports = [5000, 3000, 8000, 8080, 3001];

function testPort(port) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: port,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 2000
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    port: port,
                    status: res.statusCode,
                    response: data,
                    success: true
                });
            });
        });

        req.on('error', (error) => {
            resolve({
                port: port,
                error: error.message,
                success: false
            });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({
                port: port,
                error: 'Timeout',
                success: false
            });
        });

        // Send test login data
        req.write(JSON.stringify({
            email: 'admin@company.com',
            password: 'admin@123'
        }));
        
        req.end();
    });
}

async function testAllPorts() {
    console.log('🔍 Testing server connection on different ports...\n');
    
    for (const port of ports) {
        console.log(`Testing port ${port}...`);
        const result = await testPort(port);
        
        if (result.success) {
            console.log(`✅ Port ${port}: Server responding (Status: ${result.status})`);
            if (result.response) {
                try {
                    const jsonResponse = JSON.parse(result.response);
                    console.log(`   Response: ${JSON.stringify(jsonResponse, null, 2)}`);
                } catch (e) {
                    console.log(`   Response: ${result.response.substring(0, 100)}...`);
                }
            }
        } else {
            console.log(`❌ Port ${port}: ${result.error}`);
        }
        console.log('');
    }
}

testAllPorts().catch(console.error);