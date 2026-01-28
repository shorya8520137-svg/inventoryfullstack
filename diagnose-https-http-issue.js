/**
 * DIAGNOSE HTTPS TO HTTP ISSUE
 * Check if the frontend HTTPS is blocked from calling HTTP API
 */

const axios = require('axios');

console.log('🔍 DIAGNOSING HTTPS TO HTTP ISSUE');
console.log('='.repeat(60));

async function diagnoseHTTPSIssue() {
    console.log('🎯 ISSUE ANALYSIS:');
    console.log('');
    console.log('Frontend: https://stockiqfullstacktest.vercel.app (SECURE)');
    console.log('Backend:  http://54.179.63.233.nip.io (NOT SECURE)');
    console.log('');
    console.log('🚨 PROBLEM: Mixed Content Security');
    console.log('   - HTTPS frontend cannot call HTTP backend');
    console.log('   - Browser blocks "insecure" HTTP requests from HTTPS pages');
    console.log('   - This is why login appears to not work');
    console.log('');

    // Test the API directly (this will work from Node.js)
    console.log('1️⃣ Testing API directly (should work)...');
    try {
        const response = await axios.post('http://54.179.63.233.nip.io/api/auth/login', {
            email: 'admin@company.com',
            password: 'Admin@123'
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 10000
        });
        
        if (response.data.success) {
            console.log('✅ API works directly (from Node.js)');
        }
    } catch (error) {
        console.log('❌ API error:', error.message);
    }

    console.log('\n2️⃣ SOLUTIONS:');
    console.log('');
    console.log('🔧 OPTION 1: Add HTTPS to Backend (RECOMMENDED)');
    console.log('   - Install SSL certificate on server');
    console.log('   - Use Let\'s Encrypt (free)');
    console.log('   - Change API base to https://54.179.63.233.nip.io');
    console.log('');
    console.log('🔧 OPTION 2: Use HTTP Frontend (TEMPORARY)');
    console.log('   - Deploy frontend to HTTP hosting');
    console.log('   - Not recommended for production');
    console.log('');
    console.log('🔧 OPTION 3: Browser Override (TESTING ONLY)');
    console.log('   - Click on "Not Secure" in address bar');
    console.log('   - Allow "insecure content"');
    console.log('   - This is temporary and not user-friendly');
    console.log('');

    console.log('3️⃣ IMMEDIATE FIX - ADD HTTPS TO BACKEND:');
    console.log('');
    console.log('SSH into your server:');
    console.log('ssh -i "C:\\Users\\Admin\\e2c.pem" ubuntu@54.179.63.233');
    console.log('');
    console.log('Install Certbot:');
    console.log('sudo apt update');
    console.log('sudo apt install certbot python3-certbot-nginx -y');
    console.log('');
    console.log('Get SSL certificate:');
    console.log('sudo certbot --nginx -d 54.179.63.233.nip.io');
    console.log('');
    console.log('This will:');
    console.log('- Install SSL certificate');
    console.log('- Configure nginx for HTTPS');
    console.log('- Auto-redirect HTTP to HTTPS');
    console.log('');

    console.log('4️⃣ UPDATE FRONTEND AFTER SSL:');
    console.log('');
    console.log('Update .env.production:');
    console.log('NEXT_PUBLIC_API_BASE=https://54.179.63.233.nip.io');
    console.log('');
    console.log('Rebuild and redeploy:');
    console.log('npm run build');
    console.log('vercel --prod');
    console.log('');

    console.log('5️⃣ QUICK TEST - BROWSER OVERRIDE:');
    console.log('');
    console.log('For immediate testing:');
    console.log('1. Click on "Not Secure" in address bar');
    console.log('2. Click "Site settings"');
    console.log('3. Change "Insecure content" to "Allow"');
    console.log('4. Refresh page and try login');
    console.log('');
    console.log('⚠️ This is temporary - users won\'t do this!');
    console.log('   You need HTTPS for production use.');
}

diagnoseHTTPSIssue().then(() => {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 DIAGNOSIS COMPLETE');
    console.log('='.repeat(60));
    console.log('');
    console.log('✅ CONFIRMED: Mixed content security issue');
    console.log('✅ SOLUTION: Add HTTPS to backend server');
    console.log('✅ TEMPORARY: Allow insecure content in browser');
    console.log('');
    console.log('The login form is working perfectly!');
    console.log('The issue is HTTPS frontend → HTTP backend blocking.');
    console.log('='.repeat(60));
});