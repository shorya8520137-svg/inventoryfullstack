/**
 * FIX FRONTEND API CACHE ISSUE
 * This script will help identify and fix the caching issue with the old IP
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 FIXING FRONTEND API CACHE ISSUE');
console.log('=' .repeat(60));

// Step 1: Verify environment files
console.log('1️⃣ Checking environment files...');

const envFiles = ['.env.local', '.env.production', '.env'];
envFiles.forEach(file => {
    if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        console.log(`\n📄 ${file}:`);
        
        // Check for API_BASE
        const apiBaseMatch = content.match(/NEXT_PUBLIC_API_BASE=(.+)/);
        if (apiBaseMatch) {
            const apiBase = apiBaseMatch[1].trim();
            if (apiBase.includes('16.171.5.50')) {
                console.log(`   ✅ Correct IP: ${apiBase}`);
            } else {
                console.log(`   ❌ Wrong IP: ${apiBase}`);
                console.log('   🔧 Fixing...');
                
                const newContent = content.replace(
                    /NEXT_PUBLIC_API_BASE=.+/g,
                    'NEXT_PUBLIC_API_BASE=https://16.171.5.50.nip.io'
                );
                fs.writeFileSync(file, newContent);
                console.log('   ✅ Fixed!');
            }
        } else {
            console.log('   ⚠️ No NEXT_PUBLIC_API_BASE found');
        }
    } else {
        console.log(`   ❌ ${file} not found`);
    }
});

// Step 2: Clear Next.js cache
console.log('\n2️⃣ Clearing Next.js cache...');
const nextCacheDir = '.next';
if (fs.existsSync(nextCacheDir)) {
    console.log('   🗑️ Removing .next directory...');
    fs.rmSync(nextCacheDir, { recursive: true, force: true });
    console.log('   ✅ Cache cleared');
} else {
    console.log('   ℹ️ No .next cache found');
}

// Step 3: Clear node_modules/.cache if exists
console.log('\n3️⃣ Clearing node_modules cache...');
const nodeModulesCache = 'node_modules/.cache';
if (fs.existsSync(nodeModulesCache)) {
    console.log('   🗑️ Removing node_modules/.cache...');
    fs.rmSync(nodeModulesCache, { recursive: true, force: true });
    console.log('   ✅ Node modules cache cleared');
} else {
    console.log('   ℹ️ No node_modules cache found');
}

// Step 4: Create a fresh environment check
console.log('\n4️⃣ Creating environment verification...');
const envCheck = `
// Environment verification - Auto-generated
console.log('🔍 Environment Check:');
console.log('API Base:', process.env.NEXT_PUBLIC_API_BASE);
console.log('Expected: https://16.171.5.50.nip.io');
console.log('Match:', process.env.NEXT_PUBLIC_API_BASE === 'https://16.171.5.50.nip.io' ? '✅' : '❌');
`;

fs.writeFileSync('public/env-check.js', envCheck);
console.log('   ✅ Created public/env-check.js');

// Step 5: Update next.config.js to force environment reload
console.log('\n5️⃣ Checking next.config.js...');
const nextConfigPath = 'next.config.js';
if (fs.existsSync(nextConfigPath)) {
    let nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
    
    // Add environment variable logging
    if (!nextConfig.includes('NEXT_PUBLIC_API_BASE')) {
        console.log('   🔧 Adding environment logging to next.config.js...');
        
        const envLogging = `
// Environment variable debugging
console.log('🔍 Next.js Config - API Base:', process.env.NEXT_PUBLIC_API_BASE);
`;
        
        nextConfig = envLogging + nextConfig;
        fs.writeFileSync(nextConfigPath, nextConfig);
        console.log('   ✅ Updated next.config.js');
    } else {
        console.log('   ℹ️ Environment logging already present');
    }
} else {
    console.log('   ⚠️ next.config.js not found');
}

console.log('\n' + '=' .repeat(60));
console.log('🎯 CACHE FIX COMPLETE');
console.log('\n📋 Next Steps:');
console.log('1. Run: npm run build');
console.log('2. Run: npm run dev');
console.log('3. Check: http://localhost:3000/api-debug');
console.log('4. If still wrong, check Vercel environment variables');
console.log('\n💡 For Vercel deployment:');
console.log('1. Go to Vercel dashboard');
console.log('2. Project Settings > Environment Variables');
console.log('3. Update NEXT_PUBLIC_API_BASE to: https://16.171.5.50.nip.io');
console.log('4. Redeploy the project');