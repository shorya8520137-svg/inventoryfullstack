/**
 * UPDATE API IP ADDRESS IN ALL FILES
 * Script to update the old IP address to the new one in all test files
 */

const fs = require('fs');
const path = require('path');

const OLD_IP = '16.171.196.15';
const NEW_IP = '16.171.5.50';

// Files to update (from grep search results)
const filesToUpdate = [
    'verify-latest-deployment.js',
    'test-timeline-ordering.js',
    'test-status-update-fix.js',
    'test-simple-status-update.js',
    'test-server-version.js',
    'test-self-transfer-status-fix.js',
    'test-role-deletion-fix.js',
    'test-returns-with-awb.js',
    'test-production-final.js',
    'test-production-deployment.js',
    'test-notification-with-token-terminal.js',
    'test-no-pagination-fix.js',
    'test-new-api-endpoint.js',
    'test-http-simple.js',
    'test-http-nip.js',
    'test-http-endpoint.js',
    'test-frontend-filters.js',
    'test-frontend-api-connection.js',
    'test-find-correct-port.js',
    'test-final-verification.js',
    'test-export-functionality.js',
    'test-export-complete-data.js',
    'test-dispatch-frontend-issue.js',
    'test-complete-notification-flow.js',
    'test-bulk-upload-permissions.js',
    'test-all-endpoints.js',
    'test-admin-permissions.js',
    'fix-admin-export-permission.js',
    'debug-user-permissions.js'
];

console.log('🔄 Updating API IP address in test files...');
console.log(`   Old IP: ${OLD_IP}`);
console.log(`   New IP: ${NEW_IP}`);
console.log('=' .repeat(50));

let updatedCount = 0;
let errorCount = 0;

filesToUpdate.forEach(fileName => {
    try {
        const filePath = path.join(__dirname, fileName);
        
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Replace all occurrences of the old IP with the new IP
            const originalContent = content;
            content = content.replace(new RegExp(OLD_IP.replace(/\./g, '\\.'), 'g'), NEW_IP);
            
            if (content !== originalContent) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`✅ Updated: ${fileName}`);
                updatedCount++;
            } else {
                console.log(`⚪ No changes needed: ${fileName}`);
            }
        } else {
            console.log(`⚠️ File not found: ${fileName}`);
        }
    } catch (error) {
        console.log(`❌ Error updating ${fileName}: ${error.message}`);
        errorCount++;
    }
});

console.log('=' .repeat(50));
console.log(`📊 Summary:`);
console.log(`   Files updated: ${updatedCount}`);
console.log(`   Errors: ${errorCount}`);
console.log(`   Total files processed: ${filesToUpdate.length}`);

if (errorCount === 0) {
    console.log('🎉 All files updated successfully!');
} else {
    console.log('⚠️ Some files had errors. Please check manually.');
}