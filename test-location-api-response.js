/**
 * TEST LOCATION API RESPONSE
 * Tests the modified audit logs API to ensure location data is being added
 */

const axios = require('axios');

async function testLocationAPIResponse() {
    console.log('🧪 TESTING LOCATION API RESPONSE');
    console.log('=================================');
    
    const API_BASE = 'https://13.60.36.159.nip.io';
    
    try {
        console.log('🔗 Testing audit logs API with location enhancement...');
        console.log(`📡 API URL: ${API_BASE}/api/audit-logs`);
        
        // First, try to get a token by logging in
        console.log('\n🔐 Step 1: Attempting login...');
        
        const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
            email: 'admin@company.com',
            password: 'admin@123'
        }, {
            timeout: 10000,
            httpsAgent: new (require('https').Agent)({
                rejectUnauthorized: false
            })
        });
        
        if (loginResponse.data.success) {
            const token = loginResponse.data.token;
            console.log('✅ Login successful');
            
            // Now test the audit logs API
            console.log('\n📊 Step 2: Fetching audit logs with location data...');
            
            const auditResponse = await axios.get(`${API_BASE}/api/audit-logs?limit=10`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                timeout: 30000, // Longer timeout for location lookups
                httpsAgent: new (require('https').Agent)({
                    rejectUnauthorized: false
                })
            });
            
            if (auditResponse.data.success) {
                const logs = auditResponse.data.data.logs || [];
                console.log(`✅ Retrieved ${logs.length} audit log entries`);
                
                // Check each log for location data
                console.log('\n📍 Checking location data in logs:');
                console.log('=====================================');
                
                logs.forEach((log, index) => {
                    console.log(`\n🔍 Log ${index + 1} (ID: ${log.id}):`);
                    console.log(`   👤 User: ${log.user_name || 'Unknown'}`);
                    console.log(`   🎯 Action: ${log.action} ${log.resource}`);
                    console.log(`   🌐 IP: ${log.ip_address || 'No IP'}`);
                    
                    // Check database columns for location
                    if (log.location_country) {
                        console.log(`   📍 DB Location: ${log.location_city}, ${log.location_country}`);
                    }
                    
                    // Check details JSON for location
                    if (log.details && log.details.location) {
                        const loc = log.details.location;
                        console.log(`   📍 JSON Location: ${loc.flag} ${loc.city}, ${loc.country}`);
                        console.log(`   🗺️ Address: ${loc.address}`);
                        console.log(`   🎯 Coordinates: ${loc.coordinates}`);
                        console.log(`   🕐 Timezone: ${loc.timezone}`);
                        console.log(`   🌐 ISP: ${loc.isp}`);
                        console.log('   ✅ LOCATION DATA FOUND!');
                    } else {
                        console.log('   ❌ No location data found');
                    }
                });
                
                // Summary
                const logsWithLocation = logs.filter(log => 
                    log.location_country || (log.details && log.details.location)
                );
                
                console.log('\n🎯 SUMMARY:');
                console.log('===========');
                console.log(`📊 Total logs: ${logs.length}`);
                console.log(`📍 Logs with location: ${logsWithLocation.length}`);
                console.log(`📈 Location coverage: ${Math.round((logsWithLocation.length / logs.length) * 100)}%`);
                
                if (logsWithLocation.length > 0) {
                    console.log('\n✅ SUCCESS: Location data is being added to API response!');
                    console.log('🎉 Frontend will now display location badges and details!');
                } else {
                    console.log('\n⚠️ No location data found in API response');
                    console.log('💡 This might be because:');
                    console.log('   1. No IP addresses in audit logs');
                    console.log('   2. Geolocation APIs are not responding');
                    console.log('   3. Server needs to be restarted');
                }
                
            } else {
                console.log('❌ Failed to fetch audit logs:', auditResponse.data.message);
            }
            
        } else {
            console.log('❌ Login failed:', loginResponse.data.message);
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        
        if (error.response) {
            console.log('📊 Response status:', error.response.status);
            console.log('📋 Response data:', error.response.data);
        }
        
        console.log('\n💡 Possible solutions:');
        console.log('1. Restart the server to load the updated code');
        console.log('2. Check if the server is running');
        console.log('3. Verify database connection');
        console.log('4. Check authentication credentials');
    }
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Restart the server: npm run server');
    console.log('2. Test the frontend: refresh audit logs page');
    console.log('3. Look for location badges: 🇮🇳 Gurugram, India');
}

// Run the test
testLocationAPIResponse().catch(console.error);