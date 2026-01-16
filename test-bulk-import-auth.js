/**
 * TEST BULK IMPORT AUTH
 * Tests the products bulk import progress API
 */

// Disable SSL certificate validation
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const fs = require('fs');
const API_BASE = 'https://16.171.161.150.nip.io';

const logFile = 'BULK_IMPORT_AUTH_TEST.log';
fs.writeFileSync(logFile, ''); // Clear log file

function log(message) {
    const line = message + '\n';
    console.log(message);
    fs.appendFileSync(logFile, line);
}

async function runTests() {
    log('================================================================================');
    log('TESTING BULK IMPORT AUTH FIX');
    log('================================================================================');
    log('API Base: ' + API_BASE);
    log('Start Time: ' + new Date().toISOString());
    log('');

    // Login first
    log('SETUP: Admin Login');
    log('--------------------------------------------------------------------------------');
    
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: 'admin@company.com',
            password: 'admin@123'
        })
    });
    
    const loginData = await loginResponse.json();

    if (loginResponse.status === 200 && loginData.token) {
        const adminToken = loginData.token;
        log('✅ Admin login successful');
        log('Token: ' + adminToken.substring(0, 20) + '...');
        log('');
        
        // Test bulk import progress API
        log('================================================================================');
        log('TEST: Bulk Import Progress API');
        log('================================================================================');
        log('POST /api/products/bulk/import/progress');
        log('');
        
        // Create a simple CSV file content
        const csvContent = `barcode,product_name,variant,category,unit_cost,selling_price
TEST001,Test Product 1,Size M,Electronics,100,150
TEST002,Test Product 2,Size L,Electronics,200,250`;
        
        // Create FormData
        const FormData = require('form-data');
        const formData = new FormData();
        formData.append('file', Buffer.from(csvContent), {
            filename: 'test-products.csv',
            contentType: 'text/csv'
        });
        
        try {
            const response = await fetch(`${API_BASE}/api/products/bulk/import/progress`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${adminToken}`,
                    ...formData.getHeaders()
                },
                body: formData
            });
            
            log('Response Status: ' + response.status);
            log('Response Headers: ' + JSON.stringify(Object.fromEntries(response.headers.entries())));
            log('');
            
            if (response.status === 401) {
                log('❌ FAIL - Still getting 401 Unauthorized');
                log('   Authorization header is not being accepted by backend');
            } else if (response.status === 200) {
                log('✅ PASS - Status 200 OK');
                log('   Authorization header is working!');
                
                // Try to read SSE stream
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let receivedData = '';
                
                log('');
                log('SSE Stream Data:');
                log('--------------------------------------------------------------------------------');
                
                for (let i = 0; i < 5; i++) { // Read first 5 chunks
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value);
                    receivedData += chunk;
                    log(chunk);
                }
                
                log('--------------------------------------------------------------------------------');
                log('');
                log('✅ SSE streaming is working correctly!');
            } else {
                log('⚠️  Unexpected status: ' + response.status);
                const text = await response.text();
                log('Response: ' + text);
            }
        } catch (error) {
            log('❌ ERROR: ' + error.message);
            log('Stack: ' + error.stack);
        }
        
    } else {
        log('❌ Admin login failed - Cannot continue tests');
        process.exit(1);
    }

    log('');
    log('================================================================================');
    log('Test Complete - ' + new Date().toISOString());
    log('================================================================================');
    log('');
    log('✅ Log file saved to: ' + logFile);
}

runTests().catch(error => {
    log('FATAL ERROR: ' + error.message);
    console.error(error);
    process.exit(1);
});
