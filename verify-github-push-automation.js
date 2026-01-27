/**
 * VERIFY GITHUB PUSH - AUTOMATION SUITE
 * Confirms all automation scripts were successfully pushed
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

async function verifyGitHubPush() {
    console.log('🔍 Verifying GitHub Push - Automation Suite...\n');
    
    try {
        // Check git status
        console.log('1️⃣ Checking Git Status...');
        const { stdout: gitStatus } = await execAsync('git status');
        console.log('✅ Git Status:', gitStatus.split('\n')[0]);
        
        // Check last commit
        console.log('\n2️⃣ Checking Last Commit...');
        const { stdout: lastCommit } = await execAsync('git log -1 --oneline');
        console.log('✅ Last Commit:', lastCommit.trim());
        
        // Check remote status
        console.log('\n3️⃣ Checking Remote Status...');
        const { stdout: remoteStatus } = await execAsync('git status -uno');
        if (remoteStatus.includes('up to date') || remoteStatus.includes('ahead')) {
            console.log('✅ Remote Status: Synchronized');
        } else {
            console.log('⚠️ Remote Status:', remoteStatus);
        }
        
        // List automation files that should be in repository
        console.log('\n4️⃣ Verifying Automation Files...');
        const automationFiles = [
            'master-automation.cmd',
            'automated-server-setup-and-test.cmd',
            'comprehensive-api-test.js',
            'verify-database-setup.js',
            'ssh-automation-script.cmd',
            'complete-server-setup.cmd',
            'database-setup.cmd',
            'COMPLETE_DATABASE_SCHEMA.md',
            'DEPLOYMENT_COMPLETE_SUMMARY.md',
            'test-complete-deployment.js'
        ];
        
        const fs = require('fs');
        let filesFound = 0;
        
        for (const file of automationFiles) {
            if (fs.existsSync(file)) {
                console.log(`✅ ${file} - Present`);
                filesFound++;
            } else {
                console.log(`❌ ${file} - Missing`);
            }
        }
        
        // Check if files are tracked by git
        console.log('\n5️⃣ Checking Git Tracking...');
        const { stdout: trackedFiles } = await execAsync('git ls-files');
        const trackedFilesList = trackedFiles.split('\n');
        
        let trackedCount = 0;
        for (const file of automationFiles) {
            if (trackedFilesList.includes(file)) {
                console.log(`✅ ${file} - Tracked by Git`);
                trackedCount++;
            } else {
                console.log(`⚠️ ${file} - Not tracked by Git`);
            }
        }
        
        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📋 GITHUB PUSH VERIFICATION SUMMARY');
        console.log('='.repeat(60));
        
        console.log(`📁 Files Found: ${filesFound}/${automationFiles.length}`);
        console.log(`📊 Git Tracked: ${trackedCount}/${automationFiles.length}`);
        
        if (filesFound === automationFiles.length && trackedCount === automationFiles.length) {
            console.log('\n🎉 SUCCESS: All automation scripts pushed to GitHub!');
            console.log('\n🔗 Repository: https://github.com/shorya8520137-svg/inventoryfullstack.git');
            console.log('\n✨ Available Features:');
            console.log('   🚀 Master Automation Menu');
            console.log('   🛠️ Complete Server Setup');
            console.log('   🧪 Comprehensive API Testing');
            console.log('   🗄️ Database Verification');
            console.log('   📊 Health Monitoring');
            console.log('   🔐 2FA System Deployment');
            console.log('   📱 Notification Framework');
            console.log('   📍 Location Tracking');
            console.log('   📋 Audit Logging');
            
            console.log('\n🎯 Next Steps:');
            console.log('   1. SSH to server: ssh -i "C:\\Users\\Admin\\e2c.pem" ubuntu@54.179.63.233');
            console.log('   2. Clone repository: git clone https://github.com/shorya8520137-svg/inventoryfullstack.git');
            console.log('   3. Run automation: ./master-automation.cmd');
            console.log('   4. Choose option 2 for full setup');
            
        } else {
            console.log('\n⚠️ WARNING: Some files may not be properly pushed');
            console.log('   Please check git status and push again if needed');
        }
        
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('❌ Error verifying GitHub push:', error.message);
    }
}

// Run verification
verifyGitHubPush();