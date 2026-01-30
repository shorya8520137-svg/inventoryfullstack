/**
 * GET JWT TOKEN SCRIPT
 * Run this on the server to get a valid JWT token
 * Usage: node get-jwt-token.js
 */

const jwt = require('jsonwebtoken');

// JWT configuration (should match your server's JWT_SECRET)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Create a test JWT token for admin user
const payload = {
    id: 1,
    email: 'admin@company.com',
    name: 'Admin User',
    role_id: 1,
    role_name: 'Admin',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    aud: 'inventory-users',
    iss: 'inventory-system'
};

try {
    const token = jwt.sign(payload, JWT_SECRET);
    
    console.log('🎫 JWT TOKEN GENERATED:');
    console.log('='.repeat(80));
    console.log(token);
    console.log('='.repeat(80));
    console.log('');
    console.log('📋 Token Details:');
    console.log(`👤 User: ${payload.email}`);
    console.log(`🆔 User ID: ${payload.id}`);
    console.log(`🔑 Role: ${payload.role_name}`);
    console.log(`⏰ Expires: ${new Date(payload.exp * 1000).toISOString()}`);
    console.log('');
    console.log('🚀 Usage:');
    console.log(`node test-with-jwt.js ${token}`);
    
} catch (error) {
    console.error('❌ Error generating token:', error.message);
    console.log('');
    console.log('💡 Make sure JWT_SECRET is set in your environment');
    console.log('💡 Or update the JWT_SECRET variable in this script');
}