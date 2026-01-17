// URGENT FIX FOR ADMIN LOGIN
// This script will create a fixed version of the login function

const fs = require('fs');

console.log('🔧 Creating urgent fix for admin authentication...');

// Read the current permissions controller
const controllerPath = 'controllers/permissionsController.js';
let controllerContent = fs.readFileSync(controllerPath, 'utf8');

// Find the login function and replace the password verification logic
const oldPasswordLogic = `                // Verify password - check both password and password_hash columns
                let isValidPassword = false;
                if (user.password_hash) {
                    isValidPassword = await bcrypt.compare(password, user.password_hash);
                } else if (user.password) {
                    // For plain text passwords (temporary - should be hashed)
                    isValidPassword = (password === user.password);
                }`;

const newPasswordLogic = `                // Verify password - check both password and password_hash columns
                console.log('🔍 Password verification for:', user.email);
                console.log('🔍 User password from DB:', user.password);
                console.log('🔍 User password_hash from DB:', user.password_hash);
                console.log('🔍 Input password:', password);
                
                let isValidPassword = false;
                if (user.password_hash) {
                    console.log('🔍 Using bcrypt comparison...');
                    isValidPassword = await bcrypt.compare(password, user.password_hash);
                } else if (user.password) {
                    console.log('🔍 Using plain text comparison...');
                    isValidPassword = (password === user.password);
                    console.log('🔍 Plain text comparison result:', isValidPassword);
                }
                
                console.log('🔍 Final password validation result:', isValidPassword);`;

// Replace the password logic
const updatedContent = controllerContent.replace(oldPasswordLogic, newPasswordLogic);

// Write the updated controller
fs.writeFileSync(controllerPath, updatedContent);

console.log('✅ Updated permissions controller with debug logging');
console.log('📝 Now restart the server and try login again');
console.log('🔍 Check server logs for detailed password verification info');

// Also create a simple test script
const testScript = `
// Test admin login directly
const https = require('https');

const loginData = {
    email: 'admin@company.com',
    password: 'admin@123'
};

const options = {
    hostname: '16.171.161.150.nip.io',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    }
};

console.log('🔐 Testing admin login...');

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
        console.log('📊 Response Status:', res.statusCode);
        console.log('📋 Response:', JSON.parse(data));
    });
});

req.on('error', (error) => {
    console.error('❌ Request failed:', error);
});

req.write(JSON.stringify(loginData));
req.end();
`;

fs.writeFileSync('test-admin-login-direct.js', testScript);

console.log('✅ Created test script: test-admin-login-direct.js');
console.log('\n🚀 NEXT STEPS:');
console.log('1. Restart server: node server.js');
console.log('2. Run test: node test-admin-login-direct.js');
console.log('3. Check server logs for debug info');