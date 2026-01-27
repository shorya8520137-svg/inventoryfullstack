/**
 * DEBUG FRONTEND API CONNECTION
 * Test script to debug why frontend can't fetch notifications
 */

const axios = require('axios');

async function debugFrontendAPIConnection() {
    console.log('🔍 DEBUGGING FRONTEND API CONNECTION');
    console.log('====================================\n');
    
    // Test different API URLs that frontend might be using
    const testURLs = [
        'http://localhost:3001',  // Local backend
        'https://16-171-141-4.nip.io',  // Your server with nip.io
        'https://stockiq-backend.vercel.app',  // If you have backend on Vercel
        'https://your-backend-domain.com'  // Your actual backend domain
    ];
    
    try {
        // Step 1: Test login on each URL
        console.log('📋 Step 1: Testing Login on Different URLs');
        console.log('--------------------------------------------');
        
        let workingURL = null;
        let authToken = null;
        
        for (const baseURL of testURLs) {
            try {
                console.log(`🔗 Testing: ${baseURL}`);
                
                const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
                    email: 'admin@company.com',
                    password: 'admin@123'
                }, {
                    timeout: 5000
                });
                
                if (loginResponse.data.success) {
                    workingURL = baseURL;
                    authToken = loginResponse.data.token;
                    console.log(`✅ Login successful on: ${baseURL}`);
                    console.log(`🔑 Token: ${authToken.substring(0, 20)}...`);
                    break;
                } else {
                    console.log(`❌ Login failed on: ${baseURL}`);
                }
            } catch (error) {
                console.log(`❌ Connection failed to: ${baseURL} - ${error.message}`);
            }
        }
        
        if (!workingURL) {
            console.log('❌ No working backend URL found!');
            console.log('\n💡 Possible issues:');
            console.log('1. Backend server is not running');
            console.log('2. Wrong URL in frontend environment variables');
            console.log('3. CORS issues between frontend and backend');
            console.log('4. Network connectivity issues');
            return;
        }
        
        // Step 2: Test notifications API
        console.log(`\n📋 Step 2: Testing Notifications API on ${workingURL}`);
        console.log('--------------------------------------------------------');
        
        try {
            const notificationsResponse = await axios.get(`${workingURL}/api/notifications`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            
            if (notificationsResponse.data.success) {
                const { notifications, unreadCount } = notificationsResponse.data.data;
                console.log(`✅ Notifications API working`);
                console.log(`📊 Total notifications: ${notifications.length}`);
                console.log(`🔔 Unread count: ${unreadCount}`);
                
                if (notifications.length > 0) {
                    console.log('\n📄 Recent notifications:');
                    notifications.slice(0, 5).forEach((notif, index) => {
                        console.log(`   ${index + 1}. ID: ${notif.id} - ${notif.title}`);
                        console.log(`      Message: ${notif.message.substring(0, 60)}...`);
                        console.log(`      Type: ${notif.type}, Read: ${notif.is_read ? 'Yes' : 'No'}`);
                        console.log(`      Created: ${notif.created_at}`);
                    });
                } else {
                    console.log('⚠️ No notifications found in database');
                }
            } else {
                console.log(`❌ Notifications API failed: ${notificationsResponse.data.message}`);
            }
        } catch (error) {
            console.log(`❌ Notifications API error: ${error.message}`);
            if (error.response) {
                console.log(`   Status: ${error.response.status}`);
                console.log(`   Data:`, error.response.data);
            }
        }
        
        // Step 3: Check environment variables that frontend might be using
        console.log('\n📋 Step 3: Checking Environment Variables');
        console.log('-----------------------------------------');
        
        const envFiles = ['.env.local', '.env.production', '.env'];
        
        for (const envFile of envFiles) {
            try {
                const fs = require('fs');
                const path = require('path');
                const envPath = path.join(__dirname, envFile);
                
                if (fs.existsSync(envPath)) {
                    const envContent = fs.readFileSync(envPath, 'utf8');
                    console.log(`\n📄 ${envFile}:`);
                    
                    const apiUrlMatch = envContent.match(/NEXT_PUBLIC_API_URL=(.+)/);
                    const backendUrlMatch = envContent.match(/NEXT_PUBLIC_BACKEND_URL=(.+)/);
                    const baseUrlMatch = envContent.match(/NEXT_PUBLIC_BASE_URL=(.+)/);
                    
                    if (apiUrlMatch) {
                        console.log(`   NEXT_PUBLIC_API_URL: ${apiUrlMatch[1]}`);
                    }
                    if (backendUrlMatch) {
                        console.log(`   NEXT_PUBLIC_BACKEND_URL: ${backendUrlMatch[1]}`);
                    }
                    if (baseUrlMatch) {
                        console.log(`   NEXT_PUBLIC_BASE_URL: ${baseUrlMatch[1]}`);
                    }
                    
                    if (!apiUrlMatch && !backendUrlMatch && !baseUrlMatch) {
                        console.log('   ⚠️ No API URL environment variables found');
                    }
                } else {
                    console.log(`   ❌ ${envFile} not found`);
                }
            } catch (error) {
                console.log(`   ❌ Error reading ${envFile}: ${error.message}`);
            }
        }
        
        // Step 4: Test CORS
        console.log('\n📋 Step 4: Testing CORS');
        console.log('-----------------------');
        
        try {
            const corsResponse = await axios.options(`${workingURL}/api/notifications`, {
                headers: {
                    'Origin': 'https://your-vercel-app.vercel.app',
                    'Access-Control-Request-Method': 'GET',
                    'Access-Control-Request-Headers': 'authorization,content-type'
                }
            });
            
            console.log('✅ CORS preflight successful');
            console.log(`   Access-Control-Allow-Origin: ${corsResponse.headers['access-control-allow-origin']}`);
            console.log(`   Access-Control-Allow-Methods: ${corsResponse.headers['access-control-allow-methods']}`);
        } catch (error) {
            console.log(`❌ CORS preflight failed: ${error.message}`);
        }
        
        // Step 5: Recommendations
        console.log('\n📋 Step 5: Recommendations');
        console.log('--------------------------');
        
        console.log('🎯 WORKING BACKEND URL:', workingURL);
        console.log('');
        console.log('🔧 TO FIX FRONTEND CONNECTION:');
        console.log('');
        console.log('1. Update your frontend environment variables:');
        console.log(`   NEXT_PUBLIC_API_URL=${workingURL}`);
        console.log('');
        console.log('2. Check your frontend API calls in:');
        console.log('   - src/components/NotificationBell.jsx');
        console.log('   - src/utils/api.js (if exists)');
        console.log('');
        console.log('3. Ensure frontend is using the correct base URL:');
        console.log(`   const response = await fetch('${workingURL}/api/notifications', {`);
        console.log(`     headers: { 'Authorization': \`Bearer \${token}\` }`);
        console.log(`   });`);
        console.log('');
        console.log('4. Redeploy frontend after updating environment variables:');
        console.log('   npm run build && vercel --prod');
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

// Run the debug
debugFrontendAPIConnection();