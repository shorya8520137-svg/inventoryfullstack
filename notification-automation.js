/**
 * NOTIFICATION SYSTEM AUTOMATION SCRIPT
 * Complete automation for deployment, testing, and verification
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const util = require('util');

const execAsync = util.promisify(exec);

class NotificationAutomation {
    constructor() {
        this.serverIP = '16.171.141.4';
        this.keyPath = 'C:\\Users\\Admin\\awsconection.pem';
        this.projectPath = '/home/ubuntu/inventoryfullstack';
        this.results = {
            steps: [],
            success: false,
            errors: [],
            summary: {}
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
        console.log(logMessage);
        
        this.results.steps.push({
            timestamp,
            type,
            message
        });
    }

    async runCommand(command, description) {
        this.log(`Starting: ${description}`, 'info');
        
        try {
            const { stdout, stderr } = await execAsync(command);
            
            if (stderr && !stderr.includes('Warning')) {
                this.log(`Command stderr: ${stderr}`, 'warn');
            }
            
            this.log(`Completed: ${description}`, 'success');
            return { success: true, output: stdout, error: stderr };
        } catch (error) {
            this.log(`Failed: ${description} - ${error.message}`, 'error');
            this.results.errors.push({
                step: description,
                error: error.message
            });
            return { success: false, error: error.message };
        }
    }

    async sshCommand(command, description) {
        const sshCmd = `ssh -i "${this.keyPath}" ubuntu@${this.serverIP} "${command}"`;
        return await this.runCommand(sshCmd, description);
    }

    async step1_UpdateCode() {
        this.log('=== STEP 1: UPDATE CODE ON SERVER ===', 'info');
        
        const commands = [
            {
                cmd: `cd ${this.projectPath} && git pull origin main`,
                desc: 'Pull latest code from GitHub'
            },
            {
                cmd: `cd ${this.projectPath} && npm install`,
                desc: 'Install/update dependencies'
            }
        ];

        for (const { cmd, desc } of commands) {
            const result = await this.sshCommand(cmd, desc);
            if (!result.success) {
                return false;
            }
        }
        
        return true;
    }

    async step2_TestDatabase() {
        this.log('=== STEP 2: TEST DATABASE CONNECTION ===', 'info');
        
        const result = await this.sshCommand(
            `cd ${this.projectPath} && node check-existing-notification-tables.js`,
            'Analyze existing notification database structure'
        );
        
        return result.success;
    }

    async step3_RunNotificationTests() {
        this.log('=== STEP 3: RUN NOTIFICATION SYSTEM TESTS ===', 'info');
        
        const tests = [
            {
                cmd: `cd ${this.projectPath} && node quick-notification-test.js`,
                desc: 'Quick notification functionality test'
            },
            {
                cmd: `cd ${this.projectPath} && node test-existing-notification-system.js`,
                desc: 'Comprehensive notification system test'
            }
        ];

        let allPassed = true;
        
        for (const { cmd, desc } of tests) {
            const result = await this.sshCommand(cmd, desc);
            if (!result.success) {
                allPassed = false;
            }
        }
        
        return allPassed;
    }

    async step4_RestartServer() {
        this.log('=== STEP 4: RESTART SERVER ===', 'info');
        
        const commands = [
            {
                cmd: 'pm2 restart all',
                desc: 'Restart all PM2 processes'
            },
            {
                cmd: 'pm2 status',
                desc: 'Check PM2 process status'
            }
        ];

        for (const { cmd, desc } of commands) {
            const result = await this.sshCommand(cmd, desc);
            if (!result.success) {
                return false;
            }
        }
        
        // Wait for server to fully restart
        this.log('Waiting 10 seconds for server to fully restart...', 'info');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        return true;
    }

    async step5_TestAPIEndpoints() {
        this.log('=== STEP 5: TEST API ENDPOINTS ===', 'info');
        
        const testScript = `
const axios = require('axios');

async function testAPIs() {
    const baseURL = 'http://localhost:3001';
    const tests = [
        { endpoint: '/api/health', method: 'GET', desc: 'Health check' },
        { endpoint: '/api/users', method: 'GET', desc: 'Users endpoint' },
        { endpoint: '/api/products', method: 'GET', desc: 'Products endpoint' }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        try {
            const response = await axios({
                method: test.method,
                url: baseURL + test.endpoint,
                timeout: 5000
            });
            
            if (response.status === 200 || response.status === 401) {
                console.log('✅', test.desc, '- Working');
                passed++;
            } else {
                console.log('❌', test.desc, '- Status:', response.status);
                failed++;
            }
        } catch (error) {
            console.log('❌', test.desc, '- Error:', error.message);
            failed++;
        }
    }
    
    console.log('API Tests Summary:', passed, 'passed,', failed, 'failed');
    return failed === 0;
}

testAPIs().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('Test error:', error.message);
    process.exit(1);
});
        `;

        // Write test script to server
        const writeResult = await this.sshCommand(
            `cd ${this.projectPath} && cat > api-test.js << 'EOF'
${testScript}
EOF`,
            'Create API test script'
        );

        if (!writeResult.success) {
            return false;
        }

        // Run API tests
        const testResult = await this.sshCommand(
            `cd ${this.projectPath} && node api-test.js`,
            'Run API endpoint tests'
        );

        return testResult.success;
    }

    async step6_TestNotificationFlow() {
        this.log('=== STEP 6: TEST COMPLETE NOTIFICATION FLOW ===', 'info');
        
        const flowTestScript = `
const ExistingSchemaNotificationService = require('./services/ExistingSchemaNotificationService');

async function testNotificationFlow() {
    console.log('🔄 Testing complete notification flow...');
    
    try {
        // Test 1: Create notification
        const notifId = await ExistingSchemaNotificationService.createNotification(
            '🤖 Automation Test',
            'Testing complete notification flow via automation',
            'system',
            {
                userId: 1,
                priority: 'high',
                data: { automation: true, timestamp: new Date().toISOString() }
            }
        );
        console.log('✅ Notification created:', notifId);
        
        // Test 2: Login notification
        const loginResult = await ExistingSchemaNotificationService.notifyUserLogin(
            1, 'Automation Test User', '192.168.1.100'
        );
        console.log('✅ Login notification:', loginResult.success ? 'Success' : 'Failed');
        
        // Test 3: Get notifications
        const notifications = await ExistingSchemaNotificationService.getUserNotifications(1, 5, 0);
        console.log('✅ Retrieved notifications:', notifications.length);
        
        console.log('🎉 Notification flow test completed successfully!');
        return true;
    } catch (error) {
        console.error('❌ Notification flow test failed:', error.message);
        return false;
    }
}

testNotificationFlow().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('Flow test error:', error.message);
    process.exit(1);
});
        `;

        // Write and run flow test
        const writeResult = await this.sshCommand(
            `cd ${this.projectPath} && cat > flow-test.js << 'EOF'
${flowTestScript}
EOF`,
            'Create notification flow test'
        );

        if (!writeResult.success) {
            return false;
        }

        const testResult = await this.sshCommand(
            `cd ${this.projectPath} && node flow-test.js`,
            'Run notification flow test'
        );

        return testResult.success;
    }

    async step7_VerifyProduction() {
        this.log('=== STEP 7: VERIFY PRODUCTION READINESS ===', 'info');
        
        const verificationScript = `
const mysql = require('mysql2/promise');

async function verifyProduction() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: '127.0.0.1',
            port: 3306,
            user: 'inventory_user',
            password: 'StrongPass@123',
            database: 'inventory_db'
        });
        
        // Check recent notifications
        const [recentNotifs] = await connection.execute(
            'SELECT COUNT(*) as count FROM notifications WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)'
        );
        
        // Check Firebase tokens
        const [tokenCount] = await connection.execute(
            'SELECT COUNT(*) as count FROM firebase_tokens WHERE is_active = 1'
        );
        
        // Check notification preferences
        const [prefCount] = await connection.execute(
            'SELECT COUNT(*) as count FROM notification_preferences'
        );
        
        console.log('📊 Production Verification:');
        console.log('   Recent notifications:', recentNotifs[0].count);
        console.log('   Active Firebase tokens:', tokenCount[0].count);
        console.log('   User preferences:', prefCount[0].count);
        
        const isReady = recentNotifs[0].count > 0;
        console.log('🚀 Production ready:', isReady ? 'YES' : 'NO');
        
        return isReady;
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        return false;
    } finally {
        if (connection) await connection.end();
    }
}

verifyProduction().then(success => {
    process.exit(success ? 0 : 1);
}).catch(error => {
    console.error('Verification error:', error.message);
    process.exit(1);
});
        `;

        const writeResult = await this.sshCommand(
            `cd ${this.projectPath} && cat > verify-production.js << 'EOF'
${verificationScript}
EOF`,
            'Create production verification script'
        );

        if (!writeResult.success) {
            return false;
        }

        const verifyResult = await this.sshCommand(
            `cd ${this.projectPath} && node verify-production.js`,
            'Run production verification'
        );

        return verifyResult.success;
    }

    async step8_CleanupTestFiles() {
        this.log('=== STEP 8: CLEANUP TEST FILES ===', 'info');
        
        const cleanupResult = await this.sshCommand(
            `cd ${this.projectPath} && rm -f api-test.js flow-test.js verify-production.js`,
            'Remove temporary test files'
        );

        return cleanupResult.success;
    }

    async generateReport() {
        this.log('=== GENERATING AUTOMATION REPORT ===', 'info');
        
        const report = {
            timestamp: new Date().toISOString(),
            success: this.results.success,
            totalSteps: this.results.steps.length,
            errors: this.results.errors.length,
            summary: this.results.summary,
            steps: this.results.steps,
            errors: this.results.errors
        };

        const reportPath = path.join(__dirname, 'notification-automation-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        this.log(`Report saved to: ${reportPath}`, 'info');
        
        // Generate summary
        console.log('\n' + '='.repeat(60));
        console.log('🤖 NOTIFICATION AUTOMATION SUMMARY');
        console.log('='.repeat(60));
        console.log(`✅ Success: ${this.results.success ? 'YES' : 'NO'}`);
        console.log(`📊 Total Steps: ${this.results.steps.length}`);
        console.log(`❌ Errors: ${this.results.errors.length}`);
        console.log(`⏱️  Duration: ${Date.now() - this.startTime}ms`);
        
        if (this.results.errors.length > 0) {
            console.log('\n❌ ERRORS:');
            this.results.errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error.step}: ${error.error}`);
            });
        }
        
        if (this.results.success) {
            console.log('\n🎉 NOTIFICATION SYSTEM IS READY FOR PRODUCTION!');
            console.log('✅ All tests passed');
            console.log('✅ Server is running');
            console.log('✅ Database is configured');
            console.log('✅ APIs are working');
            console.log('✅ Notifications are functional');
        } else {
            console.log('\n⚠️  AUTOMATION COMPLETED WITH ISSUES');
            console.log('Please review the errors above and fix them.');
        }
        
        console.log('='.repeat(60));
    }

    async run() {
        this.startTime = Date.now();
        this.log('🚀 STARTING NOTIFICATION SYSTEM AUTOMATION', 'info');
        
        const steps = [
            { fn: this.step1_UpdateCode, name: 'Update Code' },
            { fn: this.step2_TestDatabase, name: 'Test Database' },
            { fn: this.step3_RunNotificationTests, name: 'Run Notification Tests' },
            { fn: this.step4_RestartServer, name: 'Restart Server' },
            { fn: this.step5_TestAPIEndpoints, name: 'Test API Endpoints' },
            { fn: this.step6_TestNotificationFlow, name: 'Test Notification Flow' },
            { fn: this.step7_VerifyProduction, name: 'Verify Production' },
            { fn: this.step8_CleanupTestFiles, name: 'Cleanup Test Files' }
        ];

        let allSuccess = true;

        for (const step of steps) {
            try {
                const success = await step.fn.call(this);
                this.results.summary[step.name] = success ? 'PASSED' : 'FAILED';
                
                if (!success) {
                    allSuccess = false;
                    this.log(`Step failed: ${step.name}`, 'error');
                }
            } catch (error) {
                allSuccess = false;
                this.log(`Step error: ${step.name} - ${error.message}`, 'error');
                this.results.summary[step.name] = 'ERROR';
            }
        }

        this.results.success = allSuccess;
        await this.generateReport();
        
        return allSuccess;
    }
}

// Run automation if called directly
if (require.main === module) {
    const automation = new NotificationAutomation();
    automation.run().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Automation failed:', error);
        process.exit(1);
    });
}

module.exports = NotificationAutomation;