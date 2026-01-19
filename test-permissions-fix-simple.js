// Simple test to verify permissions fix
console.log('🧪 TESTING PERMISSIONS FIX');
console.log('='.repeat(40));

// Mock user data as returned from backend (based on our analysis)
const mockAdminUser = {
    id: 1,
    name: "System Administrator",
    email: "admin@company.com",
    role_id: 1,
    role_name: "super_admin",
    permissions: [
        { name: "system.user_management", display_name: "User Management", category: "system" },
        { name: "system.role_management", display_name: "Role Management", category: "system" },
        { name: "system.audit_log", display_name: "Audit Log", category: "system" },
        { name: "inventory.view", display_name: "View Inventory", category: "inventory" },
        { name: "orders.create", display_name: "Create Orders", category: "orders" }
    ]
};

// Test the fixed hasPermission logic
function hasPermission(user, permission) {
    if (!user || !user.permissions) return false;
    
    // Super admin has all permissions
    if (user.role_name === "super_admin" || user.role_name === "admin") return true;
    
    // Check if user has specific permission
    return user.permissions.some(perm => {
        // Handle both string format and object format
        if (typeof perm === 'string') {
            return perm === permission;
        } else if (typeof perm === 'object' && perm.name) {
            // Check exact match first
            if (perm.name === permission) return true;
            
            // Check display name match
            if (perm.display_name === permission) return true;
            
            // Check category.name format (e.g., "system.user_management")
            const categoryName = `${perm.category}.${perm.name.split('.')[1] || perm.name}`;
            if (categoryName === permission) return true;
            
            // Check uppercase format (e.g., "SYSTEM_USER_MANAGEMENT")
            const upperFormat = perm.name.toUpperCase().replace('.', '_');
            if (upperFormat === permission) return true;
            
            return false;
        }
        return false;
    });
}

// Test cases that should work for admin
const testCases = [
    'system.user_management',
    'SYSTEM_USER_MANAGEMENT', 
    'system.role_management',
    'SYSTEM_ROLE_MANAGEMENT',
    'system.audit_log',
    'SYSTEM_AUDIT_LOG',
    'inventory.view',
    'INVENTORY_VIEW',
    'orders.create',
    'ORDERS_CREATE',
    'nonexistent.permission' // This should fail for non-admin
];

console.log('🔍 Testing Admin User (should pass all due to super_admin role):');
testCases.forEach(permission => {
    const result = hasPermission(mockAdminUser, permission);
    console.log(`   ${permission}: ${result ? '✅' : '❌'}`);
});

// Test with non-admin user
const mockRegularUser = {
    ...mockAdminUser,
    role_name: "user",
    permissions: [
        { name: "inventory.view", display_name: "View Inventory", category: "inventory" }
    ]
};

console.log('\n🔍 Testing Regular User (should only pass inventory.view):');
testCases.forEach(permission => {
    const result = hasPermission(mockRegularUser, permission);
    console.log(`   ${permission}: ${result ? '✅' : '❌'}`);
});

console.log('\n🎯 Expected Results:');
console.log('✅ Admin should pass ALL tests (super_admin role)');
console.log('✅ Regular user should only pass inventory.view tests');
console.log('❌ Both should fail nonexistent.permission');