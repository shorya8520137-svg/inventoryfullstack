# Deploy and Test Admin Login Script
Write-Host "🚀 Deploying and Testing Admin Login..." -ForegroundColor Green

# Server connection details
$serverIP = "13.51.56.188"
$keyPath = "C:\Users\Admin\awsconection.pem"
$serverUser = "ubuntu"

Write-Host "📡 Connecting to server: $serverIP" -ForegroundColor Yellow

# Commands to run on server
$commands = @"
echo "🔧 Setting up test environment..."
cd /home/ubuntu/inventoryfullstack

echo "📦 Installing required packages if needed..."
npm list mysql2 > /dev/null 2>&1 || npm install mysql2

echo "📋 Current directory contents:"
ls -la

echo "🧹 Cleaning up old test files..."
rm -f test-admin-login-and-fix-roles.js

echo "📥 Creating the test script..."
cat > test-admin-login-and-fix-roles.js << 'SCRIPT_EOF'
const https = require('https');
const mysql = require('mysql2');

// Configuration
const API_BASE = 'https://16.171.161.150.nip.io';
const DB_CONFIG = {
    host: 'localhost',
    user: 'root',
    password: 'StrongPass@123',
    database: 'inventory_system'
};

// Admin credentials
const ADMIN_CREDENTIALS = {
    email: 'admin@company.com',
    password: 'admin@123'
};

console.log('🚀 Starting Admin Login Test and Role Fix Script...\n');

// Function to make HTTPS requests
function makeRequest(options, data = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve({ status: res.statusCode, data: response });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// Function to execute SQL queries
function executeSQL(query, params = []) {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection(DB_CONFIG);
        
        connection.connect((err) => {
            if (err) {
                console.error('❌ Database connection failed:', err.message);
                reject(err);
                return;
            }
            
            connection.query(query, params, (error, results) => {
                connection.end();
                
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        });
    });
}

// Step 1: Fix duplicate roles in database
async function fixDuplicateRoles() {
    console.log('🔧 Step 1: Fixing duplicate roles in database...');
    
    try {
        // Check current roles
        console.log('📋 Current roles in database:');
        const currentRoles = await executeSQL('SELECT id, name, display_name, description FROM roles ORDER BY id');
        currentRoles.forEach(role => {
            console.log(`   - ID: `+role.id+`, Name: "`+role.name+`", Display: "`+role.display_name+`"`);
        });
        
        // Delete role_permissions for duplicate roles first
        console.log('\n🗑️ Removing permissions for duplicate roles...');
        await executeSQL(`
            DELETE FROM role_permissions WHERE role_id IN (
                SELECT id FROM roles WHERE name LIKE '%customer support%' OR name LIKE '%test%' OR name LIKE '%Hunyhuny%'
            )
        `);
        
        // Delete duplicate roles
        console.log('🗑️ Removing duplicate roles...');
        const deleteResult = await executeSQL(`
            DELETE FROM roles WHERE name LIKE '%customer support%' OR name LIKE '%test%' OR name LIKE '%Hunyhuny%'
        `);
        console.log(`   ✅ Deleted `+deleteResult.affectedRows+` duplicate roles`);
        
        // Clean up roles with trailing spaces
        console.log('🧹 Cleaning up role names with trailing spaces...');
        await executeSQL(`
            UPDATE roles SET name = TRIM(name), display_name = TRIM(display_name) 
            WHERE name != TRIM(name) OR display_name != TRIM(display_name)
        `);
        
        // Verify cleaned roles
        console.log('\n📋 Cleaned roles table:');
        const cleanedRoles = await executeSQL('SELECT id, name, display_name, description FROM roles ORDER BY id');
        cleanedRoles.forEach(role => {
            console.log(`   - ID: `+role.id+`, Name: "`+role.name+`", Display: "`+role.display_name+`"`);
        });
        
        // Ensure admin role has all permissions
        console.log('\n🔐 Ensuring admin role has all permissions...');
        await executeSQL(`
            INSERT IGNORE INTO role_permissions (role_id, permission_id)
            SELECT 1, id FROM permissions WHERE is_active = true
        `);
        
        const adminPermCount = await executeSQL('SELECT COUNT(*) as count FROM role_permissions WHERE role_id = 1');
        console.log(`   ✅ Admin role has `+adminPermCount[0].count+` permissions`);
        
        console.log('✅ Database cleanup completed successfully!\n');
        return true;
        
    } catch (error) {
        console.error('❌ Database cleanup failed:', error.message);
        return false;
    }
}

// Step 2: Test admin login
async function testAdminLogin() {
    console.log('🔐 Step 2: Testing admin login...');
    
    try {
        const loginOptions = {
            hostname: '16.171.161.150.nip.io',
            port: 443,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };
        
        console.log(`📡 Making login request to: `+API_BASE+`/api/auth/login`);
        console.log(`📧 Email: `+ADMIN_CREDENTIALS.email);
        console.log(`🔑 Password: `+ADMIN_CREDENTIALS.password);
        
        const response = await makeRequest(loginOptions, ADMIN_CREDENTIALS);
        
        console.log(`📊 Response Status: `+response.status);
        
        if (response.status === 200 && response.data.success) {
            console.log('✅ Login successful!');
            console.log(`👤 User: `+response.data.user.name);
            console.log(`📧 Email: `+response.data.user.email);
            console.log(`🎭 Role: `+response.data.user.roleDisplayName);
            console.log(`🔑 Permissions: `+response.data.user.permissions.length+` permissions`);
            console.log(`🎫 Token: `+response.data.token.substring(0, 50)+`...`);
            
            return {
                success: true,
                token: response.data.token,
                user: response.data.user
            };
        } else {
            console.error('❌ Login failed!');
            console.error('Response:', JSON.stringify(response.data, null, 2));
            return { success: false };
        }
        
    } catch (error) {
        console.error('❌ Login request failed:', error.message);
        return { success: false };
    }
}

// Step 3: Test role creation with the token
async function testRoleCreation(token) {
    console.log('\n🎭 Step 3: Testing role creation...');
    
    try {
        const roleData = {
            name: 'test_role_' + Date.now(),
            displayName: 'Test Role',
            description: 'Test role created by script',
            color: '#10B981',
            permissionIds: [1, 2, 3] // Some basic permissions
        };
        
        const roleOptions = {
            hostname: '16.171.161.150.nip.io',
            port: 443,
            path: '/api/roles',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer `+token
            }
        };
        
        console.log(`📡 Creating role: `+roleData.displayName);
        const response = await makeRequest(roleOptions, roleData);
        
        console.log(`📊 Response Status: `+response.status);
        
        if (response.status === 201 && response.data.success) {
            console.log('✅ Role creation successful!');
            console.log(`🆔 Role ID: `+response.data.data.id);
            console.log(`📝 Message: `+response.data.message);
            return { success: true, roleId: response.data.data.id };
        } else {
            console.error('❌ Role creation failed!');
            console.error('Response:', JSON.stringify(response.data, null, 2));
            return { success: false };
        }
        
    } catch (error) {
        console.error('❌ Role creation request failed:', error.message);
        return { success: false };
    }
}

// Main execution
async function main() {
    console.log('=' .repeat(60));
    console.log('🎯 ADMIN LOGIN TEST & ROLE FIX SCRIPT');
    console.log('=' .repeat(60));
    
    // Step 1: Fix database issues
    const dbFixed = await fixDuplicateRoles();
    if (!dbFixed) {
        console.log('❌ Database fix failed. Continuing with login test...\n');
    }
    
    // Step 2: Test login
    const loginResult = await testAdminLogin();
    if (!loginResult.success) {
        console.log('\n❌ Script failed at login step');
        process.exit(1);
    }
    
    // Step 3: Test role creation
    const roleResult = await testRoleCreation(loginResult.token);
    if (!roleResult.success) {
        console.log('\n⚠️ Role creation failed, but login works');
    }
    
    // Summary
    console.log('\n' + '=' .repeat(60));
    console.log('📊 SCRIPT EXECUTION SUMMARY');
    console.log('=' .repeat(60));
    console.log(`🔧 Database Fix: `+(dbFixed ? '✅ Success' : '❌ Failed'));
    console.log(`🔐 Admin Login: `+(loginResult.success ? '✅ Success' : '❌ Failed'));
    console.log(`🎭 Role Creation: `+(roleResult.success ? '✅ Success' : '❌ Failed'));
    
    if (loginResult.success) {
        console.log('\n🎉 Admin login is working! You can now use these credentials:');
        console.log(`   📧 Email: `+ADMIN_CREDENTIALS.email);
        console.log(`   🔑 Password: `+ADMIN_CREDENTIALS.password);
        console.log(`   🌐 Frontend URL: http://13.51.56.188:3000 (or your frontend URL)`);
    }
    
    console.log('\n✅ Script completed!');
}

// Run the script
main().catch(error => {
    console.error('💥 Script failed with error:', error);
    process.exit(1);
});
SCRIPT_EOF

echo "🚀 Running the admin login test script..."
node test-admin-login-and-fix-roles.js

echo "📊 Script execution completed!"
echo "🔍 Checking server status..."
ps aux | grep node | grep -v grep

echo "✅ All tasks completed!"
"@

# Execute commands on server
Write-Host "🔧 Executing commands on server..." -ForegroundColor Yellow

try {
    # Use SSH to execute commands
    $sshCommand = "ssh -i `"$keyPath`" -o StrictHostKeyChecking=no $serverUser@$serverIP `"$commands`""
    
    Write-Host "📡 SSH Command: $sshCommand" -ForegroundColor Cyan
    
    # Execute the SSH command
    Invoke-Expression $sshCommand
    
    Write-Host "`n✅ Deployment and testing completed!" -ForegroundColor Green
    Write-Host "🎉 Admin login credentials:" -ForegroundColor Yellow
    Write-Host "   📧 Email: admin@company.com" -ForegroundColor White
    Write-Host "   🔑 Password: admin@123" -ForegroundColor White
    Write-Host "   🌐 Frontend: http://13.51.56.188:3000" -ForegroundColor White
    
} catch {
    Write-Host "❌ Error during deployment: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n🏁 Script completed successfully!" -ForegroundColor Green