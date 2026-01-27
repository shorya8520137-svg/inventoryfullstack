require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();

// ===============================
// MIDDLEWARE
// ===============================
app.use(cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(morgan("dev"));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// ===============================
// DATABASE
// ===============================
require("./db/connection");

// ===============================
// AUTH ROUTES (PUBLIC - NO JWT REQUIRED)
// ===============================
app.use("/api/auth", require("./routes/authRoutes"));

// ===============================
// ROUTES (FRONTEND COMPATIBLE)
// ===============================

// permissions routes (FIRST - before global auth middleware)
app.use('/api', require('./routes/permissionsRoutes'));

// users routes (profile management)
app.use('/api/users', require('./routes/usersRoutes'));

// ===============================
// PROTECTED ROUTES (JWT REQUIRED)
// ===============================
const { authenticateToken } = require('./middleware/auth');

// Apply JWT authentication to all API routes except auth and permissions
app.use('/api', (req, res, next) => {
    // Skip authentication for auth routes and user management (handled in permissionsRoutes)
    if (req.path.startsWith('/auth') || 
        req.path.startsWith('/users') || 
        req.path.startsWith('/roles') || 
        req.path.startsWith('/permissions')) {
        return next();
    }
    // Apply authentication to all other routes
    authenticateToken(req, res, next);
});
app.use("/api/dispatch", require("./routes/dispatchRoutes"));
app.use("/api/dispatch-beta", require("./routes/dispatchRoutes")); // existing

// 🔥 PRODUCT ROUTES (ADDED)
app.use("/api/products", require("./routes/productRoutes"));

// inventory routes
app.use('/api/inventory', require('./routes/inventoryRoutes'));

// bulk uplode routes
app.use('/api/bulk-upload', require('./routes/bulkUploadRoutes'));

// damage recovery routes
app.use('/api/damage-recovery', require('./routes/damageRecoveryRoutes'));

// returns routes
app.use('/api/returns', require('./routes/returnsRoutes'));

// timeline routes
app.use('/api/timeline', require('./routes/timelineRoutes'));

// debug routes (temporary for testing)
app.use('/api/debug', require('./routes/debugRoutes'));

// order tracking routes
app.use('/api/order-tracking', require('./routes/orderTrackingRoutes'));

// orders alias (for frontend compatibility)
app.use('/api/orders', require('./routes/orderTrackingRoutes'));

// self transfer routes
app.use('/api/self-transfer', require('./routes/selfTransferRoutes'));

// notification routes
app.use('/api/notifications', require('./routes/notificationRoutes'));

// two-factor authentication routes
app.use('/api/2fa', require('./routes/twoFactorRoutes'));

// auth routes (no /api prefix for backward compatibility)
app.use('/auth', require('./routes/authRoutes'));

// ===============================
// HEALTH CHECK
// ===============================
app.get("/", (req, res) => {
    res.status(200).json({
        status: "OK",
        service: "Inventory Backend",
        timestamp: new Date().toISOString(),
    });
});

// ===============================
// GLOBAL ERROR HANDLER
// ===============================
app.use((err, req, res, next) => {
    console.error("[SERVER ERROR]", err);
    res.status(500).json({
        success: false,
        error: err.message || "Internal Server Error",
    });
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
    console.log("======================================");
    console.log("🚀 Inventory Backend Started");
    console.log(`🌍 Port: ${PORT}`);
    console.log("======================================");
});
