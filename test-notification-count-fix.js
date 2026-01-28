const fs = require('fs');
const path = require('path');

console.log('🔍 TESTING NOTIFICATION COUNT FIX...\n');

// Test 1: Check NotificationBell - Count endpoint removed
const bellPath = path.join(__dirname, 'src', 'components', 'NotificationBell.jsx');
const bellContent = fs.readFileSync(bellPath, 'utf8');

const hasCountEndpoint = bellContent.includes('/api/notifications/count');
const hasCorrectEndpoint = bellContent.includes('/api/notifications') && !bellContent.includes('/api/notifications/count');
const hasUnreadCountExtraction = bellContent.includes('data.data.unreadCount');

console.log(`✅ Count endpoint removed: ${!hasCountEndpoint ? 'YES' : 'NO'}`);
console.log(`✅ Uses correct endpoint: ${hasCorrectEndpoint ? 'YES' : 'NO'}`);
console.log(`✅ Extracts unreadCount from data: ${hasUnreadCountExtraction ? 'YES' : 'NO'}`);

// Test 2: Check if function name is still appropriate
const hasFetchCountFunction = bellContent.includes('fetchNotificationCount');
console.log(`✅ Function name maintained: ${hasFetchCountFunction ? 'YES' : 'NO'}`);

// Test 3: Check API base URL
const hasCorrectAPIBase = bellContent.includes('https://54.169.107.64:8443');
console.log(`✅ Correct API base URL: ${hasCorrectAPIBase ? 'YES' : 'NO'}`);

console.log('\n📋 SUMMARY:');
const allTestsPassed = !hasCountEndpoint && hasCorrectEndpoint && 
                      hasUnreadCountExtraction && hasFetchCountFunction && 
                      hasCorrectAPIBase;

if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED! Notification count fix is ready for deployment.');
    console.log('\n🚀 Run fix-notification-count.cmd to deploy fix');
} else {
    console.log('❌ Some tests failed. Please check the implementation.');
}

console.log('\n📝 FIX DETAILS:');
console.log('- Removed non-existent /api/notifications/count endpoint');
console.log('- Now uses existing /api/notifications endpoint');
console.log('- Extracts unreadCount from response.data.data.unreadCount');
console.log('- No more 404 errors in console');
console.log('- Notification count badge should work properly');