/**
 * DEBUG EXPORT VS GET ALL
 * Compare the results between getAllDispatches and exportDispatches
 */

const https = require('https');

// Test configuration
const API_BASE = 'https://16.171.196.15.nip.io';
const TEST_CREDENTIALS = {
    email: 'admin@company.com',
    password: 'admin@123'
};

// Disable SSL verification for testing
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

async function makeRequest(path, options = {}) {
    return new Promise((resolve, reject) => {
        const url = `${API_BASE}${path}`;
        console.log(`🔗 Making request to: ${url}`);
        
        const req = https.request(url, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            rejectUnauthorized: false
        }, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    if (res.headers['content-type']?.includes('text/csv')) {
                        // CSV response
                        resolve({
                            statusCode: res.statusCode,
                            headers: res.headers,
                            data: data,
                            isCSV: true
                        });
                    } else {
                        // JSON response
                        const jsonData = JSON.parse(data);
                        resolve({
                            statusCode: res.statusCode,
                            headers: res.headers,
                            data: jsonData
                        });
                    }
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: data,
                        parseError: error.message
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        if (options.body) {
            req.write(JSON.stringify(options.body));
        }
        
        req.end();
    });
}

async function debugExportVsGetAll() {
    console.log('🔍 Debugging Export vs GetAll Discrepancy');
    console.log('=' .repeat(60));
    
    try {
        // Step 1: Login to get token
        console.log('1️⃣ Logging in...');
        const loginResponse = await makeRequest('/api/auth/login', {
            method: 'POST',
            body: TEST_CREDENTIALS
        });
        
        if (loginResponse.statusCode !== 200 || !loginResponse.data.success) {
            throw new Error(`Login failed: ${JSON.stringify(loginResponse.data)}`);
        }
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        
        // Step 2: Get all dispatches
        console.log('\n2️⃣ Getting all dispatches via getAllDispatches...');
        const allDispatchesResponse = await makeRequest('/api/order-tracking', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (allDispatchesResponse.statusCode !== 200) {
            throw new Error(`Failed to get dispatches: ${JSON.stringify(allDispatchesResponse.data)}`);
        }
        
        const allRecords = allDispatchesResponse.data.data;
        console.log(`✅ getAllDispatches returned: ${allRecords.length} records`);
        
        // Analyze the records by source type
        const dispatchRecords = allRecords.filter(r => r.source_type === 'dispatch');
        const selfTransferRecords = allRecords.filter(r => r.source_type === 'self_transfer');
        
        console.log(`   - Dispatch records: ${dispatchRecords.length}`);
        console.log(`   - Self-transfer records: ${selfTransferRecords.length}`);
        
        // Step 3: Get export data
        console.log('\n3️⃣ Getting export data via exportDispatches...');
        const exportResponse = await makeRequest('/api/order-tracking/export', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (exportResponse.statusCode !== 200) {
            throw new Error(`Export failed: ${JSON.stringify(exportResponse.data)}`);
        }
        
        if (!exportResponse.isCSV) {
            throw new Error('Export did not return CSV data');
        }
        
        // Count CSV rows (subtract 1 for header)
        const csvLines = exportResponse.data.split('\n').filter(line => line.trim());
        const csvRecordCount = csvLines.length - 1; // Subtract header row
        
        console.log(`✅ exportDispatches returned: ${csvRecordCount} records`);
        
        // Step 4: Analyze the discrepancy
        console.log('\n4️⃣ Analysis:');
        console.log(`   Expected (getAllDispatches): ${allRecords.length}`);
        console.log(`   Actual (exportDispatches): ${csvRecordCount}`);
        console.log(`   Missing: ${allRecords.length - csvRecordCount} records`);
        
        if (allRecords.length !== csvRecordCount) {
            console.log('\n❌ DISCREPANCY FOUND!');
            console.log('   Possible causes:');
            console.log('   1. Export function not including self-transfers');
            console.log('   2. Different WHERE clauses between functions');
            console.log('   3. Server not restarted after code changes');
            console.log('   4. Different JOIN logic');
        } else {
            console.log('\n✅ COUNTS MATCH! Export is working correctly.');
        }
        
        // Step 5: Show sample data from both
        console.log('\n5️⃣ Sample data comparison:');
        console.log('getAllDispatches first 3 records:');
        allRecords.slice(0, 3).forEach((record, index) => {
            console.log(`   ${index + 1}. ID: ${record.id}, Type: ${record.source_type}, Warehouse: ${record.warehouse}, Product: ${record.product_name}`);
        });
        
        console.log('\nExport CSV first 3 data rows:');
        csvLines.slice(1, 4).forEach((line, index) => {
            const fields = line.split(',');
            console.log(`   ${index + 1}. ID: ${fields[0]}, Type: ${fields[2]}, Warehouse: ${fields[3]}, Product: ${fields[6]}`);
        });
        
        console.log('\n' + '=' .repeat(60));
        console.log('🏁 Debug Analysis Complete');
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
        process.exit(1);
    }
}

// Run the debug
debugExportVsGetAll();