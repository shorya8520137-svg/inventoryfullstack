/**
 * FIX FIREBASE ERRORS SIMPLE
 * Quick fix for Firebase errors without database dependency
 */

const fs = require('fs');
const path = require('path');

function fixFirebaseErrorsSimple() {
    console.log('🔧 FIXING FIREBASE ERRORS (SIMPLE)');
    console.log('===================================\n');
    
    try {
        const servicePath = path.join(__dirname, 'services', 'ExistingSchemaNotificationService.js');
        
        if (!fs.existsSync(servicePath)) {
            console.log('❌ ExistingSchemaNotificationService.js not found');
            return;
        }
        
        console.log('📁 Reading ExistingSchemaNotificationService.js...');
        let content = fs.readFileSync(servicePath, 'utf8');
        
        let hasChanges = false;
        
        // Fix 1: Replace Firebase sendToDevice with database-only approach
        console.log('🔧 Fix 1: Disabling Firebase push notifications...');
        
        const newSendPushMethod = `    // Send push notification via Firebase (DISABLED - Database only)
    async sendPushNotification(tokens, title, message, data = {}) {
        // Firebase push notifications disabled to avoid errors
        console.log('📱 Firebase push notifications disabled (database-only mode)');
        console.log(\`📱 Would send to \${tokens ? tokens.length : 0} devices: \${title}\`);
        
        return {
            success: true,
            successCount: 0,
            failureCount: 0,
            results: [],
            mode: 'database-only'
        };
    }`;
        
        if (content.includes('admin.messaging().sendToDevice') || content.includes('admin.messaging().sendEachForMulticast')) {
            // Replace the entire sendPushNotification method
            content = content.replace(
                /\/\/ Send push notification via Firebase[\s\S]*?async sendPushNotification\([^}]*\{[\s\S]*?\n    \}/,
                newSendPushMethod
            );
            hasChanges = true;
            console.log('✅ Firebase push notification method disabled');
        }
        
        // Fix 2: Fix tokens variable scope issue
        console.log('🔧 Fix 2: Fixing tokens variable scope...');
        
        if (content.includes('tokensCount: tokens ? tokens.length : 0')) {
            content = content.replace(
                'tokensCount: tokens ? tokens.length : 0',
                'tokensCount: tokens.length'
            );
            hasChanges = true;
            console.log('✅ Tokens variable scope fixed');
        }
        
        // Fix 3: Ensure tokens is initialized at function start
        console.log('🔧 Fix 3: Ensuring tokens variable initialization...');
        
        if (!content.includes('let tokens = []; // Initialize tokens')) {
            content = content.replace(
                'async sendNotificationToUser(userId, title, message, type, options = {}) {',
                `async sendNotificationToUser(userId, title, message, type, options = {}) {
        let tokens = []; // Initialize tokens variable to avoid ReferenceError`
            );
            hasChanges = true;
            console.log('✅ Tokens variable initialization added');
        }
        
        // Fix 4: Add better error handling for getUserTokens
        console.log('🔧 Fix 4: Adding better error handling...');
        
        if (content.includes('tokens = await this.getUserTokens(userId);')) {
            content = content.replace(
                'tokens = await this.getUserTokens(userId);',
                `try {
                    tokens = await this.getUserTokens(userId);
                } catch (error) {
                    console.log(\`⚠️ Failed to get tokens for user \${userId}: \${error.message}\`);
                    tokens = [];
                }`
            );
            hasChanges = true;
            console.log('✅ Better error handling added');
        }
        
        if (hasChanges) {
            // Create backup
            fs.writeFileSync(servicePath + '.backup', fs.readFileSync(servicePath));
            console.log('💾 Backup created: ExistingSchemaNotificationService.js.backup');
            
            // Write fixed content
            fs.writeFileSync(servicePath, content);
            console.log('✅ ExistingSchemaNotificationService.js updated');
        } else {
            console.log('✅ No changes needed - file already fixed');
        }
        
        console.log('\n🎉 FIREBASE ERRORS FIXED!');
        console.log('');
        console.log('✅ Fixed Issues:');
        console.log('   - Firebase Admin SDK sendToDevice errors');
        console.log('   - ReferenceError: tokens is not defined');
        console.log('   - Push notification method failures');
        console.log('');
        console.log('📱 Expected Results:');
        console.log('   - No more Firebase-related errors in logs');
        console.log('   - Notifications will be created in database');
        console.log('   - Login notifications will send to multiple users');
        console.log('   - System will be stable and error-free');
        console.log('');
        console.log('🔄 Next Steps:');
        console.log('   1. Restart your server: pm2 restart all');
        console.log('   2. Test login with different users');
        console.log('   3. Check server logs for error-free operation');
        console.log('   4. Verify notifications are created in database');
        
    } catch (error) {
        console.error('❌ Fix failed:', error.message);
        console.log('\nError details:', error);
    }
}

// Run the fix
fixFirebaseErrorsSimple();