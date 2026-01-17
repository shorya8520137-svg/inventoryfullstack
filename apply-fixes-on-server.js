#!/usr/bin/env node

const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

console.log('🚀 APPLYING CONTROLLER AND TEST FIXES ON SERVER');
console.log('================================================');

// Function to execute shell commands
function runCommand(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                reject(error);
                return;
            }
            if (stderr) {
                console.error(`Stderr: ${stderr}`);
            }
            console.log(stdout);
            resolve(stdout);
        });
    });
}

async function applyFixes() {
    try {
        console.log('🛑 Step 1: Stopping server...');
        await runCommand('pkill -f "node server.js" || true');
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log('📦 Step 2: Installing dependencies...');
        await runCommand('npm install bcryptjs axios');

        console.log('🔧 Step 3: Fixing permissions controller...');
        
        // Read the permissions controller
        const controllerPath = 'controllers/permissionsController.js';
        let controllerContent = fs.readFileSync(controllerPath, 'utf8');
        
        // Backup original
        fs.writeFileSync(controllerPath + '.backup', controllerContent);
        
        // Apply callback fixes
        controllerContent = controllerContent.replace(
            /PermissionsController\.createAuditLog\(([^)]+)\);/g,
            'PermissionsController.createAuditLog($1, () => {});'
        );
        
        // Write fixed controller
        fs.writeFileSync(controllerPath, controllerContent);
        console.log('✅ Controller fixes applied');

        console.log('🔧 Step 4: Fixing test file...');
        
        // Read the test file
        const testPath = 'comprehensive-nested-user-journey-test.js';
        let testContent = fs.readFileSync(testPath, 'utf8');
        
        // Backup original
        fs.writeFileSync(testPath + '.backup', testContent);
        
        // Fix return API calls
        testContent = testContent.replace(
            /product_name: dispatchData\.product_name,/g,
            'product_type: dispatchData.product_name,\n            warehouse: dispatchData.warehouse,'
        );
        
        testContent = testContent.replace(
            /product_name: multiDispatchData\.product_name,/g,
            'product_type: multiDispatchData.product_name,\n            warehouse: multiDispatchData.warehouse,'
        );
        
        testContent = testContent.replace(
            /product_name: amitDispatchData\.product_name,/g,
            'product_type: amitDispatchData.product_name,\n            warehouse: amitDispatchData.warehouse,'
        );
        
        // Fix field names
        testContent = testContent.replace(/reason: 'Customer return',/g, "return_reason: 'Customer return',");
        testContent = testContent.replace(/return_type: 'customer_return'/g, "condition: 'good'");
        
        testContent = testContent.replace(/reason: 'Quality issue',/g, "return_reason: 'Quality issue',");
        testContent = testContent.replace(/return_type: 'quality_issue'/g, "condition: 'good'");
        
        testContent = testContent.replace(/reason: 'Wrong item',/g, "return_reason: 'Wrong item',");
        testContent = testContent.replace(/return_type: 'wrong_item'/g, "condition: 'good'");
        
        // Write fixed test
        fs.writeFileSync(testPath, testContent);
        console.log('✅ Test file fixes applied');

        console.log('🚀 Step 5: Starting server...');
        exec('nohup node server.js > server.log 2>&1 &');
        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log('🔍 Step 6: Checking server status...');
        const serverCheck = await runCommand('pgrep -f "node server.js" || echo "No server process found"');
        
        if (serverCheck.trim() && serverCheck.trim() !== 'No server process found') {
            console.log('✅ Server is running');
            await runCommand('ps aux | grep "node server.js" | grep -v grep');
        } else {
            console.log('❌ Server failed to start');
            console.log('📄 Server logs:');
            await runCommand('tail -20 server.log');
            return;
        }

        console.log('🧪 Step 7: Running comprehensive test...');
        await runCommand('node comprehensive-nested-user-journey-test.js');

        console.log('📄 Step 8: Recent server logs:');
        await runCommand('tail -10 server.log');

        console.log('🎉 Fix and test completed successfully!');

    } catch (error) {
        console.error('❌ Error during fix application:', error.message);
        process.exit(1);
    }
}

applyFixes();