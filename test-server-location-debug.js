/**
 * TEST SERVER LOCATION DEBUG
 * Tests the server's location enhancement functionality
 */

const axios = require('axios');

async function testServerLocationDebug() {
    console.log('🧪 TESTING SERVER LOCATION DEBUG');
    console.log('================================');
    
    const API_BASE = 'https://13.60.36.159.nip.io';
    
    try {
        // Login first
        console.log('🔐 Step 1: Login...');
        const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
            email: 'admin@company.com',
            password: 'admin@123'
        }, {
            timeout: 10000,
            httpsAgent: new (require('https').Agent)({
                rejectUnauthorized: false
            })
        });
        
        if (!loginResponse.data.success) {
            throw new Error('Login failed');
        }
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        
        // Test audit logs API with detailed logging
        console.log('\n📊 Step 2: Testing audit logs API...');
        
        const auditResponse = await axios.get(`${API_BASE}/api/audit-logs?limit=5`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 60000, // Longer timeout for location lookups
            httpsAgent: new (require('https').Agent)({
                rejectUnauthorized: false
            })
        });
        
        if (auditResponse.data.success) {
            const logs = auditResponse.data.data.logs || [];
            console.log(`✅ Retrieved ${logs.length} audit log entries`);
            
            // Check each log in detail
            console.log('\n🔍 DETAILED LOG ANALYSIS:');
            console.log('=========================');
            
            logs.forEach((log, index) => {
                console.log(`\n📋 Log ${index + 1} (ID: ${log.id}):`);
                console.log(`   👤 User: ${log.user_name}`);
                console.log(`   🎯 Action: ${log.action} ${log.resource}`);
                console.log(`   🌐 IP: ${log.ip_address}`);
                console.log(`   📅 Created: ${log.created_at}`);
                
                // Check database location columns
                console.log('\n   📍 Database Location Columns:');
                console.log(`      Country: ${log.location_country || 'NULL'}`);
                console.log(`      City: ${log.location_city || 'NULL'}`);
                console.log(`      Region: ${log.location_region || 'NULL'}`);
                console.log(`      Coordinates: ${log.location_coordinates || 'NULL'}`);
                
                // Check details JSON
                console.log('\n   📋 Details JSON:');
                if (log.details) {
                    if (typeof log.details === 'string') {
                        try {
                            const parsed = JSON.parse(log.details);
                            console.log(`      Raw details: ${JSON.stringify(parsed, null, 6)}`);
                            if (parsed.location) {
                                console.log('      ✅ Location found in details!');
                                console.log(`         Flag: ${parsed.location.flag}`);
                                console.log(`         Country: ${parsed.location.country}`);
                                console.log(`         City: ${parsed.location.city}`);
                                console.log(`         Address: ${parsed.location.address}`);
                            } else {
                                console.log('      ❌ No location in details');
                            }
                        } catch (e) {
                            console.log(`      ❌ Invalid JSON: ${log.details}`);
                        }
                    } else {
                        console.log(`      Object details: ${JSON.stringify(log.details, null, 6)}`);
                        if (log.details.location) {
                            console.log('      ✅ Location found in details object!');
                        } else {
                            console.log('      ❌ No location in details object');
                        }
                    }
                } else {
                    console.log('      ❌ No details field');
                }
                
                console.log('   ' + '='.repeat(50));
            });
            
            // Summary
            const logsWithDBLocation = logs.filter(log => log.location_country);
            const logsWithJSONLocation = logs.filter(log => {
                if (!log.details) return false;
                try {
                    const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                    return details.location && details.location.country && details.location.country !== 'undefined';
                } catch {
                    return false;
                }
            });
            
            console.log('\n🎯 SUMMARY:');
            console.log('===========');
            console.log(`📊 Total logs: ${logs.length}`);
            console.log(`📍 Logs with DB location: ${logsWithDBLocation.length}`);
            console.log(`📋 Logs with JSON location: ${logsWithJSONLocation.length}`);
            console.log(`🌐 Logs with IP addresses: ${logs.filter(log => log.ip_address).length}`);
            
            if (logsWithJSONLocation.length === 0 && logs.some(log => log.ip_address)) {
                console.log('\n⚠️ ISSUE DETECTED:');
                console.log('- Logs have IP addresses but no location data');
                console.log('- Server may need restart to load updated code');
                console.log('- Or geolocation API calls are failing on server');
            }
            
        } else {
            console.log('❌ Failed to fetch audit logs:', auditResponse.data.message);
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        if (error.response) {
            console.log('📊 Response status:', error.response.status);
            console.log('📋 Response data:', error.response.data);
        }
    }
}

// Run the test
testServerLocationDebug().catch(console.error);