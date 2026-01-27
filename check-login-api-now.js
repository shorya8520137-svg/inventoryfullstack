/**
 * CHECK LOGIN PAGE API RIGHT NOW
 * Simple check of what API the frontend is using
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 CHECKING LOGIN PAGE API CONFIGURATION');
console.log('=' .repeat(60));

// 1. Check environment files
console.log('1️⃣ Environment Files:');
const envFiles = ['.env.local', '.env.production', '.env'];
envFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const match = content.match(/NEXT_PUBLIC_API_BASE=(.+)/);
        if (match) {
            const value = match[1].trim();
            console.log(`   ${file}: ${value}`);
            if (value.includes('16.171.5.50') && value.includes('nip.io')) {
                console.log('   ✅ Correct');
            } else {
                console.log('   ❌ Wrong!');
            }
        }
    }
});

// 2. Check login page source
console.log('\n2️⃣ Login Page Source:');
const loginPagePath = 'src/app/login/page.jsx';
if (fs.existsSync(loginPagePath)) {
    const loginContent = fs.readFileSync(loginPagePath, 'utf8');
    
    // Check if it uses process.env.NEXT_PUBLIC_API_BASE
    if (loginContent.includes('process.env.NEXT_PUBLIC_API_BASE')) {
        console.log('   ✅ Uses environment variable');
    } else {
        console.log('   ❌ Might have hardcoded API!');
    }
    
    // Check for any hardcoded IPs
    if (loginContent.includes('16.171.196.15')) {
        console.log('   ❌ Contains OLD IP!');
    } else if (loginContent.includes('16.171.5.50')) {
        console.log('   ⚠️ Contains NEW IP (should use env var)');
    } else {
        console.log('   ✅ No hardcoded IPs found');
    }
} else {
    console.log('   ❌ Login page not found!');
}

// 3. Check utils/api.js
console.log('\n3️⃣ API Utils:');
const apiUtilsPath = 'src/utils/api.js';
if (fs.existsSync(apiUtilsPath)) {
    const apiContent = fs.readFileSync(apiUtilsPath, 'utf8');
    
    if (apiContent.includes('process.env.NEXT_PUBLIC_API_BASE')) {
        console.log('   ✅ Uses environment variable');
    } else {
        console.log('   ❌ Might have hardcoded API!');
    }
    
    // Check for hardcoded IPs
    if (apiContent.includes('16.171.196.15')) {
        console.log('   ❌ Contains OLD IP!');
    } else if (apiContent.includes('16.171.5.50')) {
        console.log('   ⚠️ Contains NEW IP (should use env var)');
    } else {
        console.log('   ✅ No hardcoded IPs found');
    }
} else {
    console.log('   ❌ API utils not found!');
}

// 4. Check if dev server is running with correct env
console.log('\n4️⃣ Development Server Check:');
require('dotenv').config({ path: '.env.local' });
const currentApiBase = process.env.NEXT_PUBLIC_API_BASE;
console.log(`   Current API Base: ${currentApiBase}`);

if (currentApiBase === 'https://16.171.5.50.nip.io') {
    console.log('   ✅ Environment is correct');
} else {
    console.log('   ❌ Environment is wrong!');
    console.log('   Expected: https://16.171.5.50.nip.io');
}

// 5. Instructions
console.log('\n' + '=' .repeat(60));
console.log('📋 NEXT STEPS:');
console.log('1. Visit: http://localhost:3000/api-debug');
console.log('2. Check what API base is displayed');
console.log('3. If wrong, the dev server needs restart');
console.log('4. If still wrong, check browser DevTools Network tab during login');

console.log('\n🔧 IMMEDIATE FIX:');
console.log('1. Stop dev server (Ctrl+C)');
console.log('2. Run: npm run build');
console.log('3. Run: npm run dev');
console.log('4. Test: http://localhost:3000/login');