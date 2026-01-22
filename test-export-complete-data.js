/**
 * TEST EXPORT COMPLETE DATA
 * Test to verify export returns ALL records without pagination
 */

const https = require('https');
const querystring = require('querystring');

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

async function testExportCompleteData() {
    console.log('🧪 Testing Export Complete Data Functionality');
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
        
        // Step 2: Get all dispatches to count total records
        console.log('\n2️⃣ Getting all dispatches...');
        const allDispatchesResponse = await makeRequest('/api/order-tracking', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (allDispatchesResponse.statusCode !== 200) {
            throw new Error(`Failed to get dispatches: ${JSON.stringify(allDispatchesResponse.data)}`);
        }
        
        const totalRecords = allDispatchesResponse.data.data.length;
        console.log(`✅ Total records in database: ${totalRecords}`);
        
        // Step 3: Test export without filters (should get ALL records)
        console.log('\n3️⃣ Testing export without filters...');
        const exportAllResponse = await makeRequest('/api/order-tracking/export', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (exportAllResponse.statusCode !== 200) {
            throw new Error(`Export failed: ${JSON.stringify(exportAllResponse.data)}`);
        }
        
        if (!exportAllResponse.isCSV) {
            throw new Error('Export did not return CSV data');
        }
        
        // Count CSV rows (subtract 1 for header)
        const csvLines = exportAllResponse.data.split('\n').filter(line => line.trim());
        const csvRecordCount = csvLines.length - 1; // Subtract header row
        
        console.log(`✅ Export returned ${csvRecordCount} records`);
        console.log(`📊 Database has ${totalRecords} records`);
        
        // Step 4: Compare counts
        if (csvRecordCount === totalRecords) {
            console.log('🎉 SUCCESS: Export returned ALL records!');
        } else {
            console.log('❌ ISSUE: Export count does not match database count');
            console.log(`   Expected: ${totalRecords}`);
            console.log(`   Got: ${csvRecordCount}`);
            console.log(`   Missing: ${totalRecords - csvRecordCount} records`);
        }
        
        // Step 5: Test export with warehouse filter
        console.log('\n4️⃣ Testing export with warehouse filter...');
        const exportWarehouseResponse = await makeRequest('/api/order-tracking/export?warehouse=GGM_WH', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (exportWarehouseResponse.statusCode === 200 && exportWarehouseResponse.isCSV) {
            const warehouseCSVLines = exportWarehouseResponse.data.split('\n').filter(line => line.trim());
            const warehouseRecordCount = warehouseCSVLines.length - 1;
            console.log(`✅ Warehouse filter export returned ${warehouseRecordCount} records`);
        } else {
            console.log('❌ Warehouse filter export failed');
        }
        
        // Step 6: Show sample CSV data
        console.log('\n5️⃣ Sample CSV data (first 3 lines):');
        const sampleLines = csvLines.slice(0, 3);
        sampleLines.forEach((line, index) => {
            console.log(`   ${index === 0 ? 'HEADER' : `ROW ${index}`}: ${line.substring(0, 100)}...`);
        });
        
        console.log('\n' + '=' .repeat(60));
        console.log('🏁 Export Complete Data Test Finished');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Run the test
testExportCompleteData();