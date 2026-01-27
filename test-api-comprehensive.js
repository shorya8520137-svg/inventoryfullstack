/**
 * COMPREHENSIVE API TEST
 * Tests the API endpoints and location tracking functionality
 */

const axios = require('axios');

async function testAPIComprehensive() {
    console.log('🧪 COMPREHENSIVE API TEST');
    console.log('=========================');
    
    const API_BASE = 'https://13.60.36.159.nip.io';
    
    // Test 1: Server Connectivity
    console.log('\n🔗 Test 1: Server Connectivity');
    console.log('------------------------------');
    
    try {
        const healthResponse = await axios.get(`${API_BASE}/api/health`, {
            timeout: 10000,
            httpsAgent: new (require('https').Agent)({
                rejectUnauthorized: false
            })
        });
        console.log('✅ Server is accessible');
        console.log('📊 Health check:', healthResponse.data);
    } catch (error) {
        console.log('❌ Server connectivity failed:', error.message);
        if (error.response) {
            console.log('📊 Status:', error.response.status);
            console.log('📋 Data:', error.response.data);
        }
    }
    
    // Test 2: Authentication Endpoints
    console.log('\n🔐 Test 2: Authentication');
    console.log('-------------------------');
    
    const loginCredentials = [
        { email: 'admin@company.com', password: 'admin123' },
        { email: 'admin@company.com', password: 'password' },
        { email: 'admin@company.com', password: 'admin' },
        { email: 'test@company.com', password: 'test123' },
        { email: 'user@company.com', password: 'user123' }
    ];
    
    let validToken = null;
    
    for (const creds of loginCredentials) {
        try {
            console.log(`🔄 Trying login: ${creds.email} / ${creds.password}`);
            
            const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, creds, {
                timeout: 10000,
                httpsAgent: new (require('https').Agent)({
                    rejectUnauthorized: false
                })
            });
            
            if (loginResponse.data.success) {
                console.log('✅ Login successful!');
                console.log('👤 User:', loginResponse.data.user?.name || 'Unknown');
                console.log('🎯 Role:', loginResponse.data.user?.role_name || 'Unknown');
                validToken = loginResponse.data.token;
                break;
            }
        } catch (error) {
            console.log(`❌ Login failed: ${error.response?.data?.message || error.message}`);
        }
    }
    
    if (!validToken) {
        console.log('⚠️ No valid authentication found, testing without auth...');
    }
    
    // Test 3: Audit Logs API (with and without auth)
    console.log('\n📊 Test 3: Audit Logs API');
    console.log('-------------------------');
    
    const testConfigs = [
        { name: 'With Authentication', headers: validToken ? { 'Authorization': `Bearer ${validToken}` } : null },
        { name: 'Without Authentication', headers: null }
    ];
    
    for (const config of testConfigs) {
        if (!config.headers && config.name.includes('With')) continue;
        
        try {
            console.log(`\n🔄 Testing: ${config.name}`);
            
            const auditResponse = await axios.get(`${API_BASE}/api/audit-logs?limit=5`, {
                headers: config.headers || {},
                timeout: 30000, // Longer timeout for location lookups
                httpsAgent: new (require('https').Agent)({
                    rejectUnauthorized: false
                })
            });
            
            if (auditResponse.data.success) {
                const logs = auditResponse.data.data?.logs || auditResponse.data.data || [];
                console.log(`✅ Retrieved ${logs.length} audit log entries`);
                
                // Check for location data
                console.log('\n📍 Location Data Analysis:');
                console.log('==========================');
                
                logs.forEach((log, index) => {
                    console.log(`\n🔍 Log ${index + 1} (ID: ${log.id}):`);
                    console.log(`   👤 User: ${log.user_name || 'Unknown'}`);
                    console.log(`   🎯 Action: ${log.action} ${log.resource}`);
                    console.log(`   🌐 IP: ${log.ip_address || 'No IP'}`);
                    
                    // Check database columns
                    if (log.location_country) {
                        console.log(`   📍 DB Location: ${log.location_city}, ${log.location_country}`);
                    }
                    
                    // Check details JSON
                    if (log.details && typeof log.details === 'object' && log.details.location) {
                        const loc = log.details.location;
                        console.log(`   📍 JSON Location: ${loc.flag} ${loc.city}, ${loc.country}`);
                        console.log(`   🗺️ Address: ${loc.address}`);
                        console.log(`   🎯 Coordinates: ${loc.coordinates}`);
                        console.log(`   🕐 Timezone: ${loc.timezone}`);
                        console.log(`   🌐 ISP: ${loc.isp}`);
                        console.log('   ✅ LOCATION DATA FOUND!');
                    } else if (log.details && typeof log.details === 'string') {
                        try {
                            const parsedDetails = JSON.parse(log.details);
                            if (parsedDetails.location) {
                                const loc = parsedDetails.location;
                                console.log(`   📍 Parsed Location: ${loc.flag} ${loc.city}, ${loc.country}`);
                                console.log('   ✅ LOCATION DATA FOUND IN STRING!');
                            } else {
                                console.log('   ❌ No location in parsed details');
                            }
                        } catch {
                            console.log('   ❌ Could not parse details JSON');
                        }
                    } else {
                        console.log('   ❌ No location data found');
                    }
                });
                
                // Summary
                const logsWithLocation = logs.filter(log => 
                    log.location_country || 
                    (log.details && typeof log.details === 'object' && log.details.location) ||
                    (log.details && typeof log.details === 'string' && log.details.includes('location'))
                );
                
                console.log('\n🎯 SUMMARY:');
                console.log('===========');
                console.log(`📊 Total logs: ${logs.length}`);
                console.log(`📍 Logs with location: ${logsWithLocation.length}`);
                console.log(`📈 Location coverage: ${logs.length > 0 ? Math.round((logsWithLocation.length / logs.length) * 100) : 0}%`);
                
                if (logsWithLocation.length > 0) {
                    console.log('\n✅ SUCCESS: Location data found in API response!');
                    console.log('🎉 Frontend should display location badges!');
                } else {
                    console.log('\n⚠️ No location data found in API response');
                }
                
            } else {
                console.log('❌ API returned error:', auditResponse.data.message);
            }
            
        } catch (error) {
            console.log(`❌ ${config.name} failed:`, error.message);
            if (error.response) {
                console.log('📊 Status:', error.response.status);
                console.log('📋 Data:', error.response.data);
            }
        }
    }
    
    // Test 4: Direct Location Tracker Test
    console.log('\n🌍 Test 4: Direct Location Tracker');
    console.log('----------------------------------');
    
    try {
        const IPGeolocationTracker = require('./IPGeolocationTracker');
        const geoTracker = new IPGeolocationTracker();
        
        const testIP = '103.100.219.248'; // Your office IP
        console.log(`🔍 Testing location lookup for IP: ${testIP}`);
        
        const locationData = await geoTracker.getLocationData(testIP);
        
        console.log('✅ Location lookup successful:');
        console.log(`   ${locationData.flag} Country: ${locationData.country}`);
        console.log(`   🏙️ City: ${locationData.city}`);
        console.log(`   🗺️ Region: ${locationData.region}`);
        console.log(`   📍 Address: ${locationData.address}`);
        console.log(`   🎯 Coordinates: ${locationData.latitude}, ${locationData.longitude}`);
        console.log(`   🕐 Timezone: ${locationData.timezone}`);
        console.log(`   🌐 ISP: ${locationData.isp}`);
        
    } catch (error) {
        console.log('❌ Location tracker test failed:', error.message);
    }
    
    // Test 5: Server Status Check
    console.log('\n🖥️ Test 5: Server Status');
    console.log('------------------------');
    
    try {
        const statusResponse = await axios.get(`${API_BASE}/api/status`, {
            timeout: 5000,
            httpsAgent: new (require('https').Agent)({
                rejectUnauthorized: false
            })
        });
        console.log('✅ Server status:', statusResponse.data);
    } catch (error) {
        console.log('⚠️ Server status endpoint not available');
    }
    
    console.log('\n🎯 FINAL RECOMMENDATIONS:');
    console.log('=========================');
    
    if (validToken) {
        console.log('✅ Authentication working');
    } else {
        console.log('❌ Authentication issues - check credentials');
    }
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. If location data found: Frontend should show location badges');
    console.log('2. If no location data: Server may need restart to load updated code');
    console.log('3. Check frontend at: https://stockiqfullstacktest.vercel.app/audit-logs');
    console.log('4. Look for: IP: 103.100.219.248  🇮🇳 Gurugram, India');
}

// Run the comprehensive test
testAPIComprehensive().catch(console.error);