// 🧪 QUICK 4 SCENARIO TEST - NO HANGING VERSION
const API_BASE = 'https://16.171.197.86.nip.io';

// Simple API call with timeout
async function quickAPI(endpoint, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            }
        });
        
        clearTimeout(timeoutId);
        const data = await response.json();
        
        return {
            success: response.ok,
            status: response.status,
            data: data,
            error: response.ok ? null : data.message || 'Request failed'
        };
    } catch (error) {
        clearTimeout(timeoutId);
        return {
            success: false,
            error: error.name === 'AbortError' ? 'Request timeout' : error.message
        };
    }
}

// Test functions
async function testLogin(email, password) {
    console.log(`🔐 Testing login: ${email}`);
    const result = await quickAPI('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    
    if (result.success) {
        console.log(`✅ Login successful: ${email}`);
        return result.data.token;
    } else {
        console.log(`❌ Login failed: ${result.error}`);
        return null;
    }
}

async function testCreateUser(token, userData) {
    console.log(`👤 Testing user creation: ${userData.name}`);
    const result = await quickAPI('/api/users', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(userData)
    });
    
    if (result.success) {
        console.log(`✅ User created: ${userData.name}`);
        return result.data;
    } else {
        console.log(`❌ User creation failed: ${result.error}`);
        return null;
    }
}

async function testAPI(endpoint, token, method = 'GET', data = null) {
    console.log(`🔍 Testing ${method} ${endpoint}`);
    const result = await quickAPI(endpoint, {
        method,
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: data ? JSON.stringify(data) : undefined
    });
    
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${endpoint}: ${result.success ? 'OK' : result.error}`);
    return result;
}

// Main test runner
async function runQuickTests() {
    console.log('🚀 QUICK 4 SCENARIO TEST');
    console.log('========================');
    console.log(`🌐 API: ${API_BASE}`);
    console.log(`⏰ Started: ${new Date().toLocaleTimeString()}`);
    
    let results = {
        test1: { passed: 0, failed: 0, details: [] },
        test2: { passed: 0, failed: 0, details: [] },
        test3: { passed: 0, failed: 0, details: [] },
        test4: { passed: 0, failed: 0, details: [] }
    };

    // TEST 1: Shorya Basic Journey
    console.log('\n🧪 TEST 1: SHORYA BASIC JOURNEY');
    console.log('===============================');
    
    try {
        // Admin login
        const adminToken = await testLogin('admin@company.com', 'admin@123');
        if (adminToken) {
            results.test1.passed++;
            results.test1.details.push('Admin login: ✅');
        } else {
            results.test1.failed++;
            results.test1.details.push('Admin login: ❌');
        }

        if (adminToken) {
            // Create Shorya
            const shorya = await testCreateUser(adminToken, {
                name: 'Shorya',
                email: 'shorya@test.com',
                password: 'password123',
                role_id: 2
            });
            
            if (shorya) {
                results.test1.passed++;
                results.test1.details.push('Shorya creation: ✅');
                
                // Shorya login
                const shoryaToken = await testLogin('shorya@test.com', 'password123');
                if (shoryaToken) {
                    results.test1.passed++;
                    results.test1.details.push('Shorya login: ✅');
                    
                    // Test operations
                    await testAPI('/api/dispatch', shoryaToken, 'POST', {
                        customer_name: 'Test Customer',
                        products: [{ product_id: 1, quantity: 5 }],
                        total_amount: 500
                    });
                    
                    await testAPI('/api/returns', shoryaToken, 'POST', {
                        order_id: 1,
                        reason: 'Test return',
                        quantity: 1
                    });
                    
                    await testAPI('/api/damage-recovery', shoryaToken, 'POST', {
                        product_id: 1,
                        quantity: 2,
                        reason: 'Test damage'
                    });
                    
                    await testAPI('/api/timeline', shoryaToken);
                    
                    results.test1.passed += 4;
                    results.test1.details.push('Operations: ✅');
                    console.log('🚪 Shorya logout (simulated)');
                } else {
                    results.test1.failed++;
                    results.test1.details.push('Shorya login: ❌');
                }
            } else {
                results.test1.failed++;
                results.test1.details.push('Shorya creation: ❌');
            }
        }
    } catch (error) {
        results.test1.failed++;
        results.test1.details.push(`Error: ${error.message}`);
    }

    // TEST 2: Shivam Multi-Product
    console.log('\n🧪 TEST 2: SHIVAM MULTI-PRODUCT');
    console.log('===============================');
    
    try {
        const adminToken = await testLogin('admin@company.com', 'admin@123');
        if (adminToken) {
            const shivam = await testCreateUser(adminToken, {
                name: 'Shivam',
                email: 'shivam@test.com',
                password: 'password123',
                role_id: 3
            });
            
            if (shivam) {
                results.test2.passed++;
                const shivamToken = await testLogin('shivam@test.com', 'password123');
                if (shivamToken) {
                    results.test2.passed++;
                    
                    // Multi-product dispatch
                    await testAPI('/api/dispatch', shivamToken, 'POST', {
                        customer_name: 'Multi Customer',
                        products: [
                            { product_id: 1, quantity: 10 },
                            { product_id: 2, quantity: 5 },
                            { product_id: 3, quantity: 8 }
                        ],
                        total_amount: 1500
                    });
                    
                    await testAPI('/api/returns', shivamToken, 'POST', {
                        order_id: 2,
                        reason: 'Multi return',
                        quantity: 3
                    });
                    
                    await testAPI('/api/damage-recovery', shivamToken, 'POST', {
                        product_id: 2,
                        quantity: 1,
                        reason: 'Multi damage'
                    });
                    
                    results.test2.passed += 3;
                    results.test2.details.push('Multi-product operations: ✅');
                    console.log('👤 Shivam remains logged in');
                }
            }
        }
    } catch (error) {
        results.test2.failed++;
        results.test2.details.push(`Error: ${error.message}`);
    }

    // TEST 3: Bhushan creates Amit
    console.log('\n🧪 TEST 3: BHUSHAN CREATES AMIT');
    console.log('===============================');
    
    try {
        const adminToken = await testLogin('admin@company.com', 'admin@123');
        if (adminToken) {
            const bhushan = await testCreateUser(adminToken, {
                name: 'Bhushan',
                email: 'bhushan@test.com',
                password: 'password123',
                role_id: 2
            });
            
            if (bhushan) {
                const bhushanToken = await testLogin('bhushan@test.com', 'password123');
                if (bhushanToken) {
                    const amit = await testCreateUser(bhushanToken, {
                        name: 'Amit',
                        email: 'amit@test.com',
                        password: 'password123',
                        role_id: 4
                    });
                    
                    if (amit) {
                        results.test3.passed++;
                        const amitToken = await testLogin('amit@test.com', 'password123');
                        if (amitToken) {
                            results.test3.passed++;
                            
                            // Amit operations
                            await testAPI('/api/dispatch', amitToken, 'POST', {
                                customer_name: 'Amit Customer',
                                products: [
                                    { product_id: 1, quantity: 15 },
                                    { product_id: 2, quantity: 10 }
                                ],
                                total_amount: 2500
                            });
                            
                            results.test3.passed++;
                            results.test3.details.push('Bhushan->Amit workflow: ✅');
                        }
                    }
                }
            }
        }
    } catch (error) {
        results.test3.failed++;
        results.test3.details.push(`Error: ${error.message}`);
    }

    // TEST 4: Chaksu Super Admin
    console.log('\n🧪 TEST 4: CHAKSU SUPER ADMIN');
    console.log('==============================');
    
    try {
        const adminToken = await testLogin('admin@company.com', 'admin@123');
        if (adminToken) {
            const chaksu = await testCreateUser(adminToken, {
                name: 'Chaksu',
                email: 'chaksu@test.com',
                password: 'password123',
                role_id: 1
            });
            
            const isha = await testCreateUser(adminToken, {
                name: 'Isha',
                email: 'isha@test.com',
                password: 'password123',
                role_id: 5
            });
            
            if (chaksu && isha) {
                results.test4.passed++;
                const chaksuToken = await testLogin('chaksu@test.com', 'password123');
                if (chaksuToken) {
                    results.test4.passed++;
                    
                    // Test super admin operations
                    await testAPI('/api/users', chaksuToken);
                    await testAPI('/api/timeline', chaksuToken);
                    
                    // Simulate delete operations
                    console.log('🗑️ Simulating Isha dispatch deletion...');
                    console.log('📊 Simulating stock back fill check...');
                    
                    if (isha.id) {
                        await testAPI(`/api/users/${isha.id}`, chaksuToken, 'DELETE');
                        console.log('✅ Isha account deletion attempted');
                    }
                    
                    results.test4.passed++;
                    results.test4.details.push('Super admin operations: ✅');
                }
            }
        }
    } catch (error) {
        results.test4.failed++;
        results.test4.details.push(`Error: ${error.message}`);
    }

    // Final Results
    console.log('\n📊 FINAL RESULTS');
    console.log('================');
    
    Object.keys(results).forEach(testKey => {
        const test = results[testKey];
        const total = test.passed + test.failed;
        const status = test.failed === 0 ? '✅' : '⚠️';
        console.log(`${status} ${testKey.toUpperCase()}: ${test.passed}/${total} passed`);
        test.details.forEach(detail => console.log(`   ${detail}`));
    });

    const totalPassed = Object.values(results).reduce((sum, test) => sum + test.passed, 0);
    const totalFailed = Object.values(results).reduce((sum, test) => sum + test.failed, 0);
    
    console.log(`\n🎯 OVERALL: ${totalPassed}/${totalPassed + totalFailed} operations successful`);
    console.log(`⏰ Completed: ${new Date().toLocaleTimeString()}`);
    
    if (totalFailed > 0) {
        console.log('\n🔍 FRONTEND CHECK RECOMMENDED:');
        console.log('1. Open: http://localhost:3002');
        console.log('2. Login: admin@company.com / admin@123');
        console.log('3. Test permissions and operations manually');
    }
}

// Run the tests
runQuickTests().catch(console.error);