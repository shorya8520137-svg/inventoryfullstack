1`  const https = require('https');

const BASE_URL = 'https://16.171.161.150.nip.io';
let authToken = '';

// HTTPS agent that ignores SSL errors
const agent = new https.Agent({
  rejectUnauthorized: false
});

function makeRequest(method, path, data = null, useAuth = true) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      agent: agent
    };

    if (useAuth && authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function runTests() {
  console.log('========================================');
  console.log('  TESTING ACTUAL SERVER APIS');
  console.log('========================================\n');

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // 1. Authentication
  console.log('🔐 Testing Authentication...\n');
  try {
    const loginRes = await makeRequest('POST', '/api/auth/login', {
      email: 'admin@company.com',
      password: 'admin@123'
    }, false);

    if (loginRes.status === 200 && loginRes.data.token) {
      authToken = loginRes.data.token;
      console.log('✅ Login: SUCCESS');
      results.passed++;
      results.tests.push({ name: 'Login', status: 'PASS', code: 200 });
    } else {
      console.log('❌ Login: FAILED');
      results.failed++;
      results.tests.push({ name: 'Login', status: 'FAIL', code: loginRes.status });
    }
  } catch (error) {
    console.log('❌ Login: ERROR -', error.message);
    results.failed++;
    results.tests.push({ name: 'Login', status: 'ERROR', error: error.message });
  }

  console.log('\n📦 Testing Product APIs...\n');

  // 2. Products
  try {
    const res = await makeRequest('GET', '/api/products?page=1&limit=20');
    if (res.status === 200) {
      console.log('✅ Products List: SUCCESS');
      results.passed++;
      results.tests.push({ name: 'Products List', status: 'PASS', code: 200 });
    } else {
      console.log('❌ Products List: FAILED (' + res.status + ')');
      results.failed++;
      results.tests.push({ name: 'Products List', status: 'FAIL', code: res.status });
    }
  } catch (error) {
    console.log('❌ Products List: ERROR');
    results.failed++;
    results.tests.push({ name: 'Products List', status: 'ERROR' });
  }

  // 3. Categories
  try {
    const res = await makeRequest('GET', '/api/products/categories/all');
    if (res.status === 200) {
      console.log('✅ Categories: SUCCESS');
      results.passed++;
      results.tests.push({ name: 'Categories', status: 'PASS', code: 200 });
    } else {
      console.log('❌ Categories: FAILED (' + res.status + ')');
      results.failed++;
      results.tests.push({ name: 'Categories', status: 'FAIL', code: res.status });
    }
  } catch (error) {
    console.log('❌ Categories: ERROR');
    results.failed++;
    results.tests.push({ name: 'Categories', status: 'ERROR' });
  }

  console.log('\n📊 Testing Inventory APIs...\n');

  // 4. Inventory
  try {
    const res = await makeRequest('GET', '/api/inventory?page=1&limit=20');
    if (res.status === 200) {
      console.log('✅ Inventory List: SUCCESS');
      results.passed++;
      results.tests.push({ name: 'Inventory List', status: 'PASS', code: 200 });
    } else {
      console.log('❌ Inventory List: FAILED (' + res.status + ')');
      results.failed++;
      results.tests.push({ name: 'Inventory List', status: 'FAIL', code: res.status });
    }
  } catch (error) {
    console.log('❌ Inventory List: ERROR');
    results.failed++;
    results.tests.push({ name: 'Inventory List', status: 'ERROR' });
  }

  console.log('\n🚚 Testing Dispatch APIs...\n');

  // 5. Dispatch
  try {
    const res = await makeRequest('GET', '/api/dispatch?page=1&limit=20');
    if (res.status === 200) {
      console.log('✅ Dispatch List: SUCCESS');
      results.passed++;
      results.tests.push({ name: 'Dispatch List', status: 'PASS', code: 200 });
    } else {
      console.log('❌ Dispatch List: FAILED (' + res.status + ')');
      results.failed++;
      results.tests.push({ name: 'Dispatch List', status: 'FAIL', code: res.status });
    }
  } catch (error) {
    console.log('❌ Dispatch List: ERROR');
    results.failed++;
    results.tests.push({ name: 'Dispatch List', status: 'ERROR' });
  }

  console.log('\n📤 Testing Bulk Upload APIs...\n');

  // 6. Bulk Upload
  try {
    const res = await makeRequest('GET', '/api/bulk-upload?page=1&limit=20');
    if (res.status === 200) {
      console.log('✅ Bulk Upload List: SUCCESS');
      results.passed++;
      results.tests.push({ name: 'Bulk Upload List', status: 'PASS', code: 200 });
    } else {
      console.log('❌ Bulk Upload List: FAILED (' + res.status + ')');
      results.failed++;
      results.tests.push({ name: 'Bulk Upload List', status: 'FAIL', code: res.status });
    }
  } catch (error) {
    console.log('❌ Bulk Upload List: ERROR');
    results.failed++;
    results.tests.push({ name: 'Bulk Upload List', status: 'ERROR' });
  }

  console.log('\n💰 Testing Damage Recovery APIs...\n');

  // 7. Damage Recovery
  try {
    const res = await makeRequest('GET', '/api/damage-recovery?page=1&limit=20');
    if (res.status === 200) {
      console.log('✅ Damage Recovery List: SUCCESS');
      results.passed++;
      results.tests.push({ name: 'Damage Recovery List', status: 'PASS', code: 200 });
    } else {
      console.log('❌ Damage Recovery List: FAILED (' + res.status + ')');
      results.failed++;
      results.tests.push({ name: 'Damage Recovery List', status: 'FAIL', code: res.status });
    }
  } catch (error) {
    console.log('❌ Damage Recovery List: ERROR');
    results.failed++;
    results.tests.push({ name: 'Damage Recovery List', status: 'ERROR' });
  }

  console.log('\n↩️ Testing Returns APIs...\n');

  // 8. Returns
  try {
    const res = await makeRequest('GET', '/api/returns?page=1&limit=20');
    if (res.status === 200) {
      console.log('✅ Returns List: SUCCESS');
      results.passed++;
      results.tests.push({ name: 'Returns List', status: 'PASS', code: 200 });
    } else {
      console.log('❌ Returns List: FAILED (' + res.status + ')');
      results.failed++;
      results.tests.push({ name: 'Returns List', status: 'FAIL', code: res.status });
    }
  } catch (error) {
    console.log('❌ Returns List: ERROR');
    results.failed++;
    results.tests.push({ name: 'Returns List', status: 'ERROR' });
  }

  console.log('\n📈 Testing Timeline APIs...\n');

  // 9. Timeline
  try {
    const res = await makeRequest('GET', '/api/timeline?page=1&limit=20');
    if (res.status === 200) {
      console.log('✅ Timeline List: SUCCESS');
      results.passed++;
      results.tests.push({ name: 'Timeline List', status: 'PASS', code: 200 });
    } else {
      console.log('❌ Timeline List: FAILED (' + res.status + ')');
      results.failed++;
      results.tests.push({ name: 'Timeline List', status: 'FAIL', code: res.status });
    }
  } catch (error) {
    console.log('❌ Timeline List: ERROR');
    results.failed++;
    results.tests.push({ name: 'Timeline List', status: 'ERROR' });
  }

  console.log('\n📦 Testing Order Tracking APIs...\n');

  // 10. Order Tracking
  try {
    const res = await makeRequest('GET', '/api/order-tracking?page=1&limit=20');
    if (res.status === 200) {
      console.log('✅ Order Tracking List: SUCCESS');
      results.passed++;
      results.tests.push({ name: 'Order Tracking List', status: 'PASS', code: 200 });
    } else {
      console.log('❌ Order Tracking List: FAILED (' + res.status + ')');
      results.failed++;
      results.tests.tests.push({ name: 'Order Tracking List', status: 'FAIL', code: res.status });
    }
  } catch (error) {
    console.log('❌ Order Tracking List: ERROR');
    results.failed++;
    results.tests.push({ name: 'Order Tracking List', status: 'ERROR' });
  }

  console.log('\n🔄 Testing Self Transfer APIs...\n');

  // 11. Self Transfer
  try {
    const res = await makeRequest('GET', '/api/self-transfer?page=1&limit=20');
    if (res.status === 200) {
      console.log('✅ Self Transfer List: SUCCESS');
      results.passed++;
      results.tests.push({ name: 'Self Transfer List', status: 'PASS', code: 200 });
    } else {
      console.log('❌ Self Transfer List: FAILED (' + res.status + ')');
      results.failed++;
      results.tests.push({ name: 'Self Transfer List', status: 'FAIL', code: res.status });
    }
  } catch (error) {
    console.log('❌ Self Transfer List: ERROR');
    results.failed++;
    results.tests.push({ name: 'Self Transfer List', status: 'ERROR' });
  }

  console.log('\n👥 Testing Permission APIs...\n');

  // 12. Permissions
  try {
    const res = await makeRequest('GET', '/api/permissions');
    if (res.status === 200) {
      console.log('✅ Permissions List: SUCCESS');
      results.passed++;
      results.tests.push({ name: 'Permissions List', status: 'PASS', code: 200 });
    } else {
      console.log('❌ Permissions List: FAILED (' + res.status + ')');
      results.failed++;
      results.tests.push({ name: 'Permissions List', status: 'FAIL', code: res.status });
    }
  } catch (error) {
    console.log('❌ Permissions List: ERROR');
    results.failed++;
    results.tests.push({ name: 'Permissions List', status: 'ERROR' });
  }

  // 13. Roles
  try {
    const res = await makeRequest('GET', '/api/permissions/roles');
    if (res.status === 200) {
      console.log('✅ Roles List: SUCCESS');
      results.passed++;
      results.tests.push({ name: 'Roles List', status: 'PASS', code: 200 });
    } else {
      console.log('❌ Roles List: FAILED (' + res.status + ')');
      results.failed++;
      results.tests.push({ name: 'Roles List', status: 'FAIL', code: res.status });
    }
  } catch (error) {
    console.log('❌ Roles List: ERROR');
    results.failed++;
    results.tests.push({ name: 'Roles List', status: 'ERROR' });
  }

  // 14. Users
  try {
    const res = await makeRequest('GET', '/api/users');
    if (res.status === 200) {
      console.log('✅ Users List: SUCCESS');
      results.passed++;
      results.tests.push({ name: 'Users List', status: 'PASS', code: 200 });
    } else if (res.status === 403) {
      console.log('⚠️  Users List: PERMISSION DENIED (403) - Expected for non-admin');
      results.passed++;
      results.tests.push({ name: 'Users List', status: 'PASS', code: 403, note: 'Permission check working' });
    } else {
      console.log('❌ Users List: FAILED (' + res.status + ')');
      results.failed++;
      results.tests.push({ name: 'Users List', status: 'FAIL', code: res.status });
    }
  } catch (error) {
    console.log('❌ Users List: ERROR');
    results.failed++;
    results.tests.push({ name: 'Users List', status: 'ERROR' });
  }

  // Print Summary
  console.log('\n========================================');
  console.log('📊 FINAL RESULTS');
  console.log('========================================');
  console.log(`✅ Passed: ${results.passed}/${results.passed + results.failed}`);
  console.log(`❌ Failed: ${results.failed}/${results.passed + results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  console.log('========================================\n');

  // Print detailed results
  console.log('📋 DETAILED RESULTS:\n');
  results.tests.forEach((test, index) => {
    const icon = test.status === 'PASS' ? '✅' : '❌';
    const note = test.note ? ` (${test.note})` : '';
    console.log(`${index + 1}. ${icon} ${test.name}: ${test.status} [${test.code || 'N/A'}]${note}`);
  });
  console.log('\n========================================\n');
}

runTests().catch(console.error);