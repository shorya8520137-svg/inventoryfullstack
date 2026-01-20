const fs = require('fs');

// Read the current auth controller
const authControllerPath = 'controllers/authController.js';
let authController = fs.readFileSync(authControllerPath, 'utf8');

console.log('🔧 FIXING AUTH CONTROLLER PERMISSIONS');
console.log('====================================');

// Fix 1: In login function, return full permission objects instead of just names
const loginPermissionsFix = `                        user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role_id: user.role_id,
                        role_name: user.role_name,
                        role_display_name: user.role_display_name,
                        permissions: permissions // Return full permission objects
                    }`;

// Replace the old user object in login response
authController = authController.replace(
    /user: \{[\s\S]*?permissions: permissions\.map\(p => p\.name\)[\s\S]*?\}/,
    loginPermissionsFix
);

// Fix 2: In getCurrentUser function, also return full permission objects
const getCurrentUserPermissionsFix = `                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role_id: user.role_id,
                        role_name: user.role_name,
                        role_display_name: user.role_display_name,
                        last_login: user.last_login,
                        login_count: user.login_count,
                        permissions: permissions // Return full permission objects
                    }`;

// Replace the old user object in getCurrentUser response
authController = authController.replace(
    /user: \{[\s\S]*?permissions: permissions\.map\(p => p\.name\)[\s\S]*?\}/g,
    getCurrentUserPermissionsFix
);

// Write the fixed auth controller
fs.writeFileSync(authControllerPath, authController);

console.log('✅ Auth controller fixed!');
console.log('');
console.log('Changes made:');
console.log('1. Login response now returns full permission objects');
console.log('2. getCurrentUser response now returns full permission objects');
console.log('3. Added role_id and role_name to user objects');
console.log('');
console.log('This should fix the "0 permissions" issue in the frontend.');

// Create deployment script
const deployScript = `@echo off
echo Deploying auth controller fix...

echo Copying fixed auth controller to server...
scp -i "C:\\Users\\Admin\\awsconection.pem" controllers/authController.js ubuntu@13.48.248.180:/home/ubuntu/inventoryfullstack/controllers/

echo Restarting server...
ssh -i "C:\\Users\\Admin\\awsconection.pem" ubuntu@13.48.248.180 "cd /home/ubuntu/inventoryfullstack && pm2 restart server"

echo Testing login with fixed permissions...
node test-fixed-permissions-login.js

echo Auth controller fix deployed!
pause`;

fs.writeFileSync('deploy-auth-controller-fix.cmd', deployScript);

console.log('📦 Created deployment script: deploy-auth-controller-fix.cmd');
console.log('🚀 Run this script to deploy the fix to the server');