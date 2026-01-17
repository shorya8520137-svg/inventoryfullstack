#!/usr/bin/env node

// Disable SSL certificate validation for testing
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const axios = require('axios');

const BASE_URL = 'https://16.171.161.150.nip.io';

async function checkStock() {
    try {
        // Login as admin
        console.log('🔐 Logging in as admin...');
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: "admin@company.com",
            password: "admin@123"
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        const token = loginResponse.data.token;
        console.log('✅ Admin logged in successfully');

        // Get inventory for GGM warehouse
        console.log('\n📦 Checking inventory for GGM warehouse...');
        const inventoryResponse = await axios.get(`${BASE_URL}/api/inventory?warehouse=GGM&stockFilter=in-stock&limit=20`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const inventory = inventoryResponse.data.data || inventoryResponse.data;
        
        console.log('\n📊 Available products with stock in GGM warehouse:');
        console.log('='.repeat(60));
        
        if (inventory && inventory.length > 0) {
            inventory.forEach((item, index) => {
                console.log(`${index + 1}. Barcode: ${item.barcode || item.product_code}`);
                console.log(`   Product: ${item.product_name}`);
                console.log(`   Stock: ${item.qty_available || item.available_qty || item.stock}`);
                console.log(`   Warehouse: ${item.warehouse || item.location_code}`);
                console.log('   ' + '-'.repeat(40));
            });
        } else {
            console.log('❌ No products with stock found in GGM warehouse');
        }

        // Also check products in range 2450-3499
        console.log('\n🔍 Checking specific barcode range 2450-3499...');
        for (let barcode = 2450; barcode <= 2460; barcode++) {
            try {
                const productResponse = await axios.get(`${BASE_URL}/api/inventory?search=${barcode}&warehouse=GGM`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const productData = productResponse.data.data || productResponse.data;
                if (productData && productData.length > 0) {
                    const product = productData[0];
                    const stock = product.qty_available || product.available_qty || product.stock || 0;
                    console.log(`✅ ${barcode}: ${product.product_name} - Stock: ${stock}`);
                } else {
                    console.log(`❌ ${barcode}: Not found or no stock`);
                }
            } catch (error) {
                console.log(`❌ ${barcode}: Error checking - ${error.response?.status || 'Unknown'}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data?.message || error.message);
    }
}

checkStock();