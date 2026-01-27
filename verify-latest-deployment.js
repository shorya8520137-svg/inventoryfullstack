const https = require('https');

// Disable SSL verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const FRONTEND_URL = 'https://stockiqfullstacktest.vercel.app';
const API_URL = 'https://16.171.5.50.nip.io';

console.log('🚀 VERIFYING LATEST DEPLOYMENT');
console.log('='.repeat(50));
console.log(`🌐 Frontend: ${FRONTEND_URL}`);
console.log(`📡 API: ${API_URL}`);
console.log(`📅 Deployment Time: ${new Date().toISOString()}`);

async function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const req = https.request(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Deployment-Verification',
                ...options.headers
            },
            timeout: 15000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const responseTime = Date.now() - startTime;
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ 
                        success: true, 
                        statusCode: res.statusCode, 
                        data: jsonData,
                        responseTime
                    });
                } catch (e) {
                    resolve({ 
                        success: true, 
                        statusCode: res.statusCode, 
                        data: data.substring(0, 150),
                        responseTime
                    });
                }
            });
        });
        
        req.on('error', error => {
            const responseTime = Date.now() - startTime;
            reject({ success: false, error: error.message, responseTime });
        });
        
        req.on('timeout', () => {
            req.destroy();
            reject({ success: false, error: 'Timeout', responseTime: 15000 });
        });
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

async function verifyDeployment() {
    const results = {
        frontend: false,
        api: false,
        auth: false
    };

    console.log('\n1️⃣ Verifying Frontend Deployment...');
    try {
        const frontend = await makeRequest(FRONTEND_URL);
        console.log(`✅ Frontend: ${frontend.statusCode} (${frontend.responseTime}ms)`);
        
        if (frontend.statusCode === 200) {
            console.log(`📄 Content: ${frontend.data.includes('hunyhuny') ? 'Branding detected' : 'HTML loaded'}`);
            results.frontend = true;
        }
    } catch (error) {
        console.log(`❌ Frontend: ${error.error} (${error.responseTime}ms)`);
    }

    console.log('\n2️⃣ Verifying API Connection...');
    try {
        const health = await makeRequest(`${API_URL}/`);
        console.log(`✅ API Health: ${health.statusCode} (${health.responseTime}ms)`);
        
        if (health.statusCode === 200 && health.data.status === 'OK') {
            console.log(`📊 Service: ${health.data.service || 'Inventory Backend'}`);
            results.api = true;
        }
    } catch (error) {
        console.log(`❌ API Health: ${error.error} (${error.responseTime}ms)`);
    }

    console.log('\n3️⃣ Verifying Authentication System...');
    try {
        const login = await makeRequest(`${API_URL}/api/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
                email: 'admin@company.com',
                password: 'admin@123'
            })
        });
        
        console.log(`✅ Login: ${login.statusCode} (${login.responseTime}ms)`);
        
        if (login.data.success && login.data.token) {
            console.log(`🔑 JWT Token: Generated successfully`);
            console.log(`👤 User: ${login.data.user.email}`);
            console.log(`🏢 Role: ${login.data.user.role || 'Admin'}`);
            results.auth = true;
        } else {
            console.log(`❌ Auth failed: ${login.data.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.log(`❌ Authentication: ${error.error} (${error.responseTime}ms)`);
    }

    return results;
}

async function main() {
    const results = await verifyDeployment();
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 DEPLOYMENT VERIFICATION RESULTS');
    console.log('='.repeat(50));
    
    const checks = [
        { name: 'Frontend Deployment', status: results.frontend },
        { name: 'API Backend', status: results.api },
        { name: 'Authentication System', status: results.auth }
    ];
    
    checks.forEach(check => {
        const icon = check.status ? '✅' : '❌';
        const status = check.status ? 'WORKING' : 'FAILED';
        console.log(`${icon} ${check.name}: ${status}`);
    });
    
    const passedChecks = checks.filter(c => c.status).length;
    const totalChecks = checks.length;
    
    console.log('\n' + '-'.repeat(40));
    console.log(`🎯 System Status: ${passedChecks}/${totalChecks} components operational`);
    
    if (passedChecks === totalChecks) {
        console.log('\n🎉 DEPLOYMENT VERIFICATION SUCCESSFUL!');
        console.log('🚀 Your inventory management system is LIVE!');
        
        console.log('\n📋 Access Information:');
        console.log(`   🌐 Application: ${FRONTEND_URL}`);
        console.log(`   📡 API Endpoint: ${API_URL}`);
        
        console.log('\n🔐 Login Details:');
        console.log('   📧 Email: admin@company.com');
        console.log('   🔑 Password: admin@123');
        
        console.log('\n🎯 Ready for Phase 1 Operations:');
        console.log('   ✅ Product Management');
        console.log('   ✅ Inventory Tracking');
        console.log('   ✅ User Authentication');
        console.log('   ✅ API Integration');
        
    } else {
        console.log('\n⚠️  DEPLOYMENT VERIFICATION ISSUES');
        console.log('🔧 Some components need attention');
    }
    
    console.log(`\n⏰ Verification completed: ${new Date().toISOString()}`);
}

main().catch(console.error);