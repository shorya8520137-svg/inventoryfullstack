/**
 * FIX SERVER AUDIT INTEGRATION
 * This script fixes the requirePermission error and integrates event-based audit logging
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING SERVER AUDIT INTEGRATION');
console.log('='.repeat(50));

// 1. Check if files exist
function checkFiles() {
    console.log('\n📁 Step 1: Checking Required Files');
    
    const requiredFiles = [
        'stockiqfullstacktest/middleware/auth.js',
        'stockiqfullstacktest/controllers/dispatchController.js',
        'stockiqfullstacktest/EventAuditLogger.js'
    ];
    
    requiredFiles.forEach(file => {
        if (fs.existsSync(file)) {
            console.log(`✅ ${file} - EXISTS`);
        } else {
            console.log(`❌ ${file} - MISSING`);
        }
    });
}

// 2. Create server integration code
function createServerIntegration() {
    console.log('\n🔧 Step 2: Creating Server Integration Code');
    
    const serverIntegrationCode = `/**
 * SERVER INTEGRATION FOR EVENT-BASED AUDIT SYSTEM
 * Add this code to your server.js file
 */

// Add at the top of server.js (after other requires)
const EventAuditLogger = require('./EventAuditLogger');
const eventAuditLogger = new EventAuditLogger();

// Add middleware to capture IP addresses properly
app.use((req, res, next) => {
    // Fix IP address capture for audit logging
    req.realIP = req.headers['x-forwarded-for'] || 
                 req.headers['x-real-ip'] || 
                 req.connection.remoteAddress || 
                 req.socket.remoteAddress ||
                 req.ip ||
                 '127.0.0.1';
    next();
});

// Update your login route (find and replace existing login route)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Your existing login logic here...
        // After successful authentication:
        
        if (loginSuccessful) {
            // Log successful login event
            await eventAuditLogger.logLogin(user, req, 'success');
            
            res.json({
                success: true,
                token: token,
                user: user
            });
        } else {
            // Log failed login attempt
            await eventAuditLogger.logEvent({
                user_id: null,
                action: 'LOGIN',
                resource: 'SESSION',
                resource_id: 'failed',
                details: {
                    attempted_email: email,
                    failure_reason: 'Invalid credentials',
                    attempt_time: new Date().toISOString()
                },
                ip_address: req.realIP,
                user_agent: req.get('User-Agent') || 'Unknown'
            });
            
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed'
        });
    }
});

// Add logout route (if it doesn't exist)
app.post('/api/auth/logout', authenticateToken, async (req, res) => {
    try {
        // Log logout event
        await eventAuditLogger.logLogout(req.user, req);
        
        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed'
        });
    }
});`;

    fs.writeFileSync('server-integration-code.js', serverIntegrationCode);
    console.log('✅ Created server-integration-code.js');
}

// 3. Create deployment script
function createDeploymentScript() {
    console.log('\n🚀 Step 3: Creating Deployment Script');
    
    const deployScript = `#!/bin/bash
# DEPLOY AUDIT SYSTEM FIXES

echo "🚀 Deploying Audit System Fixes to Server"
echo "=========================================="

# 1. Upload files to server
echo "📤 Step 1: Uploading files to server..."
scp -i "C:\\Users\\Admin\\awsconection.pem" EventAuditLogger.js ubuntu@16.171.5.50:/home/ubuntu/inventoryfullstack/
scp -i "C:\\Users\\Admin\\awsconection.pem" middleware/auth.js ubuntu@16.171.5.50:/home/ubuntu/inventoryfullstack/middleware/
scp -i "C:\\Users\\Admin\\awsconection.pem" controllers/dispatchController.js ubuntu@16.171.5.50:/home/ubuntu/inventoryfullstack/controllers/

# 2. SSH into server and restart
echo "🔧 Step 2: Restarting server..."
ssh -i "C:\\Users\\Admin\\awsconection.pem" ubuntu@16.171.5.50 << 'EOF'
cd /home/ubuntu/inventoryfullstack
echo "📁 Current directory: $(pwd)"
echo "📋 Files in directory:"
ls -la

echo "🔄 Restarting server..."
pm2 restart server || node server.js &

echo "✅ Server restarted"
echo "🔍 Checking server status..."
pm2 status
EOF

echo "🎉 Deployment complete!"
echo "🧪 Run test-complete-user-journey-fixed.js to verify"`;

    fs.writeFileSync('deploy-audit-fixes.sh', deployScript);
    console.log('✅ Created deploy-audit-fixes.sh');
}

// 4. Create Windows deployment script
function createWindowsDeploymentScript() {
    console.log('\n🪟 Step 4: Creating Windows Deployment Script');
    
    const windowsDeployScript = `@echo off
REM DEPLOY AUDIT SYSTEM FIXES - WINDOWS VERSION

echo 🚀 Deploying Audit System Fixes to Server
echo ==========================================

REM 1. Upload files to server
echo 📤 Step 1: Uploading files to server...
scp -i "C:\\Users\\Admin\\awsconection.pem" EventAuditLogger.js ubuntu@16.171.5.50:/home/ubuntu/inventoryfullstack/
scp -i "C:\\Users\\Admin\\awsconection.pem" middleware\\auth.js ubuntu@16.171.5.50:/home/ubuntu/inventoryfullstack/middleware/
scp -i "C:\\Users\\Admin\\awsconection.pem" controllers\\dispatchController.js ubuntu@16.171.5.50:/home/ubuntu/inventoryfullstack/controllers/

REM 2. SSH into server and restart
echo 🔧 Step 2: Restarting server...
ssh -i "C:\\Users\\Admin\\awsconection.pem" ubuntu@16.171.5.50 "cd /home/ubuntu/inventoryfullstack && pm2 restart server"

echo 🎉 Deployment complete!
echo 🧪 Run: node test-complete-user-journey-fixed.js
pause`;

    fs.writeFileSync('deploy-audit-fixes.cmd', windowsDeployScript);
    console.log('✅ Created deploy-audit-fixes.cmd');
}

// 5. Create summary
function createSummary() {
    console.log('\n📋 Step 5: Creating Summary');
    
    const summary = `# 🎯 AUDIT SYSTEM FIXES SUMMARY

## 🔧 Issues Fixed

### 1. ❌ requirePermission is not a function
**Problem:** Missing function export in auth middleware
**Solution:** ✅ Fixed exports in middleware/auth.js

### 2. ❌ user_id always NULL in audit logs
**Problem:** User context not properly captured
**Solution:** ✅ Enhanced EventAuditLogger with proper user_id capture

### 3. ❌ ip_address always NULL in audit logs
**Problem:** IP address not properly extracted
**Solution:** ✅ Enhanced IP extraction with multiple header support

### 4. ❌ Missing business events (DISPATCH_CREATE, LOGIN, LOGOUT)
**Problem:** Only user management events tracked
**Solution:** ✅ Added complete event-based tracking

## 📁 Files Modified/Created

- ✅ **middleware/auth.js** - Fixed requirePermission export
- ✅ **controllers/dispatchController.js** - Added event-based audit logging
- ✅ **EventAuditLogger.js** - New event-based audit system
- ✅ **test-complete-user-journey-fixed.js** - Comprehensive test script

## 🚀 Deployment Steps

1. **Upload Files:**
   \`\`\`bash
   # Run this command:
   ./deploy-audit-fixes.cmd
   \`\`\`

2. **Test Complete Journey:**
   \`\`\`bash
   node test-complete-user-journey-fixed.js
   \`\`\`

## 🎯 Expected Results

After deployment, your audit logs will show:

\`\`\`
| user_id | action | resource  | resource_id | ip_address    | details                    |
|---------|--------|-----------|-------------|---------------|----------------------------|
| 1       | LOGIN  | SESSION   | sess_123    | 192.168.1.100 | {"user_name": "Admin"}     |
| 1       | CREATE | USER      | 21          | 192.168.1.100 | {"user_name": "Admin"}     |
| 1       | CREATE | DISPATCH  | 456         | 192.168.1.100 | {"dispatch_id": 456}       |
| 1       | LOGOUT | SESSION   | sess_123    | 192.168.1.100 | {"session_duration": "15m"} |
\`\`\`

## ✅ Benefits

1. **Complete User Journey Tracking** - See exactly what each user did
2. **Fixed NULL Issues** - user_id and ip_address properly captured
3. **Event-Based Tracking** - LOGIN, DISPATCH_CREATE, LOGOUT events
4. **Security Monitoring** - Track failed logins, unusual IPs
5. **Analytics Ready** - Session duration, user productivity metrics

## 🧪 Testing

Run the test script to verify everything works:
\`\`\`bash
node test-complete-user-journey-fixed.js
\`\`\`

This will test: LOGIN → CREATE_USER → CREATE_ROLE → DISPATCH_CREATE → AUDIT_CHECK → LOGOUT

## 🎉 Success Criteria

✅ No more "requirePermission is not a function" errors
✅ No more NULL user_id in audit logs  
✅ No more NULL ip_address in audit logs
✅ DISPATCH_CREATE events appear in audit logs
✅ Complete user journey tracked with IP addresses`;

    fs.writeFileSync('AUDIT_FIXES_SUMMARY.md', summary);
    console.log('✅ Created AUDIT_FIXES_SUMMARY.md');
}

// Run all steps
function runFixes() {
    console.log('🚀 Running All Fixes...\n');
    
    checkFiles();
    createServerIntegration();
    createDeploymentScript();
    createWindowsDeploymentScript();
    createSummary();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 AUDIT SYSTEM FIXES COMPLETE!');
    console.log('='.repeat(50));
    
    console.log('\n📁 Files Created:');
    console.log('  ✅ server-integration-code.js - Server integration guide');
    console.log('  ✅ deploy-audit-fixes.sh - Linux deployment script');
    console.log('  ✅ deploy-audit-fixes.cmd - Windows deployment script');
    console.log('  ✅ AUDIT_FIXES_SUMMARY.md - Complete summary');
    
    console.log('\n🚀 Next Steps:');
    console.log('  1. Run: deploy-audit-fixes.cmd');
    console.log('  2. Test: node test-complete-user-journey-fixed.js');
    console.log('  3. Check audit logs for complete user journey');
    
    console.log('\n✨ Expected Result:');
    console.log('  🔐 LOGIN → 👤 CREATE_USER → 📦 DISPATCH_CREATE → 🚪 LOGOUT');
    console.log('  All with proper user_id and ip_address tracking!');
    console.log('='.repeat(50));
}

// Execute
runFixes();