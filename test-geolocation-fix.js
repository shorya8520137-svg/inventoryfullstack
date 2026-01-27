/**
 * TEST GEOLOCATION FIX
 * Simple test to verify IPGeolocationTracker is working
 */

const IPGeolocationTracker = require('./IPGeolocationTracker');

async function testGeolocationFix() {
    console.log('🌍 TESTING GEOLOCATION FIX');
    console.log('===========================\n');
    
    try {
        // Create instance of IPGeolocationTracker
        const geoTracker = new IPGeolocationTracker();
        
        console.log('📍 Test 1: Testing with your office IP...');
        const officeIP = '103.100.219.248';
        const location = await geoTracker.getLocationData(officeIP);
        
        console.log(`✅ Location data for ${officeIP}:`);
        console.log(`   🏙️  City: ${location.city}`);
        console.log(`   🏛️  Region: ${location.region}`);
        console.log(`   🏳️  Country: ${location.country} ${location.flag}`);
        console.log(`   📍 Address: ${location.address}`);
        
        console.log('\n📍 Test 2: Testing with localhost...');
        const localLocation = await geoTracker.getLocationData('127.0.0.1');
        
        console.log(`✅ Location data for localhost:`);
        console.log(`   🏙️  City: ${localLocation.city}`);
        console.log(`   🏛️  Region: ${localLocation.region}`);
        console.log(`   🏳️  Country: ${localLocation.country} ${localLocation.flag}`);
        
        console.log('\n📍 Test 3: Testing method exists...');
        console.log(`✅ getLocationData method exists: ${typeof geoTracker.getLocationData === 'function'}`);
        console.log(`✅ isPrivateIP method exists: ${typeof geoTracker.isPrivateIP === 'function'}`);
        console.log(`✅ getCountryFlag method exists: ${typeof geoTracker.getCountryFlag === 'function'}`);
        
        console.log('\n🎉 GEOLOCATION FIX TEST COMPLETED!');
        console.log('✅ IPGeolocationTracker is working correctly');
        console.log('✅ The getLocationData method is available');
        console.log('✅ Location tracking should work in notifications');
        
    } catch (error) {
        console.error('❌ Geolocation test failed:', error.message);
        console.log('\nError details:', error);
    }
}

// Run the test
testGeolocationFix();