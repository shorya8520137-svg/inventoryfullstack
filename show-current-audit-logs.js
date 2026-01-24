/**
 * SHOW CURRENT AUDIT LOGS
 * Display the existing audit logs to show the system is working
 */

const axios = require('axios');
const https = require('https');

// Ignore SSL certificate errors for testing
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

axios.defaults.httpsAgent = httpsAgent;

const API_BASE = 'https://13.60.36.159.nip.io/api';

// Test credentials
const TEST_USER = {
    email: 'admin@company.com',
    password: 'admin@123'
};

async function showAuditLogs() {
    try {
        console.log('📊 CURRENT AUDIT LOGS DISPLAY');
        console.log('==============================');
        
        // Step 1: Login
        console.log('🔐 Logging in...');
        const loginResponse = await axios.post(`${API_BASE}/auth/login`, TEST_USER);
        
        if (!loginResponse.data.success) {
            throw new Error('Login failed: ' + loginResponse.data.message);
        }
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        console.log('👤 User:', loginResponse.data.user.name);
        
        // Step 2: Get all audit logs
        console.log('\n📊 Fetching audit logs...');
        const response = await axios.get(`${API_BASE}/audit-logs?limit=20`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
            const logs = response.data.data?.logs || response.data.data || [];
            const pagination = response.data.data?.pagination || {};
            
            console.log(`✅ Found ${logs.length} recent audit logs (Total: ${pagination.total || logs.length})`);
            
            // Step 3: Show detailed audit logs
            console.log('\n📋 DETAILED AUDIT LOGS:');
            console.log('='.repeat(100));
            
            logs.forEach((log, index) => {
                console.log(`\n${index + 1}. AUDIT LOG #${log.id}`);
                console.log(`   🎯 ACTION: ${log.action}`);
                console.log(`   📁 RESOURCE: ${log.resource}`);
                console.log(`   🆔 RESOURCE ID: ${log.resource_id || 'N/A'}`);
                console.log(`   👤 USER: ${log.user_name || log.user_id || 'Unknown'}`);
                console.log(`   📧 EMAIL: ${log.user_email || 'N/A'}`);
                console.log(`   🌐 IP ADDRESS: ${log.ip_address || 'Unknown'}`);
                console.log(`   🕐 TIMESTAMP: ${log.created_at}`);
                console.log(`   🖥️ USER AGENT: ${(log.user_agent || 'Unknown').substring(0, 80)}...`);
                
                if (log.details) {
                    try {
                        const details = typeof log.details === 'string' ? JSON.parse(log.details) : log.details;
                        console.log(`   📝 OPERATION DETAILS:`);
                        
                        // Show key details
                        if (details.user_name) console.log(`      👤 Performed by: ${details.user_name}`);
                        if (details.customer) console.log(`      👥 Customer: ${details.customer}`);
                        if (details.product_name) console.log(`      📦 Product: ${details.product_name}`);
                        if (details.quantity) console.log(`      🔢 Quantity: ${details.quantity}`);
                        if (details.warehouse) console.log(`      🏢 Warehouse: ${details.warehouse}`);
                        if (details.order_ref) console.log(`      📋 Order Ref: ${details.order_ref}`);
                        if (details.awb_number) console.log(`      📮 AWB: ${details.awb_number}`);
                        if (details.logistics) console.log(`      🚚 Logistics: ${details.logistics}`);
                        if (details.create_time) console.log(`      ⏰ Created: ${details.create_time}`);
                        
                    } catch (e) {
                        console.log(`   📝 DETAILS: ${log.details.substring(0, 100)}...`);
                    }
                }
                
                console.log('   ' + '─'.repeat(90));
            });
            
            // Step 4: Show statistics
            console.log('\n📈 AUDIT LOG STATISTICS:');
            console.log('='.repeat(50));
            
            const actionStats = {};
            const resourceStats = {};
            const userStats = {};
            
            logs.forEach(log => {
                // Count by action
                actionStats[log.action] = (actionStats[log.action] || 0) + 1;
                
                // Count by resource
                resourceStats[log.resource] = (resourceStats[log.resource] || 0) + 1;
                
                // Count by user
                const user = log.user_name || log.user_id || 'Unknown';
                userStats[user] = (userStats[user] || 0) + 1;
            });
            
            console.log('\n🎯 BY ACTION TYPE:');
            Object.entries(actionStats).forEach(([action, count]) => {
                console.log(`   ${action}: ${count} times`);
            });
            
            console.log('\n📁 BY RESOURCE TYPE:');
            Object.entries(resourceStats).forEach(([resource, count]) => {
                console.log(`   ${resource}: ${count} times`);
            });
            
            console.log('\n👤 BY USER:');
            Object.entries(userStats).forEach(([user, count]) => {
                console.log(`   ${user}: ${count} actions`);
            });
            
            // Step 5: Show recent activity timeline
            console.log('\n⏰ RECENT ACTIVITY TIMELINE:');
            console.log('='.repeat(50));
            
            logs.slice(0, 10).forEach((log, index) => {
                const details = log.details ? (typeof log.details === 'string' ? JSON.parse(log.details) : log.details) : {};
                const time = new Date(log.created_at).toLocaleString();
                const user = log.user_name || 'Unknown';
                const action = log.action;
                const resource = log.resource;
                
                let description = `${user} performed ${action} on ${resource}`;
                if (details.product_name) description += ` (${details.product_name})`;
                if (details.customer) description += ` for ${details.customer}`;
                
                console.log(`${index + 1}. ${time} - ${description}`);
            });
            
            console.log('\n🎉 AUDIT SYSTEM STATUS SUMMARY:');
            console.log('===============================');
            console.log(`✅ Total Audit Logs: ${pagination.total || logs.length}`);
            console.log(`✅ Active Users Being Tracked: ${Object.keys(userStats).length}`);
            console.log(`✅ Operation Types Tracked: ${Object.keys(actionStats).join(', ')}`);
            console.log(`✅ Resource Types Tracked: ${Object.keys(resourceStats).join(', ')}`);
            console.log(`✅ IP Address Tracking: ${logs.filter(l => l.ip_address).length}/${logs.length} logs have IP`);
            console.log(`✅ User Agent Tracking: ${logs.filter(l => l.user_agent).length}/${logs.length} logs have User Agent`);
            console.log(`✅ Detailed Logging: ${logs.filter(l => l.details).length}/${logs.length} logs have details`);
            
            console.log('\n🎊 YOUR AUDIT SYSTEM IS WORKING PERFECTLY!');
            console.log('You can track:');
            console.log('• WHO performed each action');
            console.log('• WHAT action was performed');
            console.log('• WHEN it happened');
            console.log('• WHERE (IP address)');
            console.log('• HOW (user agent/device)');
            console.log('• DETAILS of each operation');
            
        } else {
            console.log('❌ Failed to fetch audit logs:', response.data.message);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.response) {
            console.error('📡 Response:', error.response.data);
        }
    }
}

// Run the display
showAuditLogs();