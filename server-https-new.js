const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

// Import your existing routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/usersRoutes');
const permissionsRoutes = require('./routes/permissionsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const orderTrackingRoutes = require('./routes/orderTrackingRoutes');
const twoFactorRoutes = require('./routes/twoFactorRoutes');

const app = express();

// CORS configuration
app.use(cors({
    origin: [
        'https://stockiqfullstacktest.vercel.app',
        'http://localhost:3000',
        'http://13.212.100.7.nip.io',
        'https://13.212.100.7.nip.io'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/permissions', permissionsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/orders', orderTrackingRoutes);
app.use('/api/2fa', twoFactorRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        protocol: 'HTTPS',
        message: 'Server is running with HTTPS support',
        server: '13.212.100.7'
    });
});

// SSL Certificate paths
const sslOptions = {
    key: fs.readFileSync('/etc/letsencrypt/live/13.212.100.7.nip.io/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/13.212.100.7.nip.io/fullchain.pem')
};

// Create HTTPS server
const httpsServer = https.createServer(sslOptions, app);

// Create HTTP server that redirects to HTTPS
const httpApp = express();
httpApp.use((req, res) => {
    res.redirect(301, `https://${req.headers.host}${req.url}`);
});
const httpServer = http.createServer(httpApp);

// Start servers
const HTTPS_PORT = 443;
const HTTP_PORT = 80;

httpsServer.listen(HTTPS_PORT, '0.0.0.0', () => {
    console.log(`🔒 HTTPS Server running on port ${HTTPS_PORT}`);
    console.log(`🌐 Access at: https://13.212.100.7.nip.io`);
});

httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
    console.log(`🔄 HTTP Server running on port ${HTTP_PORT} (redirects to HTTPS)`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    httpsServer.close(() => {
        httpServer.close(() => {
            console.log('Process terminated');
        });
    });
});

module.exports = app;
