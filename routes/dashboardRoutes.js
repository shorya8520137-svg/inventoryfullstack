const express = require('express');
const router = express.Router();

// GET /api/dashboard/kpis - Key Performance Indicators
router.get('/kpis', (req, res) => {
    res.json({
        success: true,
        data: {
            totalOrders: 1250,
            totalRevenue: 125000,
            totalProducts: 450,
            lowStockItems: 23
        }
    });
});

// GET /api/dashboard/dispatch-heatmap - Dispatch heatmap data
router.get('/dispatch-heatmap', (req, res) => {
    const { range = 'week' } = req.query;
    
    res.json({
        success: true,
        range,
        data: [
            { day: 'Mon', dispatches: 45 },
            { day: 'Tue', dispatches: 52 },
            { day: 'Wed', dispatches: 38 },
            { day: 'Thu', dispatches: 61 },
            { day: 'Fri', dispatches: 55 },
            { day: 'Sat', dispatches: 28 },
            { day: 'Sun', dispatches: 15 }
        ]
    });
});

// GET /api/dashboard/warehouse-volume - Warehouse volume data
router.get('/warehouse-volume', (req, res) => {
    res.json({
        success: true,
        data: [
            { warehouse: 'GGM_WH', volume: 1250, capacity: 2000 },
            { warehouse: 'BLR_WH', volume: 890, capacity: 1500 },
            { warehouse: 'MUM_WH', volume: 1450, capacity: 2500 },
            { warehouse: 'AMD_WH', volume: 670, capacity: 1200 },
            { warehouse: 'HYD_WH', volume: 920, capacity: 1800 }
        ]
    });
});

// GET /api/dashboard/revenue-cost - Revenue vs Cost data
router.get('/revenue-cost', (req, res) => {
    res.json({
        success: true,
        data: {
            revenue: [
                { month: 'Jan', amount: 45000 },
                { month: 'Feb', amount: 52000 },
                { month: 'Mar', amount: 48000 },
                { month: 'Apr', amount: 61000 },
                { month: 'May', amount: 58000 },
                { month: 'Jun', amount: 65000 }
            ],
            cost: [
                { month: 'Jan', amount: 32000 },
                { month: 'Feb', amount: 38000 },
                { month: 'Mar', amount: 35000 },
                { month: 'Apr', amount: 42000 },
                { month: 'May', amount: 40000 },
                { month: 'Jun', amount: 45000 }
            ]
        }
    });
});

// GET /api/dashboard/activity - Recent activity
router.get('/activity', (req, res) => {
    res.json({
        success: true,
        data: [
            { id: 1, type: 'dispatch', message: 'Order #1234 dispatched to GGM_WH', timestamp: new Date().toISOString() },
            { id: 2, type: 'stock', message: 'Low stock alert for Product ABC', timestamp: new Date().toISOString() },
            { id: 3, type: 'return', message: 'Return processed for Order #1230', timestamp: new Date().toISOString() }
        ]
    });
});

module.exports = router;
