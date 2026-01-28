/**
 * COMPREHENSIVE CONNECTION DIAGNOSIS
 * Since AWS Security Group is configured correctly, let's find the real issue
 */

const axios = require('axios');
const { execSync } = require('child_process');

const SERVER_IP = '54.179.63.233';
const SSH_KEY = 'C:\\Users\\Admin\\e2c.pem';

console.log('🔍 COMPREHENSIVE CONNECTION DIAGNOSIS');
console.log('='.repeat(60));
console.log('✅ AWS Security Group: Configured (ports 22, 80, 443, 5000)');
console.log('🔗 Server IP:', SERVER_IP);

async function diagnoseConnection() {
    console.log('\n1️⃣ Testing Direct IP Access...');
    
    // Test different combinations
    const testUrls = [
        `http://${SERVER_IP}`,           // Port 80
        `http://${SERVER_IP}:5000`,      // Port 5000
        `https://${SERVER_IP}`,          // Port 443
        `https://${SERVER_IP}.nip.io`,   // nip.io HTTPS
        `http://${SERVER_IP}.nip.io`,    // nip.io HTTP
    ];
    
    for (const url of testUrls) {
        try {
            console.log(`\n🔗 Testing: ${url}`);
            const response = await axios.get(`${url}/api/health`, { 
                timeout: 8000,
                validateStatus: () => true // Accept any status
            });
            console.log(`✅ Response: ${response.status} - ${JSON.stringify(response.data)}`);
        } catch (error) {
            if (error.code === 'ECONNREFUSED') {
                console.log('❌ Connection refused - Service not running on this port');
            } else if (error.code === 'ETIMEDOUT' || error.message.includes('timeout')) {
                console.log('❌ Timeout - Port may be blocked or service not responding');
            } else if (error.code === 'ENOTFOUND') {
                console.log('❌ DNS resolution failed');
            } else {
                console.log(`❌ Error: ${error.message}`);
            }
        }
    }
    
    console.log('\n2️⃣ Checking Server Configuration via SSH...');
    
    try {
        // Check what's actually listening on the server
        console.log('\n🔍 Checking listening ports...');
        const portsResult = execSync(`ssh -i "${SSH_KEY}" ubuntu@${SERVER_IP} "sudo ss -tlnp | grep -E ':(80|443|5000)'"`, { encoding: 'utf8', timeout: 10000 });
        console.log('✅ Listening ports:');
        console.log(portsResult);
        
        // Check if nginx is running
        console.log('\n🔍 Checking nginx status...');
        try {
            const nginxResult = execSync(`ssh -i "${SSH_KEY}" ubuntu@${SERVER_IP} "sudo systemctl status nginx --no-pager -l"`, { encoding: 'utf8', timeout: 10000 });
            console.log('✅ Nginx status:');
            console.log(nginxResult.substring(0, 500) + '...');
        } catch (nginxError) {
            console.log('⚠️ Nginx not running or not installed');
        }
        
        // Check Node.js server
        console.log('\n🔍 Checking Node.js server...');
        const nodeResult = execSync(`ssh -i "${SSH_KEY}" ubuntu@${SERVER_IP} "ps aux | grep 'node server.js' | grep -v grep"`, { encoding: 'utf8', timeout: 10000 });
        console.log('✅ Node.js server:');
        console.log(nodeResult);
        
        // Test internal API call
        console.log('\n🔍 Testing internal API call...');
        const internalResult = execSync(`ssh -i "${SSH_KEY}" ubuntu@${SERVER_IP} "curl -s -m 5 http://localhost:5000/api/health"`, { encoding: 'utf8', timeout: 10000 });
        console.log('✅ Internal API response:');
        console.log(internalResult);
        
    } catch (sshError) {
        console.log('❌ SSH diagnostic failed:', sshError.message);
    }
    
    console.log('\n3️⃣ DNS Resolution Test...');
    try {
        // Test nip.io resolution
        const dnsResult = execSync(`nslookup ${SERVER_IP}.nip.io`, { encoding: 'utf8', timeout: 10000 });
        console.log('✅ DNS Resolution:');
        console.log(dnsResult);
    } catch (dnsError) {
        console.log('❌ DNS resolution failed:', dnsError.message);
    }
}

diagnoseConnection().then(() => {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 DIAGNOSIS COMPLETE');
    console.log('='.repeat(60));
    console.log('Based on the results above, we can identify:');
    console.log('1. Which ports are actually listening');
    console.log('2. If nginx reverse proxy is needed');
    console.log('3. If nip.io DNS is resolving correctly');
    console.log('4. If the Node.js server is accessible internally');
    console.log('='.repeat(60));
}).catch(console.error);