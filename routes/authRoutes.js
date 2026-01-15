const express = require('express');
const router = express.Router();

// POST /auth/login - Simple login (no real auth for now)
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    // Mock authentication - accept any credentials
    if (username && password) {
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: 1,
                username: username,
                role: 'admin'
            },
            token: 'mock-jwt-token-' + Date.now()
        });
    } else {
        res.status(400).json({
            success: false,
            message: 'Username and password required'
        });
    }
});

// POST /auth/logout
router.post('/logout', (req, res) => {
    res.json({
        success: true,
        message: 'Logged out successfully'
    });
});

module.exports = router;
