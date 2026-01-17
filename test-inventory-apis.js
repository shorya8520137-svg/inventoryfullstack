#!/usr/bin/env node

// Disable SSL certificate validation for testing
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const axios = require('axios');

const BASE_URL = 'https://13.51.56.188.nip.io';

// Helper function to make API requests
async function apiRequest(method, endpoint, data = null, token = null) {
    const config = {
        method,
        url: `${BASE_URL}${endpoint}`,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        },
        ...(data && { data })
    };

    try {
        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return { 
            success: false, 
            error: error.response?.data || error.message, 
            status: error.response?.status || 0 
        };
    }
}

async function testInventoryAPIs() {
    console.log('🧪 TESTING ALL INVENTORY APIs');
    console.log('='.repeat(50));
    
    let token = null;
    
    try {
        // Step 1: Login to get token
        console.log('\n🔐 Step 1: Authentication...');
        const loginResult = await apiRequest('POST', '/api/auth/login', {
            email: 'admin@company.com',
            password: 'admin@123'
        });
        
        if (!loginResult.success) {
            console.log('❌ Login failed:', loginResult.error);
            return;
        }
        
        token = loginResult.data.token;
        console.log('✅ Login successful');
        
        // Step 2: Test Health Check
        console.log('\n🏥 Step 2: Health Check...');
        const healthResult = await apiRequest('GET', '/api/health');
        console.log(healthResult.success ? '✅ Health check passed' : '❌ Health check failed:', healthResult.error);
        
        // Step 3: Test Get All Products
        console.log('\n📦 Step 3: Get All Products...');
        const productsResult = await apiRequest('GET', '/api/products', null, token);
        if (productsResult.success) {
            console.log(`✅ Products API: Found ${productsResult.data.data?.length || 0} products`);
        } else {
            console.log('❌ Products API failed:', productsResult.error);
        }
        
        // Step 4: Test Get Warehouses
        console.log('\n🏭 Step 4: Get Warehouses...');
        const warehousesResult = await apiRequest('GET', '/api/warehouses', null, token);
        if (warehousesResult.success) {
            console.log(`✅ Warehouses API: Found ${warehousesResult.data.data?.length || 0} warehouses`);
        } else {
            console.log('❌ Warehouses API failed:', warehousesResult.error);
        }
        
        // Step 5: Test Product by Barcode
        console.log('\n🔍 Step 5: Get Product by Barcode (3006-1999)...');
        const productResult = await apiRequest('GET', '/api/products/3006-1999', null, token);
        if (productResult.success) {
            console.log('✅ Product by barcode API working');
        } else {
            console.log('❌ Product by barcode API failed:', productResult.error);
        }
        
        // Step 6: Test Stock Levels
        console.log('\n📊 Step 6: Check Stock Levels...');
        const stockResult = await apiRequest('GET', '/api/inventory/stock?warehouse=GGM_WH&barcode=3006-1999', null, token);
        if (stockResult.success) {
            console.log('✅ Stock levels API working');
        } else {
            console.log('❌ Stock levels API failed:', stockResult.error);
        }
        
        // Step 7: Test Product Tracking
        console.log('\n📍 Step 7: Product Tracking...');
        const trackingResult = await apiRequest('GET', '/api/product-tracking/3006-1999', null, token);
        if (trackingResult.success) {
            console.log('✅ Product tracking API working');
        } else {
            console.log('❌ Product tracking API failed:', trackingResult.error);
        }
        
        // Step 8: Test Inventory Movements
        console.log('\n📋 Step 8: Inventory Movements...');
        const movementsResult = await apiRequest('GET', '/api/inventory/movements?barcode=3006-1999&warehouse=GGM_WH', null, token);
        if (movementsResult.success) {
            console.log('✅ Inventory movements API working');
        } else {
            console.log('❌ Inventory movements API failed:', movementsResult.error);
        }
        
        // Step 9: Test Stock Batches
        console.log('\n📦 Step 9: Stock Batches...');
        const batchesResult = await apiRequest('GET', '/api/inventory/batches?barcode=2798-3999', null, token);
        if (batchesResult.success) {
            console.log('✅ Stock batches API working');
        } else {
            console.log('❌ Stock batches API failed:', batchesResult.error);
        }
        
        // Step 10: Test Low Stock Alert
        console.log('\n⚠️ Step 10: Low Stock Alert...');
        const lowStockResult = await apiRequest('GET', '/api/inventory/low-stock?threshold=10', null, token);
        if (lowStockResult.success) {
            console.log('✅ Low stock alert API working');
        } else {
            console.log('❌ Low stock alert API failed:', lowStockResult.error);
        }
        
        // Step 11: Test Dispatch APIs
        console.log('\n🚚 Step 11: Dispatch APIs...');
        const dispatchResult = await apiRequest('GET', '/api/dispatch', null, token);
        if (dispatchResult.success) {
            console.log('✅ Dispatch API working');
        } else {
            console.log('❌ Dispatch API failed:', dispatchResult.error);
        }
        
        // Step 12: Test Returns APIs
        console.log('\n↩️ Step 12: Returns APIs...');
        const returnsResult = await apiRequest('GET', '/api/returns', null, token);
        if (returnsResult.success) {
            console.log('✅ Returns API working');
        } else {
            console.log('❌ Returns API failed:', returnsResult.error);
        }
        
        // Step 13: Test Damage Recovery APIs
        console.log('\n💥 Step 13: Damage Recovery APIs...');
        const damageResult = await apiRequest('GET', '/api/damage-recovery/log', null, token);
        if (damageResult.success) {
            console.log('✅ Damage recovery API working');
        } else {
            console.log('❌ Damage recovery API failed:', damageResult.error);
        }
        
        console.log('\n🎉 INVENTORY API TESTING COMPLETED!');
        console.log('='.repeat(50));
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testInventoryAPIs();