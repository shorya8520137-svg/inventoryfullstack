const fs = require('fs');
const path = require('path');

console.log('🔍 TESTING PROFILE AND NOTIFICATION FIXES...\n');

// Test 1: Check NotificationBell - Clear All removed
const bellPath = path.join(__dirname, 'src', 'components', 'NotificationBell.jsx');
const bellContent = fs.readFileSync(bellPath, 'utf8');

const hasClearAllFunction = bellContent.includes('clearAllNotifications');
const hasClearAllButton = bellContent.includes('Clear all');
const hasClearAllAPI = bellContent.includes('/api/notifications/clear-all');

console.log(`✅ Clear All function removed: ${!hasClearAllFunction ? 'YES' : 'NO'}`);
console.log(`✅ Clear All button removed: ${!hasClearAllButton ? 'YES' : 'NO'}`);
console.log(`✅ Clear All API calls removed: ${!hasClearAllAPI ? 'YES' : 'NO'}`);

// Test 2: Check CSS - Square background removed
const cssPath = path.join(__dirname, 'src', 'components', 'TopNavBar.module.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

const hasSquareBackground = cssContent.includes('border: 1px solid #e2e8f0') && cssContent.includes('background: #ffffff');
const hasTransparentBackground = cssContent.includes('background: transparent');
const hasReducedPadding = cssContent.includes('padding: 4px 8px');

console.log(`✅ Square background removed: ${!hasSquareBackground ? 'YES' : 'NO'}`);
console.log(`✅ Transparent background added: ${hasTransparentBackground ? 'YES' : 'NO'}`);
console.log(`✅ Padding reduced: ${hasReducedPadding ? 'YES' : 'NO'}`);

// Test 3: Check profile avatar size
const hasCorrectAvatarSize = cssContent.includes('width: 36px') && cssContent.includes('height: 36px');
console.log(`✅ Avatar size optimized: ${hasCorrectAvatarSize ? 'YES' : 'NO'}`);

console.log('\n📋 SUMMARY:');
const allTestsPassed = !hasClearAllFunction && !hasClearAllButton && !hasClearAllAPI && 
                      !hasSquareBackground && hasTransparentBackground && hasReducedPadding && 
                      hasCorrectAvatarSize;

if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED! Fixes are ready for deployment.');
    console.log('\n🚀 Run fix-profile-and-notifications.cmd to deploy fixes');
} else {
    console.log('❌ Some tests failed. Please check the implementation.');
}

console.log('\n📝 FIXES APPLIED:');
console.log('- Removed Clear All notifications functionality completely');
console.log('- Removed square background card from profile');
console.log('- Made profile background transparent');
console.log('- Reduced padding for cleaner look');
console.log('- Optimized avatar size to 36px');
console.log('- Simplified hover effects');