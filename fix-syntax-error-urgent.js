/**
 * FIX SYNTAX ERROR URGENT
 * Fix the await syntax error in dispatch controller
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING SYNTAX ERROR IN DISPATCH CONTROLLER');
console.log('='.repeat(50));

const dispatchControllerPath = path.join(__dirname, 'controllers', 'dispatchController.js');

console.log('📁 Reading dispatch controller...');

try {
    let content = fs.readFileSync(dispatchControllerPath, 'utf8');
    
    console.log('🔍 Looking for syntax errors...');
    
    // Find and fix the await issue
    let fixed = false;
    
    // Pattern 1: await eventAuditLogger.logDispatchCreate without async function
    if (content.includes('await eventAuditLogger.logDispatchCreate')) {
        console.log('❌ Found: await eventAuditLogger.logDispatchCreate (without async function)');
        
        // Remove await and add .catch() for error handling
        content = content.replace(
            /await eventAuditLogger\.logDispatchCreate\(/g,
            'eventAuditLogger.logDispatchCreate('
        );
        
        // Ensure .catch() is present for promise handling
        content = content.replace(
            /eventAuditLogger\.logDispatchCreate\([^)]+\)[^.]/g,
            (match) => {
                if (!match.includes('.catch(')) {
                    return match.replace(/\)([^.])/g, ').catch(err => console.error("Audit logging failed:", err))$1');
                }
                return match;
            }
        );
        
        fixed = true;
        console.log('✅ Fixed: Removed await and ensured proper error handling');
    }
    
    // Pattern 2: Check if functions need to be async
    const functionMatches = content.match(/exports\.createDispatch\s*=\s*\([^)]*\)\s*=>\s*{/);
    if (functionMatches) {
        console.log('🔍 Found createDispatch function');
        
        // If it contains await but is not async, make it async
        const functionStart = content.indexOf(functionMatches[0]);
        const functionEnd = content.indexOf('};', functionStart);
        const functionBody = content.substring(functionStart, functionEnd);
        
        if (functionBody.includes('await ') && !functionMatches[0].includes('async')) {
            console.log('❌ Function contains await but is not async');
            content = content.replace(
                /exports\.createDispatch\s*=\s*\(/,
                'exports.createDispatch = async ('
            );
            fixed = true;
            console.log('✅ Made createDispatch function async');
        }
    }
    
    // Pattern 3: Fix any other await issues
    const awaitMatches = content.match(/await\s+[^(]+\(/g);
    if (awaitMatches) {
        console.log(`🔍 Found ${awaitMatches.length} await calls`);
        awaitMatches.forEach(match => {
            console.log(`   - ${match.trim()}`);
        });
    }
    
    if (fixed) {
        console.log('💾 Writing fixed file...');
        fs.writeFileSync(dispatchControllerPath, content);
        console.log('✅ Dispatch controller fixed!');
        
        console.log('\n📋 WHAT WAS CHANGED:');
        console.log('Before (BROKEN):');
        console.log('  await eventAuditLogger.logDispatchCreate(...)');
        console.log('');
        console.log('After (FIXED):');
        console.log('  eventAuditLogger.logDispatchCreate(...).catch(err => console.error("Audit logging failed:", err))');
        
        console.log('\n🚀 NEXT STEPS:');
        console.log('1. Push to git: git add . && git commit -m "Fix dispatch controller syntax error" && git push origin main');
        console.log('2. SSH to server: ssh -i "C:\\Users\\Admin\\awsconection.pem" ubuntu@16.171.5.50');
        console.log('3. Pull changes: cd /home/ubuntu/inventoryfullstack && git pull origin main');
        console.log('4. Restart server: pm2 restart server');
        console.log('5. Check logs: pm2 logs server');
        
    } else {
        console.log('✅ No syntax errors found in dispatch controller');
        console.log('💡 The error might be in a different file or already fixed');
    }
    
} catch (error) {
    console.log('❌ Error fixing file:', error.message);
}

console.log('\n🧪 TESTING RECOMMENDATION:');
console.log('Run: node test-audit-api-now.js');
console.log('This will show you the current state of the audit system');