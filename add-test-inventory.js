#!/usr/bin/env node

// Disable SSL certificate validation for testing
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const axios = require('axios');

const BASE_URL = 'https://16.171.161.150.nip.io';

async function addInventory() {
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

        // Add inventory for test products
        const products = [
            { barcode: '2450', quantity: 100, warehouse: 'GGM', product_name: 'Test Product 1' },
            { barcode: '2451', quantity: 100, warehouse: 'GGM', product_name: 'Multi Product Set' },
            { barcode: '2452', quantity: 100, warehouse: 'GGM', product_name: 'Amit Product Bundle' },
            { barcode: '2453', quantity: 100, warehouse: 'GGM', product_name: 'Admin Premium Product' }
        ];

        console.log('\n📦 Adding inventory for test products...');
        
        for (const product of products) {
            try {
                console.log(`\n📝 Adding inventory for barcode ${product.barcode}...`);
                
                const inventoryData = {
                    barcode: product.barcode,
                    product_name: product.product_name,
                    warehouse: product.warehouse,
                    qty: product.quantity,
                    unit_cost: 100,
                    variant: 'Standard',
                    source_type: 'OPENING'
                };

                const response = await axios.post(`${BASE_URL}/api/inventory/add-stock`, inventoryData, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log(`✅ Added ${product.quantity} units for ${product.barcode}`);
                
            } catch (error) {
                console.error(`❌ Failed to add inventory for ${product.barcode}:`, error.response?.data?.message || error.message);
            }
        }

        console.log('\n🎉 Inventory addition completed!');
        
    } catch (error) {
        console.error('❌ Error:', error.response?.data?.message || error.message);
    }
}

addInventory();