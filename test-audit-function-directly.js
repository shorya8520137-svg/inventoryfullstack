const db = require('./db/connection');

// Test the audit logging function directly
function createAuditLog(userId, action, resource, resourceId, details, callback) {
    const sql = `
        INSERT INTO audit_logs (user_id, action, resource, resource_id, details, ip_address, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    // Extract IP and user agent from details if provided
    const ipAddress = details?.ip_address || '127.0.0.1';
    const userAgent = details?.user_agent || 'Unknown';
    
    // Clean details (remove IP and user agent to avoid duplication)
    const cleanDetails = { ...details };
    delete cleanDetails.ip_address;
    delete cleanDetails.user_agent;
    
    const values = [
        userId,
        action,
        resource,
        resourceId,
        JSON.stringify(cleanDetails),
        ipAddress,
        userAgent
    ];
    
    console.log('🔍 About to insert audit log with values:', values);
    
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('❌ Create audit log error:', err);
        } else {
            console.log(`✅ Audit logged: ${action} ${resource} by user ${userId} from ${ipAddress}`);
            console.log('📝 Insert result:', result);
        }
        if (callback) callback(err, result);
    });
}

// Test the function
console.log('🧪 Testing audit logging function directly...');

createAuditLog(1, 'TEST_RETURN_CREATE', 'RETURN', 999, {
    order_ref: 'TEST-ORDER-123',
    product_type: 'Test Product',
    warehouse: 'TEST_WH',
    quantity: 1,
    barcode: 'TEST-BARCODE',
    ip_address: '192.168.1.100',
    user_agent: 'Test-Client/1.0'
}, (err, result) => {
    if (err) {
        console.error('❌ Test failed:', err);
    } else {
        console.log('✅ Test successful! Audit log created with ID:', result.insertId);
    }
    
    // Close the database connection
    db.end();
});