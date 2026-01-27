/**
 * TEST CURRENT AUDIT LOGS DATA
 * Check what data is currently being returned by the audit logs API
 */

const axios = require('axios');

async function testCurrentAuditLogsData() {
    console.log('🔍 TESTING CURRENT AUDIT LOGS DATA');
    console.log('==================================');
    
    const apiURL = 'https://13.60.36.159.nip.io';
    
    try {
        console.log('🔗 Testing API endpoint:', `${apiURL}/api/audit-logs`);
        
        // Test without authentication first
        const response = await axios.get(`${apiURL}/api/audit-logs?limit=5`, {
            timeout: 10000,
            headers: {
                'User-Agent': 'StockIQ-Debug-Test/1.0'
            },
            // Ignore SSL certificate issues for testing
            httpsAgent: new (require('https').Agent)({
                rejectUnauthorized: false
            })
        });
        
        console.log('✅ API Response Status:', response.status);
        console.log('📊 Response Data:', JSON.stringify(response.data, null, 2));
        
        if (response.data && response.data.data) {
            const logs = response.data.data.logs || response.data.data;
            console.log(`\n📋 Found ${logs.length} audit log entries`);
            
            // Check first log entry for location data
            if (logs.length > 0) {
                const firstLog = logs[0];
                console.log('\n🔍 First Log Entry Analysis:');
                console.log('============================');
                console.log('ID:', firstLog.id);
                console.log('User:', firstLog.user_name || firstLog.user_id);
                console.log('IP Address:', firstLog.ip_address);
                console.log('Action:', firstLog.action);
                console.log('Resource:', firstLog.resource);
                
                // Check for location columns
                console.log('\n📍 Location Data Check:');
                console.log('location_country:', firstLog.location_country || 'NOT FOUND');
                console.log('location_city:', firstLog.location_city || 'NOT FOUND');
                console.log('location_region:', firstLog.location_region || 'NOT FOUND');
                console.log('location_coordinates:', firstLog.location_coordinates || 'NOT FOUND');
                
                // Check details JSON for location
                if (firstLog.details) {
                    let details;
                    try {
                        details = typeof firstLog.details === 'string' ? JSON.parse(firstLog.details) : firstLog.details;
                        console.log('\n📋 Details Object:');
                        console.log(JSON.stringify(details, null, 2));
                        
                        if (details.location) {
                            console.log('\n✅ Location found in details:');
                            console.log('Country:', details.location.country);
                            console.log('City:', details.location.city);
                            console.log('Flag:', details.location.flag);
                            console.log('Address:', details.location.address);
                        } else {
                            console.log('\n❌ No location data found in details');
                        }
                    } catch (error) {
                        console.log('\n❌ Error parsing details:', error.message);
                    }
                }
            }
        }
        
    } catch (error) {
        console.log('❌ API Error:', error.message);
        
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        }
        
        console.log('\n💡 This might be because:');
        console.log('1. Server is not running');
        console.log('2. Database migration not completed');
        console.log('3. Authentication required');
        console.log('4. SSL certificate issues');
    }
    
    console.log('\n🎯 SUMMARY');
    console.log('==========');
    console.log('To fix location display in frontend:');
    console.log('1. Ensure database migration is completed');
    console.log('2. Restart server with new location tracking');
    console.log('3. Perform user actions to generate new audit logs');
    console.log('4. Check if location data appears in API response');
}

// Run the test
testCurrentAuditLogsData().catch(console.error);