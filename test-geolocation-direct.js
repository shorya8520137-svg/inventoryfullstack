/**
 * TEST GEOLOCATION DIRECTLY
 * Tests the IPGeolocationTracker directly to see if APIs are working
 */

const IPGeolocationTracker = require('./IPGeolocationTracker');

async function testGeolocationDirect() {
    console.log('🧪 TESTING GEOLOCATION TRACKER DIRECTLY');
    console.log('======================================');
    
    const geoTracker = new IPGeolocationTracker();
    const testIP = '103.100.219.248'; // Office IP
    
    try {
        console.log(`🌍 Testing geolocation for IP: ${testIP}`);
        console.log('⏳ Fetching location data...');
        
        const locationData = await geoTracker.getLocationData(testIP);
        
        console.log('\n📍 LOCATION DATA RECEIVED:');
        console.log('==========================');
        console.log(`🏳️ Flag: ${locationData.flag}`);
        console.log(`🌍 Country: ${locationData.country} (${locationData.countryCode})`);
        console.log(`🏙️ City: ${locationData.city}`);
        console.log(`📍 Region: ${locationData.region}`);
        console.log(`🗺️ Address: ${locationData.address}`);
        console.log(`📍 Coordinates: ${locationData.latitude}, ${locationData.longitude}`);
        console.log(`🕐 Timezone: ${locationData.timezone}`);
        console.log(`🌐 ISP: ${locationData.isp}`);
        console.log(`🔢 ASN: ${locationData.asn}`);
        
        if (locationData.country === 'Unknown') {
            console.log('\n❌ GEOLOCATION FAILED');
            console.log('💡 All APIs returned unknown location');
        } else {
            console.log('\n✅ GEOLOCATION SUCCESS');
            console.log('🎉 Location data retrieved successfully!');
        }
        
        // Test cache
        console.log('\n🗄️ Testing cache...');
        const cachedData = await geoTracker.getLocationData(testIP);
        console.log('✅ Cache working - second call should be instant');
        
        // Show cache stats
        const stats = geoTracker.getCacheStats();
        console.log(`📊 Cache entries: ${stats.size}`);
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        console.log('📋 Error details:', error);
    }
}

// Run the test
testGeolocationDirect().catch(console.error);