const express = require('express');
const router = express.Router();

// POST /auth/login - Very permissive login for development
router.post('/login', (req, res) => {
    console.log('📝 Login request body:', req.body);
    
    const { username, password, email } = req.body;
    
    // Accept ANY credentials - super permissive
    // If email is provided, use it; otherwise use username or default to 'admin'
    const loginIdentifier = email || username || 'admin';
    const loginPassword = password || 'admin';
    
    console.log('✅ Login accepted:', loginIdentifier);
    
    // Always return 200 with valid response
    res.status(200).json({
        success: true,
        message: 'Login successful',
        user: {
            id: 1,
            username: loginIdentifier.split('@')[0], // Extract username from email
            email: loginIdentifier.includes('@') ? loginIdentifier : `${loginIdentifier}@example.com`,
            role: 'super_admin',
            name: loginIdentifier.split('@')[0].charAt(0).toUpperCase() + loginIdentifier.split('@')[0].slice(1)
        },
        token: 'mock-jwt-token-' + Date.now()
    });
});

// POST /auth/logout
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

// GET /auth/me - Get current user
router.get('/me', (req, res) => {
    res.json({
        success: true,
        user: {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            role: 'admin'
        }
    });
});

module.exports = router;
