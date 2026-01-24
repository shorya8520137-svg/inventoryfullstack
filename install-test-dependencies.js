/**
 * Install Test Dependencies
 * Ensures axios is available for API testing
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('📦 Installing Test Dependencies');
console.log('='.repeat(40));

try {
    // Check if axios is already installed
    try {
        require('axios');
        console.log('✅ axios already installed');
    } catch (error) {
        console.log('📦 Installing axios...');
        execSync('npm install axios', { stdio: 'inherit' });
        console.log('✅ axios installed successfully');
    }
    
    console.log('\n🚀 Dependencies ready!');
    console.log('\n📋 Available test scripts:');
    console.log('1. node test-complete-user-journey.js - Full journey test');
    console.log('2. node test-existing-audit-simple.js - Simple audit test');
    console.log('\n💡 Run these scripts to test your audit system');
    
} catch (error) {
    console.log('❌ Installation failed:', error.message);
    console.log('\n💡 Manual installation:');
    console.log('npm install axios');
}