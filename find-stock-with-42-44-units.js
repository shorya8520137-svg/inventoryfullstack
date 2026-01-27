/**
 * FIND STOCK WITH 42-44 UNITS
 * Find products that have stock between 42-44 units for dispatch testing
 */

const axios = require('axios');
const https = require('https');

const api = axios.create({
    httpsAgent: new https.Agent({
        rejectUnauthorized: false
    }),
    timeout: 10000
});

const API_BASE = 'https://16.171.5.50.nip.io';
const ADMIN_CREDENTIALS = {
    email: 'admin@company.com',
    password: 'admin@123'
};

console.log('🔍 FINDING STOCK WITH 42-44 UNITS');
console.log('='.repeat(50));

async function findStockWithTargetUnits() {
    try {
        // Step 1: Login
        console.log('\n🔐 Step 1: Login');
        const loginResponse = await api.post(`${API_BASE}/api/auth/login`, ADMIN_CREDENTIALS);
        
        if (!loginResponse.data.token) {
            console.log('❌ Login failed');
            return;
        }
        
        const token = loginResponse.data.token;
        console.log('✅ Login successful');
        
        // Step 2: Search for products with stock
        console.log('\n📦 Step 2: Searching for products with stock...');
        
        // Try different search terms to find products
        const searchTerms = ['product', 'item', 'stock', 'test', 'sample'];
        let foundProducts = [];
        
        for (const term of searchTerms) {
            try {
                const searchResponse = await api.get(`${API_BASE}/api/dispatch/search-products?query=${term}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (searchResponse.data && searchResponse.data.length > 0) {
                    foundProducts = [...foundProducts, ...searchResponse.data];
                    console.log(`📋 Found ${searchResponse.data.length} products for term "${term}"`);
                }
            } catch (error) {
                console.log(`⚠️  Search failed for term "${term}":`, error.message);
            }
        }
        
        if (foundProducts.length === 0) {
            console.log('❌ No products found through search API');
            console.log('💡 Let me try to check inventory directly...');
            
            // Try checking specific barcodes from the range 2460-3499
            console.log('\n🔍 Step 3: Checking specific barcodes for stock...');
            const testBarcodes = [];
            
            // Generate some test barcodes from the range
            for (let i = 0; i < 20; i++) {
                const barcode = Math.floor(Math.random() * (3499 - 2460 + 1)) + 2460;
                testBarcodes.push(barcode.toString());
            }
            
            console.log(`🧪 Testing ${testBarcodes.length} random barcodes from range 2460-3499...`);
            
            for (const barcode of testBarcodes) {
                try {
                    const inventoryResponse = await api.get(`${API_BASE}/api/dispatch/check-inventory?warehouse=WH001&barcode=${barcode}&qty=1`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    if (inventoryResponse.data && inventoryResponse.data.available > 0) {
                        const available = inventoryResponse.data.available;
                        console.log(`📦 Barcode ${barcode}: ${available} units available`);
                        
                        if (available >= 42 && available <= 44) {
                            console.log(`🎯 PERFECT MATCH! Barcode ${barcode} has ${available} units (target: 42-44)`);
                            return barcode;
                        } else if (available >= 1) {
                            console.log(`✅ Usable: Barcode ${barcode} has ${available} units`);
                        }
                    }
                } catch (error) {
                    // Silently continue - most barcodes won't exist
                }
            }
            
            console.log('\n❌ No products found with 42-44 units in the tested range');
            console.log('💡 Let me try a broader search...');
            
            // Try some common warehouse codes
            const warehouses = ['WH001', 'BLR_WH', 'GGM_WH', 'DEL_WH', 'MUM_WH'];
            
            for (const warehouse of warehouses) {
                console.log(`\n🏢 Checking warehouse: ${warehouse}`);
                
                for (const barcode of testBarcodes.slice(0, 5)) {
                    try {
                        const inventoryResponse = await api.get(`${API_BASE}/api/dispatch/check-inventory?warehouse=${warehouse}&barcode=${barcode}&qty=1`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        });
                        
                        if (inventoryResponse.data && inventoryResponse.data.available > 0) {
                            const available = inventoryResponse.data.available;
                            console.log(`📦 ${warehouse} - Barcode ${barcode}: ${available} units`);
                            
                            if (available >= 42 && available <= 44) {
                                console.log(`🎯 PERFECT MATCH! ${warehouse} - Barcode ${barcode} has ${available} units`);
                                return { barcode, warehouse, available };
                            }
                        }
                    } catch (error) {
                        // Continue silently
                    }
                }
            }
            
        } else {
            console.log(`\n📋 Found ${foundProducts.length} total products`);
            
            // Check stock levels for found products
            console.log('\n📊 Checking stock levels...');
            
            for (const product of foundProducts.slice(0, 10)) {
                try {
                    const inventoryResponse = await api.get(`${API_BASE}/api/dispatch/check-inventory?warehouse=WH001&barcode=${product.barcode}&qty=1`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    
                    if (inventoryResponse.data && inventoryResponse.data.available > 0) {
                        const available = inventoryResponse.data.available;
                        console.log(`📦 ${product.product_name} (${product.barcode}): ${available} units`);
                        
                        if (available >= 42 && available <= 44) {
                            console.log(`🎯 PERFECT MATCH! ${product.product_name} has ${available} units`);
                            return {
                                barcode: product.barcode,
                                product_name: product.product_name,
                                variant: product.product_variant,
                                warehouse: 'WH001',
                                available
                            };
                        }
                    }
                } catch (error) {
                    console.log(`⚠️  Could not check stock for ${product.barcode}`);
                }
            }
        }
        
        console.log('\n💡 RECOMMENDATIONS:');
        console.log('1. Use any barcode with available stock > 0 for testing');
        console.log('2. The exact 42-44 units range might not exist in current data');
        console.log('3. Focus on testing the audit system with any available stock');
        
        return null;
        
    } catch (error) {
        console.log('❌ Search failed:', error.message);
        if (error.response) {
            console.log('📊 Response status:', error.response.status);
            console.log('📊 Response data:', error.response.data);
        }
    }
}

findStockWithTargetUnits().then(result => {
    if (result) {
        console.log('\n🎉 SUCCESS! Found suitable product:');
        console.log(JSON.stringify(result, null, 2));
    } else {
        console.log('\n❌ No products found with 42-44 units');
        console.log('💡 Will use any available stock for audit testing');
    }
});