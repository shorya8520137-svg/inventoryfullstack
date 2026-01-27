// NOTIFICATION API TEST WITH TOKEN - TERMINAL READY
// This script gets a fresh token and tests all notification endpoints

const https = require('https');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

const API_BASE = 'https://16.171.5.50.nip.io/api';
const LOGIN_EMAIL = 'tetstetstestdt@company.com';
const LOGIN_PASSWORD = 'gfx998sd';

console.log('🔔 NOTIFICATION API TEST WITH TOKEN');
console.log('===================================');

async function makeRequest(method, endpoint, data = null, token = null) {
    return new Promise((resolve, reject) => {
        const url = `${API_BASE}${endpoint}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        
        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }
        
        console.log(`📡 ${method} ${url}`);
        if (token) {
            console.log(`🔑 Token: ${token.substring(0, 20)}...`);
        }
        
        const req = https.request(url, options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(responseData);
                    resolve({
                        status: res.statusCode,
                        data: parsed,
                        raw: responseData
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: responseData,
                        raw: responseData
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function testNotificationAPI() {
    try {
        // 1. Login to get fresh token
        console.log('🔐 Step 1: Getting fresh JWT token...');
        const loginResponse = await makeRequest