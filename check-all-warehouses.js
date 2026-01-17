#!/usr/bin/env node

// Disable SSL certificate validation for testing
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const axios = require('axios');

const BASE_URL = 'https://16.171.161.150.nip.io';

async function checkAllWarehouses() {
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

        // Get all inventory with stock
        console.log('\n📦 Checking all inventory with stock...');
        const inventoryResponse = await axios.get(`${BASE_URL}/api/inventory?stockFilter=in-stock&limit=50`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const inventory = inventoryResponse.data.data || inventoryResponse.data;
        
        console.log('\n📊 Available products with stock (all warehouses):');
        console.log('='.repeat(80));
        
        if (inventory && inventory.length > 0) {
            // Group by warehouse
            const warehouseGroups = {};
            inventory.forEach(item => {
                const warehouse = item.warehouse || item.location_code || 'Unknown';
                if (!warehouseGroups[warehouse]) {
                    warehouseGroups[warehouse] = [];
                }
                warehouseGroups[warehouse].push(item);
            });

            Object.keys(warehouseGroups).forEach(warehouse => {
                console.log(`\n🏢 WAREHOUSE: ${warehouse}`);
                console.log('-'.repeat(50));
                
                warehouseGroups[warehouse].slice(0, 10).forEach((item, index) => {
                    const barcode = item.barcode || item.product_code;
                    const stock = item.qty_available || item.available_qty || item.stock || 0;
                    console.log(`${index + 1}. ${barcode} - ${item.product_name} (Stock: ${stock})`);
                });
                
                if (warehouseGroups[warehouse].length > 10) {
                    console.log(`... and ${warehouseGroups[warehouse].length - 10} more products`);
                }
            });

            // Find products in range 2450-3499 with stock
            console.log('\n🎯 Products in range 2450-3499 with stock:');
            console.log('='.repeat(60));
            
            const rangeProducts = inventory.filter(item => {
                const barcode = item.barcode || item.product_code;
                const code = parseInt(barcode);
                return code >= 2450 && code <= 3499;
            });

            if (rangeProducts.length > 0) {
                rangeProducts.forEach(item => {
                    const barcode = item.barcode || item.product_code;
                    const stock = item.qty_available || item.available_qty || item.stock || 0;
                    const warehouse = item.warehouse || item.location_code;
                    console.log(`✅ ${barcode} - ${item.product_name} (${warehouse}) - Stock: ${stock}`);
                });
            } else {
                console.log('❌ No products found in range 2450-3499 with stock');
            }

        } else {
            console.log('❌ No products with stock found in any warehouse');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data?.message || error.message);
    }
}

checkAllWarehouses();