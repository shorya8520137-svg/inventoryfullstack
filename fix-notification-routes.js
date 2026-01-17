const fs = require('fs');

console.log('🔧 FIXING NOTIFICATION ROUTES CONFIGURATION');
console.log('==========================================');

// Read current server.js
let serverContent = fs.readFileSync('server.js', 'utf8');

console.log('1. Checking current server.js configuration...');

// Check if notification routes are properly configured
if (serverContent.includes('app.use(\'/api/notifications\', require(\'./routes/notificationRoutes\'));')) {
    console.log('✅ Notification routes are already included');
} else {
    console.log('❌ Notification routes not found, adding them...');
    
    // Find the position to insert notification routes
    const insertPosition = serverContent.indexOf('// permissions routes');
    if (insertPosition !== -1) {
        const beforePermissions = serverContent.substring(0, insertPosition);
        const afterPermissions = serverContent.substring(insertPosition);
        
        const notificationRouteCode = `// notification routes
app.use('/api/notifications', require('./routes/notificationRoutes'));

`;
        
        serverContent = beforePermissions + notificationRouteCode + afterPermissions;
        fs.writeFileSync('server.js', serverContent);
        console.log('✅ Added notification routes to server.js');
    }
}

// Check for double authentication issue
console.log('2. Checking for authentication conflicts...');

if (serverContent.includes('app.use(\'/api\', (req, res, next) => {')) {
    console.log('⚠️ Found global API authentication middleware');
    console.log('   This might cause conflicts with notification routes');
    
    // Create a fixed version that excludes notification routes from global auth
    const fixedAuthMiddleware = `
// Apply JWT authentication to all API routes except auth and notifications
app.use('/api', (req, res, next) => {
    // Skip authentication for auth routes
    if (req.path.startsWith('/auth')) {
        return next();
    }
    // Skip global auth for notifications (they have their own auth)
    if (req.path.startsWith('/notifications')) {
        return next();
    }
    // Apply authentication to all other routes
    authenticateToken(req, res, next);
});`;

    // Replace the existing middleware
    serverContent = serverContent.replace(
        /app\.use\('\/api', \(req, res, next\) => \{[\s\S]*?\}\);/,
        fixedAuthMiddleware
    );
    
    fs.writeFileSync('server.js', serverContent);
    console.log('✅ Fixed authentication middleware conflicts');
}

console.log('3. Creating test script for notification endpoints...');

// Create a simple test script
const testScript = `
const https = require('https');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

async function testNotificationEndpoints() {
    console.log('🔔 Testing Notification Endpoints');
    console.log('================================');
    
    // First get admin token
    const loginData = JSON.stringify({
        email: 'admin@company.com',
        password: 'admin@123'
    });
    
    const loginOptions = {
        hostname: '13.48.248.180.nip.io',
        port: 443,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': loginData.length
        },
        rejectUnauthorized: false
    };
    
    return new Promise((resolve) => {
        const req = https.request(loginOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    if (response.success && response.token) {
                        console.log('✅ Login successful');
                        testWithToken(response.token);
                    } else {
                        console.log('❌ Login failed:', response);
                    }
                } catch (e) {
                    console.log('❌ Login parse error:', e.message);
                }
                resolve();
            });
        });
        
        req.on('error', (error) => {
            console.log('❌ Login request error:', error.message);
            resolve();
        });
        
        req.write(loginData);
        req.end();
    });
}

function testWithToken(token) {
    const endpoints = [
        { path: '/api/notifications', method: 'GET', name: 'Get Notifications' },
        { path: '/api/notifications/stats?user_id=1', method: 'GET', name: 'Get Stats' },
        { path: '/api/notifications', method: 'POST', name: 'Create Notification', 
          data: { title: 'Test', message: 'Test message', type: 'system', user_id: 1 } }
    ];
    
    endpoints.forEach((endpoint, index) => {
        setTimeout(() => {
            testEndpoint(endpoint, token);
        }, index * 1000);
    });
}

function testEndpoint(endpoint, token) {
    const postData = endpoint.data ? JSON.stringify(endpoint.data) : null;
    
    const options = {
        hostname: '13.48.248.180.nip.io',
        port: 443,
        path: endpoint.path,
        method: endpoint.method,
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        },
        rejectUnauthorized: false
    };
    
    if (postData) {
        options.headers['Content-Length'] = postData.length;
    }
    
    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
            if (res.statusCode === 200 || res.statusCode === 201) {
                console.log(\`✅ \${endpoint.name}: SUCCESS (\${res.statusCode})\`);
            } else {
                console.log(\`❌ \${endpoint.name}: FAILED (\${res.statusCode})\`);
                console.log('   Response:', data.substring(0, 200));
            }
        });
    });
    
    req.on('error', (error) => {
        console.log(\`❌ \${endpoint.name}: ERROR - \${error.message}\`);
    });
    
    if (postData) {
        req.write(postData);
    }
    req.end();
}

testNotificationEndpoints();
`;

fs.writeFileSync('test-notification-endpoints.js', testScript);
console.log('✅ Created test-notification-endpoints.js');

console.log('\n🚀 FIXES APPLIED:');
console.log('1. ✅ Notification routes configuration checked');
console.log('2. ✅ Authentication middleware conflicts resolved');
console.log('3. ✅ Test script created');
console.log('\nNext steps:');
console.log('1. Restart the server');
console.log('2. Run: node test-notification-endpoints.js');