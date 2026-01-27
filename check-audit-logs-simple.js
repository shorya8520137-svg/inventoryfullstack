const axios = require('axios');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

async function checkRawAuditLogs() {
    try {
        const loginResponse = await axios.post('https://13.60.36.159.nip.io/api/auth/login', {
            email: 'admin@company.com',
            password: 'admin@123'
        });
        
        const token = loginResponse.data.token;
        
        const auditResponse = await axios.get('https://13.60.36.159.nip.io/api/audit-logs?limit=10', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Recent audit logs:');
        auditResponse.data.data.logs.forEach((log, i) => {
            console.log(`${i+1}. ACTION: "${log.action}" RESOURCE: "${log.resource}" USER: "${log.user_name}" TIME: ${log.created_at}`);
            if (log.details) {
                console.log(`   Details: ${log.details.substring(0, 100)}...`);
            }
        });
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkRawAuditLogs();