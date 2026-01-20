// Debug script to test frontend notification API calls
const https = require('https');

// Test the exact same API call that frontend should be making
const testNotificationStats = async () => {
    console.log('🔍 Testing Frontend Notification API Issue...\n');

    // Test 1: Call without user_id (should work for global notifications)
    console.log('Test 1: Calling /api/notifications/stats (no user_id)');
    try {
        const response1 = await makeRequest('/api/notifications/stats');
        console.log('✅ Success:', JSON.stringify(response1, null, 2));
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Call with user_id=3 (your test user)
    console.log('Test 2: Calling /api/notifications/stats?user_id=3');
    try {
        const response2 = await makeRequest('/api/notifications/stats?user_id=3');
        console.log('✅ Success:', JSON.stringify(response2, null, 2));
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Call with user_id=1 (might be what frontend is trying)
    console.log('Test 3: Calling /api/notifications/stats?user_id=1');
    try {
        const response3 = await makeRequest('/api/notifications/stats?user_id=1');
        console.log('✅ Success:', JSON.stringify(response3, null, 2));
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
};

function makeRequest(path) {
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

// Run the test
testNotificationStats().catch(console.error);