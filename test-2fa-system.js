/**
 * TEST 2FA SYSTEM
 * Test Google Authenticator 2FA functionality
 */

const API_BASE = 'https://16.171.141.4.nip.io';

async function test2FASystem() {
    console.log('🔍 Testing 2FA System');
    console.log(`📡 API Base: ${API_BASE}`);
    
    try {
        // Test 1: Login to get token
        console.log('\n1️⃣ Testing Login...');
        const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@company.com',
                password: 'admin@123'
            })
        });
        
        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
        }
        
        const loginData = await loginResponse.json();
        console.log('✅ Login successful');
        console.log(`👤 User: ${loginData.user.name}`);
        
        const token = loginData.token;
        
        // Test 2: Check 2FA status
        console.log('\n2️⃣ Testing 2FA Status...');
        const statusResponse = await fetch(`${API_BASE}/api/2fa/status`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (!statusResponse.ok) {
            throw new Error(`2FA Status failed: ${statusResponse.status} ${statusResponse.statusText}`);
        }
        
        const statusData = await statusResponse.json();
        console.log('✅ 2FA Status API working');
        console.log(`🔐 2FA Enabled: ${statusData.data.enabled}`);
        console.log(`📅 Setup Date: ${statusData.data.setupAt || 'Not set up'}`);
        console.log(`🔑 Backup Codes: ${statusData.data.backupCodesCount || 0}`);
        
        // Test 3: Generate 2FA setup (if not enabled)
        if (!statusData.data.enabled) {
            console.log('\n3️⃣ Testing 2FA Setup Generation...');
            const setupResponse = await fetch(`${API_BASE}/api/2fa/setup`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (setupResponse.ok) {
                const setupData = await setupResponse.json();
                console.log('✅ 2FA Setup generation working');
                console.log(`🔑 Secret generated: ${setupData.data.secret.substring(0, 8)}...`);
                console.log(`📱 QR Code generated: ${setupData.data.qrCodeUrl ? 'Yes' : 'No'}`);
                console.log(`🔐 Backup codes: ${setupData.data.backupCodes.length} codes`);
                
                console.log('\n📋 Sample backup codes:');
                setupData.data.backupCodes.slice(0, 3).forEach((code, index) => {
                    console.log(`   ${index + 1}. ${code}`);
                });
                
                console.log('\n💡 To complete setup:');
                console.log('1. Open Google Authenticator app');
                console.log('2. Scan the QR code or enter the secret manually');
                console.log('3. Enter the 6-digit code to verify and enable 2FA');
                
            } else {
                const errorData = await setupResponse.json();
                console.log(`⚠️ 2FA Setup: ${errorData.message}`);
            }
        } else {
            console.log('\n💡 2FA is already enabled for this user');
        }
        
        console.log('\n🎉 2FA System test completed!');
        console.log('\n📝 Available endpoints:');
        console.log('• GET  /api/2fa/status - Check 2FA status');
        console.log('• POST /api/2fa/setup - Generate 2FA setup');
        console.log('• POST /api/2fa/verify-enable - Verify and enable 2FA');
        console.log('• POST /api/2fa/verify - Verify 2FA token for login');
        console.log('• POST /api/2fa/disable - Disable 2FA');
        console.log('• POST /api/2fa/regenerate-backup-codes - Generate new backup codes');
        
        console.log('\n🌐 Frontend pages:');
        console.log('• /2fa-setup - 2FA setup wizard');
        
    } catch (error) {
        console.error('\n❌ 2FA System test FAILED:', error.message);
        console.log('\n🔧 Troubleshooting steps:');
        console.log('1. Make sure backend server is running');
        console.log('2. Check if 2FA database columns are added');
        console.log('3. Verify 2FA routes are loaded in server.js');
        console.log('4. Check if speakeasy and qrcode packages are installed');
    }
}

// Run the test
test2FASystem();