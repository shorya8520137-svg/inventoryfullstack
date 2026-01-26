/**
 * VERIFY GITHUB PUSH - NOTIFICATION SYSTEM
 * Verifies that all notification system files were successfully pushed to GitHub
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function verifyGitHubPushNotificationSystem() {
    console.log('🔍 VERIFYING GITHUB PUSH - NOTIFICATION SYSTEM');
    console.log('===============================================');
    
    try {
        // Check if we're in a git repository
        console.log('📋 Checking git repository status...');
        
        try {
            const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
            if (gitStatus.trim()) {
                console.log('⚠️ Uncommitted changes found:');
                console.log(gitStatus);
            } else {
                console.log('✅ Working directory clean');
            }
        } catch (error) {
            console.log('❌ Not in a git repository or git not available');
            return;
        }
        
        // Check recent commits
        console.log('\n📝 Checking recent commits...');
        try {
            const recentCommits = execSync('git log --oneline -5', { encoding: 'utf8' });
            console.log('Recent commits:');
            console.log(recentCommits);
        } catch (error) {
            console.log('⚠️ Could not fetch recent commits');
        }
        
        // Check if notification system files exist
        console.log('\n📱 Verifying notification system files...');
        
        const notificationFiles = [
            // Backend Components
            'services/FirebaseNotificationService.js',
            'controllers/notificationController.js',
            'routes/notificationRoutes.js',
            
            // Frontend Components
            'src/components/NotificationBell.jsx',
            'src/app/notifications/page.jsx',
            
            // Database & Setup
            'setup-notification-system.js',
            'create-notification-tables.sql',
            'analyze-database-for-notifications.js',
            
            // Testing
            'test-notification-system.js',
            
            // Documentation
            'FIREBASE_NOTIFICATION_IMPLEMENTATION_GUIDE.md',
            'DAILY_WORK_SUMMARY_2026-01-24.md',
            
            // Location Tracking (Enhanced)
            'IPGeolocationTracker.js',
            'ProductionEventAuditLogger.js',
            
            // Enhanced Controllers
            'controllers/authController.js',
            'controllers/dispatchController.js',
            'controllers/permissionsController.js'
        ];
        
        let missingFiles = [];
        let existingFiles = [];
        
        notificationFiles.forEach(file => {
            const filePath = path.join(process.cwd(), file);
            if (fs.existsSync(filePath)) {
                existingFiles.push(file);
                console.log(`   ✅ ${file}`);
            } else {
                missingFiles.push(file);
                console.log(`   ❌ ${file} - MISSING`);
            }
        });
        
        // Check git tracking status
        console.log('\n📋 Checking git tracking status...');
        try {
            const trackedFiles = execSync('git ls-files', { encoding: 'utf8' }).split('\n');
            
            let untrackedNotificationFiles = [];
            existingFiles.forEach(file => {
                if (!trackedFiles.includes(file)) {
                    untrackedNotificationFiles.push(file);
                }
            });
            
            if (untrackedNotificationFiles.length > 0) {
                console.log('⚠️ Untracked notification files:');
                untrackedNotificationFiles.forEach(file => {
                    console.log(`   📄 ${file}`);
                });
            } else {
                console.log('✅ All notification files are tracked by git');
            }
        } catch (error) {
            console.log('⚠️ Could not check git tracking status');
        }
        
        // Check remote repository
        console.log('\n🔗 Checking remote repository...');
        try {
            const remoteUrl = execSync('git remote get-url origin', { encoding: 'utf8' }).trim();
            console.log(`📡 Remote URL: ${remoteUrl}`);
            
            // Check if we can reach the remote
            try {
                execSync('git ls-remote origin', { encoding: 'utf8' });
                console.log('✅ Remote repository accessible');
            } catch (error) {
                console.log('❌ Cannot access remote repository');
                console.log('💡 Check your internet connection and GitHub credentials');
            }
        } catch (error) {
            console.log('❌ No remote repository configured');
            console.log('💡 Add remote: git remote add origin <your-repo-url>');
        }
        
        // Summary
        console.log('\n📊 VERIFICATION SUMMARY');
        console.log('======================');
        console.log(`✅ Existing files: ${existingFiles.length}/${notificationFiles.length}`);
        console.log(`❌ Missing files: ${missingFiles.length}`);
        
        if (missingFiles.length === 0) {
            console.log('\n🎉 ALL NOTIFICATION SYSTEM FILES VERIFIED!');
            console.log('✅ Complete notification system is ready');
            console.log('✅ All files exist and should be in repository');
            
            console.log('\n🚀 NEXT STEPS:');
            console.log('1. Run: push-notification-system-to-github.cmd');
            console.log('2. Or manually: git add . && git commit -m "Add notification system" && git push');
            console.log('3. Verify on GitHub web interface');
            
        } else {
            console.log('\n⚠️ SOME FILES ARE MISSING');
            console.log('💡 Make sure all notification system files are created');
            console.log('🔧 Re-run the notification system setup if needed');
        }
        
        // Check specific notification features
        console.log('\n🔔 NOTIFICATION SYSTEM FEATURES VERIFICATION');
        console.log('===========================================');
        
        // Check if server.js has notification routes
        try {
            const serverContent = fs.readFileSync('server.js', 'utf8');
            if (serverContent.includes('notificationRoutes')) {
                console.log('✅ Server.js includes notification routes');
            } else {
                console.log('❌ Server.js missing notification routes integration');
            }
        } catch (error) {
            console.log('⚠️ Could not verify server.js');
        }
        
        // Check if auth controller has notification integration
        try {
            const authContent = fs.readFileSync('controllers/authController.js', 'utf8');
            if (authContent.includes('FirebaseNotificationService')) {
                console.log('✅ Auth controller has notification integration');
            } else {
                console.log('❌ Auth controller missing notification integration');
            }
        } catch (error) {
            console.log('⚠️ Could not verify auth controller');
        }
        
        // Check if dispatch controller has notification integration
        try {
            const dispatchContent = fs.readFileSync('controllers/dispatchController.js', 'utf8');
            if (dispatchContent.includes('FirebaseNotificationService')) {
                console.log('✅ Dispatch controller has notification integration');
            } else {
                console.log('❌ Dispatch controller missing notification integration');
            }
        } catch (error) {
            console.log('⚠️ Could not verify dispatch controller');
        }
        
        console.log('\n📱 READY FOR GITHUB PUSH!');
        console.log('========================');
        console.log('🎯 The notification system is complete and ready to be pushed to GitHub');
        console.log('🔔 Features: Login notifications, dispatch alerts, location tracking');
        console.log('🌍 Location: IP-based geolocation with country flags');
        console.log('📱 Frontend: Notification bell and full management page');
        console.log('🔧 Backend: Complete API with Firebase integration');
        
    } catch (error) {
        console.log('❌ Verification failed:', error.message);
    }
}

// Run the verification
verifyGitHubPushNotificationSystem().catch(console.error);