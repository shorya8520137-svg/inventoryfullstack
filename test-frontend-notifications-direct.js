// Test frontend notification API directly
const https = require('https');

const testFrontendNotifications = async () => {
    console.log('🔍 Testing Frontend Notification API Integration...\n');

    // Test the exact API call that should work
    console.log('Testing: GET /api/notifications/stats?user_id=3');
    
    try {
        const response = await makeAPIRequest('/api/notifications/stats?user_id=3');
        console.log('✅ API Response:', JSON.stringify(response, null, 2));
        
        if (response.success && response.data) {
            console.log('\n📊 Notification Stats:');
            console.log(`   Total: ${response.data.total}`);
            console.log(`   Unread: ${response.data.unread}`);
            console.log(`   Dispatch: ${response.data.dispatch_count}`);
            console.log(`   Returns: ${response.data.return_count}`);
            
            if (response.data.unread > 0) {
                console.log('\n🔔 You have unread notifications! Frontend should show these.');
            } else {
                console.log('\n✅ All notifications are read.');
            }
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
        console.log('\n🔍 Debugging suggestions:');
        console.log('1. Check if server is running on port 5000');
        console.log('2. Verify API base URL in .env.local');
        console.log('3. Check if token is valid');
    }
};

function makeAPIRequest(path) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '13.48.248.180.nip.io',
            port: 443,
            path: path,
            method: 'GET',
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJ0ZXRzdGV0c3Rlc3RkdEBjb21wYW55LmNvbSIsIm5hbWUiOiJ0ZXN0aXVxd2V1cXciLCJyb2xlX2lkIjozNywicm9sZV9uYW1lIjoidGVzdCIsImlhdCI6MTc2ODgxMDIzMywiZXhwIjoxNzY4ODk2NjMzLCJhdWQiOiJpbnZlbnRvcnktdXNlcnMiLCJpc3MiOiJpbnZlbnRvcnktc3lzdGVtIn0.ZLyVNJ0FsviMqPmYZW3FIA8El6ytmNm_fOO5obaCRlA',
                'Content-Type': 'application/json'
            },
            rejectUnauthorized: false
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve(parsed);
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${parsed.message || data}`));
                    }
                } catch (e) {
                    reject(new Error(`Parse error: ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.end();
    });
}

testFrontendNotifications().catch(console.error);