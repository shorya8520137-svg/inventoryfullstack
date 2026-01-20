// Debug script to check what's stored in localStorage
console.log('🔍 DEBUGGING FRONTEND PERMISSIONS');
console.log('='.repeat(50));

// Check if we're in browser environment
if (typeof window !== 'undefined' && window.localStorage) {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    console.log('📦 Stored Token:', storedToken ? 'EXISTS' : 'NOT FOUND');
    
    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);
            console.log('👤 Stored User:', user.name, '(' + user.email + ')');
            console.log('🎭 Role:', user.role_name, '(ID:', user.role_id + ')');
            console.log('🔑 Permissions Type:', typeof user.permissions);
            console.log('🔑 Permissions Length:', user.permissions ? user.permissions.length : 'undefined');
            
            if (user.permissions && user.permissions.length > 0) {
                console.log('📋 First 5 Permissions:');
                user.permissions.slice(0, 5).forEach((perm, index) => {
                    console.log(`   ${index + 1}.`, typeof perm === 'object' ? perm.name : perm);
                });
                
                console.log('\n🔍 Permission Format Analysis:');
                const firstPerm = user.permissions[0];
                if (typeof firstPerm === 'object') {
                    console.log('   Format: OBJECT');
                    console.log('   Sample:', JSON.stringify(firstPerm, null, 2));
                } else {
                    console.log('   Format: STRING');
                    console.log('   Sample:', firstPerm);
                }
            } else {
                console.log('❌ NO PERMISSIONS FOUND IN STORED USER');
            }
            
        } catch (e) {
            console.error('❌ Error parsing stored user:', e);
        }
    } else {
        console.log('❌ NO USER FOUND IN LOCALSTORAGE');
    }
} else {
    console.log('❌ NOT IN BROWSER ENVIRONMENT');
}

console.log('\n🎯 EXPECTED vs ACTUAL:');
console.log('Expected: user.permissions = ["system.user_management", "inventory.view", ...]');
console.log('Actual: user.permissions = [{name: "system.user_management", display_name: "..."}, ...]');
console.log('\n💡 SOLUTION: Fix hasPermission function to handle object format');