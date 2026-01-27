/**
 * COMPLETE LOCATION SYSTEM TEST
 * Tests the entire location tracking system after server restart
 */

const axios = require('axios');

async function testCompleteLocationSystem() {
    console.log('🧪 COMPLETE LOCATION SYSTEM TEST');
    console.log('================================');
    console.log('🎯 This test verifies the entire location tracking system');
    console.log('📍 Run this AFTER restarting the server');
    console.log('');
    
    const API_BASE = 'https://13.60.36.159.nip.io';
    
    try {
        // Step 1: Login
        console.log('🔐 Step 1: Authentication...');
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
        
        // Step 2: Test audit logs API
        console.log('\n📊 Step 2: Testing audit logs API with location enhancement...');
        
        const auditResponse = await axios.get(`${API_BASE}/api/audit-logs?limit=5`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 60000, // Long timeout for location lookups
            httpsAgent: new (require('https').Agent)({
                rejectUnauthorized: false
            })
        });
        
        if (!auditResponse.data.success) {
            throw new Error('Audit logs API failed');
        }
        
        const logs = auditResponse.data.data.logs || [];
        console.log(`✅ Retrieved ${logs.length} audit log entries`);
        
        // Step 3: Analyze location data
        console.log('\n📍 Step 3: Analyzing location data...');
        
        let logsWithLocation = 0;
        let logsWithIP = 0;
        let locationExamples = [];
        
        logs.forEach((log, index) => {
            if (log.ip_address) {
                logsWithIP++;
                
                // Check for location data
                let hasLocation = false;
                let locationInfo = null;
                
                // Check database columns
                if (log.location_country) {
                    hasLocation = true;
                    locationInfo = {
                        source: 'database',
                        country: log.location_country,
                        city: log.location_city
                    };
                }
                
                // Check details JSON
                if (log.details && log.details.location) {
                    hasLocation = true;
                    locationInfo = {
                        source: 'json',
                        country: log.details.location.country,
                        city: log.details.location.city,
                        flag: log.details.location.flag,
                        address: log.details.location.address
                    };
                }
                
                if (hasLocation) {
                    logsWithLocation++;
                    locationExamples.push({
                        id: log.id,
                        ip: log.ip_address,
                        location: locationInfo
                    });
                    
                    console.log(`   ✅ Log ${log.id}: ${locationInfo.flag || '🌍'} ${locationInfo.city}, ${locationInfo.country}`);
                } else {
                    console.log(`   ❌ Log ${log.id}: IP ${log.ip_address} - No location data`);
                }
            }
        });
        
        // Step 4: Results analysis
        console.log('\n🎯 Step 4: Results Analysis');
        console.log('===========================');
        console.log(`📊 Total logs analyzed: ${logs.length}`);
        console.log(`🌐 Logs with IP addresses: ${logsWithIP}`);
        console.log(`📍 Logs with location data: ${logsWithLocation}`);
        
        if (logsWithIP > 0) {
            const locationCoverage = Math.round((logsWithLocation / logsWithIP) * 100);
            console.log(`📈 Location coverage: ${locationCoverage}%`);
        }
        
        // Step 5: System status
        console.log('\n🚀 Step 5: System Status');
        console.log('========================');
        
        if (logsWithLocation === 0 && logsWithIP > 0) {
            console.log('❌ LOCATION TRACKING NOT WORKING');
            console.log('💡 Possible issues:');
            console.log('   1. Server not restarted with updated code');
            console.log('   2. Geolocation APIs are failing');
            console.log('   3. IPGeolocationTracker not being called');
            console.log('');
            console.log('🔧 Solutions:');
            console.log('   1. Restart server: npm run server');
            console.log('   2. Check server console for error messages');
            console.log('   3. Test geolocation directly: node test-geolocation-direct.js');
            
        } else if (logsWithLocation > 0) {
            console.log('✅ LOCATION TRACKING IS WORKING!');
            console.log('🎉 Location data is being added to audit logs');
            console.log('');
            console.log('📍 Location Examples:');
            locationExamples.slice(0, 3).forEach(example => {
                console.log(`   🔍 Log ${example.id}: ${example.ip} → ${example.location.flag || '🌍'} ${example.location.address || example.location.city + ', ' + example.location.country}`);
            });
            
            console.log('');
            console.log('🎯 Frontend Testing:');
            console.log('   1. Open the audit logs page in the application');
            console.log('   2. Look for location badges like: 🇮🇳 Gurugram, India');
            console.log('   3. Click on log entries to see detailed location panels');
            
        } else {
            console.log('⚠️ NO IP ADDRESSES FOUND');
            console.log('💡 This might be normal if no recent activity has IP addresses');
        }
        
        // Step 6: Next steps
        console.log('\n🚀 Next Steps:');
        console.log('==============');
        if (logsWithLocation > 0) {
            console.log('✅ System is working correctly!');
            console.log('📱 Test the frontend to see location badges');
            console.log('🎉 Location tracking implementation is complete!');
        } else {
            console.log('🔄 Restart the server and run this test again');
            console.log('📋 Check server console for location lookup messages');
            console.log('🧪 Run: node test-geolocation-direct.js to verify APIs');
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        if (error.response) {
            console.log('📊 Response status:', error.response.status);
            console.log('📋 Response data:', error.response.data);
        }
        
        console.log('\n💡 Troubleshooting:');
        console.log('1. Ensure server is running: npm run server');
        console.log('2. Check server console for errors');
        console.log('3. Verify authentication credentials');
        console.log('4. Test network connectivity');
    }
}

// Run the test
testCompleteLocationSystem().catch(console.error);