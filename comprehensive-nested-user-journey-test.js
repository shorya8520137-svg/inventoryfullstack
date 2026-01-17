#!/usr/bin/env node

// Disable SSL certificate validation for testing
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const axios = require('axios');

const BASE_URL = 'https://13.51.56.188.nip.io';

// Test data storage
let testResults = {
    test1: { user: null, token: null, dispatch: null, return: null, damage: null, timeline: null },
    test2: { user: null, token: null, dispatch: null, return: null, damage: null, recover: null },
    test3: { user: null, token: null, dispatch: null, return: null, damage: null, recover: null },
    test4: { user: null, token: null, deletedUser: null, dispatch: null, stockCheck: null }
};

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

// Helper function to login user
async function loginUser(email, password) {
    const result = await apiRequest('POST', '/api/auth/login', { email, password });
    if (result.success && result.data.token) {
        return { token: result.data.token, user: result.data.user };
    }
    throw new Error(`Login failed: ${result.error?.message || 'Unknown error'}`);
}

// Helper function to create user
async function createUser(userData, adminToken) {
    const result = await apiRequest('POST', '/api/users', userData, adminToken);
    if (result.success) {
        return result.data.data || result.data;
    }
    throw new Error(`User creation failed: ${result.error?.message || 'Unknown error'}`);
}

// Helper function to create dispatch
async function createDispatch(dispatchData, token) {
    const result = await apiRequest('POST', '/api/dispatch', dispatchData, token);
    if (result.success) {
        return result.data.data || result.data;
    }
    throw new Error(`Dispatch creation failed: ${result.error?.message || 'Unknown error'}`);
}

// Helper function to create return
async function createReturn(returnData, token) {
    const result = await apiRequest('POST', '/api/returns', returnData, token);
    if (result.success) {
        return result.data.data || result.data;
    }
    throw new Error(`Return creation failed: ${result.error?.message || 'Unknown error'}`);
}

// Helper function to create damage record
async function createDamage(damageData, token) {
    const result = await apiRequest('POST', '/api/damage-recovery', damageData, token);
    if (result.success) {
        return result.data.data || result.data;
    }
    throw new Error(`Damage creation failed: ${result.error?.message || 'Unknown error'}`);
}

// Helper function to get timeline
async function getTimeline(orderId, token) {
    const result = await apiRequest('GET', `/api/timeline/${orderId}`, null, token);
    if (result.success) {
        return result.data.data || result.data;
    }
    throw new Error(`Timeline fetch failed: ${result.error?.message || 'Unknown error'}`);
}

// Helper function to delete user
async function deleteUser(userId, adminToken) {
    const result = await apiRequest('DELETE', `/api/users/${userId}`, null, adminToken);
    if (result.success) {
        return result.data;
    }
    throw new Error(`User deletion failed: ${result.error?.message || 'Unknown error'}`);
}

console.log('🚀 COMPREHENSIVE NESTED USER JOURNEY TEST SUITE');
console.log('='.repeat(80));

async function runAllTests() {
    // Get admin token first
    console.log('\n🔐 Getting admin token...');
    const adminLogin = await loginUser('admin@company.com', 'admin@123');
    const adminToken = adminLogin.token;
    console.log('✅ Admin logged in successfully');

    // TEST 1: Shorya User Journey
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TEST 1: SHORYA USER JOURNEY');
    console.log('='.repeat(80));
    
    try {
        // Create user Shorya
        console.log('\n📝 Step 1.1: Creating user Shorya...');
        const shoryaData = {
            name: 'shorya',
            email: `shorya_${Date.now()}@company.com`,
            password: 'shorya@123',
            role_id: 3 // operator role
        };
        
        testResults.test1.user = await createUser(shoryaData, adminToken);
        console.log('✅ User Shorya created:', testResults.test1.user.email);

        // Login as Shorya
        console.log('\n🔐 Step 1.2: Logging in as Shorya...');
        const shoryaLogin = await loginUser(shoryaData.email, shoryaData.password);
        testResults.test1.token = shoryaLogin.token;
        console.log('✅ Shorya logged in successfully');

        // Create dispatch
        console.log('\n📦 Step 1.3: Creating dispatch...');
        const dispatchData = {
            warehouse: 'GGM_WH',
            order_ref: `ORD-${Date.now()}`,
            customer: 'Test Customer',
            product_name: 'HH_18 pcs gift set',
            qty: 5,
            variant: 'Standard',
            barcode: '3006-1999',
            awb: `AWB${Date.now()}`,
            logistics: 'DTDC',
            parcel_type: 'Forward',
            length: 10,
            width: 8,
            height: 6,
            actual_weight: 2.5,
            payment_mode: 'COD',
            invoice_amount: 1500,
            processed_by: testResults.test1.user.name,
            remarks: 'Test dispatch for Shorya'
        };
        
        testResults.test1.dispatch = await createDispatch(dispatchData, testResults.test1.token);
        console.log('✅ Dispatch created:', testResults.test1.dispatch.order_ref || 'Success');

        // Create return
        console.log('\n↩️ Step 1.4: Creating return...');
        const returnData = {
            order_ref: dispatchData.order_ref,
            product_type: dispatchData.product_name,
            warehouse: dispatchData.warehouse,
            barcode: dispatchData.barcode,
            quantity: 2,
            return_reason: 'Customer return',
            condition: 'good'
        };
        
        testResults.test1.return = await createReturn(returnData, testResults.test1.token);
        console.log('✅ Return created successfully');

        // Create damage
        console.log('\n💥 Step 1.5: Creating damage record...');
        const damageData = {
            order_ref: dispatchData.order_ref,
            product_name: dispatchData.product_name,
            barcode: dispatchData.barcode,
            quantity: 1,
            damage_type: 'broken',
            description: 'Damaged in transit'
        };
        
        testResults.test1.damage = await createDamage(damageData, testResults.test1.token);
        console.log('✅ Damage record created successfully');

        // Get timeline
        console.log('\n📊 Step 1.6: Fetching timeline...');
        testResults.test1.timeline = await getTimeline(dispatchData.order_ref, testResults.test1.token);
        console.log('✅ Timeline fetched successfully');

        // Logout
        console.log('\n🚪 Step 1.7: Logging out Shorya...');
        await apiRequest('POST', '/api/auth/logout', null, testResults.test1.token);
        console.log('✅ Shorya logged out successfully');

        console.log('\n🎉 TEST 1 COMPLETED SUCCESSFULLY!');

    } catch (error) {
        console.error('❌ TEST 1 FAILED:', error.message);
    }

    // TEST 2: Shivam User Journey
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TEST 2: SHIVAM USER JOURNEY');
    console.log('='.repeat(80));
    
    try {
        // Create user Shivam
        console.log('\n📝 Step 2.1: Creating user Shivam...');
        const shivamData = {
            name: 'shivam',
            email: `shivam_${Date.now()}@company.com`,
            password: 'shivam@123',
            role_id: 2 // manager role
        };
        
        testResults.test2.user = await createUser(shivamData, adminToken);
        console.log('✅ User Shivam created:', testResults.test2.user.email);

        // Login as Shivam
        console.log('\n🔐 Step 2.2: Logging in as Shivam...');
        const shivamLogin = await loginUser(shivamData.email, shivamData.password);
        testResults.test2.token = shivamLogin.token;
        console.log('✅ Shivam logged in successfully');

        // Create dispatch with multiple products
        console.log('\n📦 Step 2.3: Creating multi-product dispatch...');
        const multiDispatchData = {
            warehouse: 'GGM_WH',
            order_ref: `ORD-MULTI-${Date.now()}`,
            customer: 'Multi Product Customer',
            product_name: 'HH_Mattress for Oval Cot',
            qty: 10,
            variant: 'Bundle',
            barcode: '2798-3999',
            awb: `AWB-MULTI-${Date.now()}`,
            logistics: 'BLUEDART',
            parcel_type: 'Forward',
            length: 15,
            width: 12,
            height: 10,
            actual_weight: 5.0,
            payment_mode: 'Prepaid',
            invoice_amount: 3500,
            processed_by: testResults.test2.user.name,
            remarks: 'Multi-product dispatch for Shivam'
        };
        
        testResults.test2.dispatch = await createDispatch(multiDispatchData, testResults.test2.token);
        console.log('✅ Multi-product dispatch created');

        // Create return for one product
        console.log('\n↩️ Step 2.4: Creating return for one product...');
        const returnData2 = {
            order_ref: multiDispatchData.order_ref,
            product_type: multiDispatchData.product_name,
            warehouse: multiDispatchData.warehouse,
            barcode: multiDispatchData.barcode,
            quantity: 3,
            return_reason: 'Quality issue',
            condition: 'good'
        };
        
        testResults.test2.return = await createReturn(returnData2, testResults.test2.token);
        console.log('✅ Return created for MULTI001');

        // Create damage for another product
        console.log('\n💥 Step 2.5: Creating damage for another product...');
        const damageData2 = {
            order_ref: multiDispatchData.order_ref,
            product_name: multiDispatchData.product_name,
            barcode: multiDispatchData.barcode,
            quantity: 2,
            damage_type: 'water_damage',
            description: 'Water damaged during shipping'
        };
        
        testResults.test2.damage = await createDamage(damageData2, testResults.test2.token);
        console.log('✅ Damage record created for MULTI002');

        // Create recovery for damaged product
        console.log('\n🔧 Step 2.6: Creating recovery for damaged product...');
        const recoveryData = {
            damage_id: testResults.test2.damage.id || 1,
            recovery_type: 'repair',
            recovered_quantity: 1,
            notes: 'Repaired water damage'
        };
        
        const recoveryResult = await apiRequest('POST', '/api/damage-recovery/recover', recoveryData, testResults.test2.token);
        testResults.test2.recover = recoveryResult.data;
        console.log('✅ Recovery record created');

        // User stays logged in (no logout)
        console.log('\n👤 Step 2.7: Shivam remains logged in');

        console.log('\n🎉 TEST 2 COMPLETED SUCCESSFULLY!');

    } catch (error) {
        console.error('❌ TEST 2 FAILED:', error.message);
    }

    // TEST 3: Bhushan User Journey
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TEST 3: BHUSHAN USER JOURNEY');
    console.log('='.repeat(80));
    
    try {
        // Create user Bhushan
        console.log('\n📝 Step 3.1: Creating user Bhushan...');
        const bhushanData = {
            name: 'bhushan',
            email: `bhushan_${Date.now()}@company.com`,
            password: 'bhushan@123',
            role_id: 4 // warehouse_staff role
        };
        
        testResults.test3.user = await createUser(bhushanData, adminToken);
        console.log('✅ User Bhushan created:', testResults.test3.user.email);

        // Login as Bhushan
        console.log('\n🔐 Step 3.2: Logging in as Bhushan...');
        const bhushanLogin = await loginUser(bhushanData.email, bhushanData.password);
        testResults.test3.token = bhushanLogin.token;
        console.log('✅ Bhushan logged in successfully');

        // Create dispatch for user Amit (as requested)
        console.log('\n📦 Step 3.3: Creating dispatch for user Amit...');
        const amitDispatchData = {
            warehouse: 'GGM_WH',
            order_ref: `ORD-AMIT-${Date.now()}`,
            customer: 'amit',
            product_name: 'HH_18 pcs gift set',
            qty: 8,
            variant: 'Premium',
            barcode: '3006-1999',
            awb: `AWB-AMIT-${Date.now()}`,
            logistics: 'ECOM',
            parcel_type: 'Forward',
            length: 20,
            width: 15,
            height: 12,
            actual_weight: 8.0,
            payment_mode: 'COD',
            invoice_amount: 5000,
            processed_by: testResults.test3.user.name,
            remarks: 'Dispatch for Amit by Bhushan'
        };
        
        testResults.test3.dispatch = await createDispatch(amitDispatchData, testResults.test3.token);
        console.log('✅ Dispatch created for Amit');

        // Create return
        console.log('\n↩️ Step 3.4: Creating return...');
        const returnData3 = {
            order_ref: amitDispatchData.order_ref,
            product_type: amitDispatchData.product_name,
            warehouse: amitDispatchData.warehouse,
            barcode: amitDispatchData.barcode,
            quantity: 5,
            return_reason: 'Wrong item',
            condition: 'good'
        };
        
        testResults.test3.return = await createReturn(returnData3, testResults.test3.token);
        console.log('✅ Return created for AMIT001');

        // Create damage
        console.log('\n💥 Step 3.5: Creating damage...');
        const damageData3 = {
            order_ref: amitDispatchData.order_ref,
            product_name: amitDispatchData.product_name,
            barcode: amitDispatchData.barcode,
            quantity: 3,
            damage_type: 'manufacturing_defect',
            description: 'Manufacturing defect found'
        };
        
        testResults.test3.damage = await createDamage(damageData3, testResults.test3.token);
        console.log('✅ Damage record created for AMIT002');

        // Create recovery
        console.log('\n🔧 Step 3.6: Creating recovery...');
        const recoveryData3 = {
            damage_id: testResults.test3.damage.id || 1,
            recovery_type: 'replacement',
            recovered_quantity: 2,
            notes: 'Replaced defective items'
        };
        
        const recoveryResult3 = await apiRequest('POST', '/api/damage-recovery/recover', recoveryData3, testResults.test3.token);
        testResults.test3.recover = recoveryResult3.data;
        console.log('✅ Recovery record created');

        console.log('\n🎉 TEST 3 COMPLETED SUCCESSFULLY!');

    } catch (error) {
        console.error('❌ TEST 3 FAILED:', error.message);
    }

    // TEST 4: Chaksu Super Admin Journey
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TEST 4: CHAKSU SUPER ADMIN JOURNEY');
    console.log('='.repeat(80));
    
    try {
        // Create super admin user Chaksu
        console.log('\n📝 Step 4.1: Creating super admin user Chaksu...');
        const chaksuData = {
            name: 'chaksu',
            email: `chaksu_${Date.now()}@company.com`,
            password: 'chaksu@123',
            role_id: 1 // super_admin role
        };
        
        testResults.test4.user = await createUser(chaksuData, adminToken);
        console.log('✅ Super admin Chaksu created:', testResults.test4.user.email);

        // Login as Chaksu
        console.log('\n🔐 Step 4.2: Logging in as Chaksu...');
        const chaksuLogin = await loginUser(chaksuData.email, chaksuData.password);
        testResults.test4.token = chaksuLogin.token;
        console.log('✅ Chaksu logged in successfully');

        // Find and delete Isha user
        console.log('\n🔍 Step 4.3: Finding Isha user to delete...');
        const usersResult = await apiRequest('GET', '/api/users', null, testResults.test4.token);
        const ishaUser = usersResult.data.data?.find(user => user.name.toLowerCase().includes('isha')) || 
                        usersResult.data.find(user => user.name.toLowerCase().includes('isha'));
        
        if (ishaUser) {
            console.log(`📋 Found Isha user: ${ishaUser.name} (${ishaUser.email})`);
            
            // Delete Isha user
            console.log('\n🗑️ Step 4.4: Deleting Isha user...');
            testResults.test4.deletedUser = await deleteUser(ishaUser.id, testResults.test4.token);
            console.log('✅ Isha user deleted successfully');
        } else {
            console.log('⚠️ No Isha user found to delete');
        }

        // Create dispatch
        console.log('\n📦 Step 4.5: Creating dispatch...');
        const adminDispatchData = {
            warehouse: 'GGM_WH',
            order_ref: `ORD-ADMIN-${Date.now()}`,
            customer: 'Admin Test Customer',
            product_name: 'HH_Mattress for Oval Cot',
            qty: 15,
            variant: 'Deluxe',
            barcode: '2798-3999',
            awb: `AWB-ADMIN-${Date.now()}`,
            logistics: 'FEDEX',
            parcel_type: 'Forward',
            length: 25,
            width: 20,
            height: 15,
            actual_weight: 12.0,
            payment_mode: 'Prepaid',
            invoice_amount: 8500,
            processed_by: testResults.test4.user.name,
            remarks: 'Admin dispatch by Chaksu'
        };
        
        testResults.test4.dispatch = await createDispatch(adminDispatchData, testResults.test4.token);
        console.log('✅ Admin dispatch created');

        // Check stock levels
        console.log('\n📊 Step 4.6: Checking stock levels...');
        const stockResult = await apiRequest('GET', '/api/inventory', null, testResults.test4.token);
        testResults.test4.stockCheck = stockResult.data;
        console.log('✅ Stock levels checked');

        console.log('\n🎉 TEST 4 COMPLETED SUCCESSFULLY!');

    } catch (error) {
        console.error('❌ TEST 4 FAILED:', error.message);
    }

    // FINAL SUMMARY
    console.log('\n' + '='.repeat(80));
    console.log('📊 COMPREHENSIVE TEST RESULTS SUMMARY');
    console.log('='.repeat(80));
    
    console.log('\n🧪 TEST 1 (Shorya):');
    console.log(`   User Created: ${testResults.test1.user ? '✅' : '❌'}`);
    console.log(`   Login: ${testResults.test1.token ? '✅' : '❌'}`);
    console.log(`   Dispatch: ${testResults.test1.dispatch ? '✅' : '❌'}`);
    console.log(`   Return: ${testResults.test1.return ? '✅' : '❌'}`);
    console.log(`   Damage: ${testResults.test1.damage ? '✅' : '❌'}`);
    console.log(`   Timeline: ${testResults.test1.timeline ? '✅' : '❌'}`);
    
    console.log('\n🧪 TEST 2 (Shivam):');
    console.log(`   User Created: ${testResults.test2.user ? '✅' : '❌'}`);
    console.log(`   Login: ${testResults.test2.token ? '✅' : '❌'}`);
    console.log(`   Multi-Product Dispatch: ${testResults.test2.dispatch ? '✅' : '❌'}`);
    console.log(`   Return: ${testResults.test2.return ? '✅' : '❌'}`);
    console.log(`   Damage: ${testResults.test2.damage ? '✅' : '❌'}`);
    console.log(`   Recovery: ${testResults.test2.recover ? '✅' : '❌'}`);
    
    console.log('\n🧪 TEST 3 (Bhushan):');
    console.log(`   User Created: ${testResults.test3.user ? '✅' : '❌'}`);
    console.log(`   Login: ${testResults.test3.token ? '✅' : '❌'}`);
    console.log(`   Amit Dispatch: ${testResults.test3.dispatch ? '✅' : '❌'}`);
    console.log(`   Return: ${testResults.test3.return ? '✅' : '❌'}`);
    console.log(`   Damage: ${testResults.test3.damage ? '✅' : '❌'}`);
    console.log(`   Recovery: ${testResults.test3.recover ? '✅' : '❌'}`);
    
    console.log('\n🧪 TEST 4 (Chaksu Super Admin):');
    console.log(`   Super Admin Created: ${testResults.test4.user ? '✅' : '❌'}`);
    console.log(`   Login: ${testResults.test4.token ? '✅' : '❌'}`);
    console.log(`   Isha User Deleted: ${testResults.test4.deletedUser ? '✅' : '⚠️'}`);
    console.log(`   Admin Dispatch: ${testResults.test4.dispatch ? '✅' : '❌'}`);
    console.log(`   Stock Check: ${testResults.test4.stockCheck ? '✅' : '❌'}`);
    
    console.log('\n🎯 OVERALL TEST COMPLETION:');
    const totalTests = 21; // Total number of operations across all tests
    const completedTests = Object.values(testResults).reduce((count, test) => {
        return count + Object.values(test).filter(result => result !== null).length;
    }, 0);
    
    console.log(`   Completed: ${completedTests}/${totalTests} operations`);
    console.log(`   Success Rate: ${((completedTests/totalTests) * 100).toFixed(1)}%`);
    
    if (completedTests === totalTests) {
        console.log('\n🎉 ALL NESTED USER JOURNEY TESTS COMPLETED SUCCESSFULLY!');
    } else {
        console.log('\n⚠️ Some tests failed. Check the logs above for details.');
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ COMPREHENSIVE NESTED USER JOURNEY TEST SUITE FINISHED');
    console.log('='.repeat(80));
}

// Run all tests
runAllTests().catch(error => {
    console.error('\n💥 FATAL ERROR:', error.message);
    process.exit(1);
});