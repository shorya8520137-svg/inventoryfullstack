# Permission System Analysis & Fix Plan

## 🚨 Current Problems Identified

### 1. **Duplicate Permissions**
**Same functionality with different naming conventions:**

| Database (Old) | Database (New) | Frontend | Issue |
|----------------|----------------|----------|-------|
| `INVENTORY_VIEW` | `inventory.view` | `inventory.view` | 2 permissions for same function |
| `PRODUCTS_VIEW` | `products.view` | `products.view` | 2 permissions for same function |
| `ORDERS_VIEW` | `orders.view` | `orders.view` | 2 permissions for same function |
| `DASHBOARD_VIEW` | `dashboard.view` | `dashboard.view` | 2 permissions for same function |

### 2. **Permissions for Non-Existent UI Components**
**Database has permissions for modules NOT in sidebar:**

| Permission | Category | Status | Issue |
|------------|----------|--------|-------|
| `TRACKING_*` | TRACKING | ❌ Not in sidebar | 6 permissions for disabled module |
| `MESSAGES_*` | MESSAGES | ❌ Not in sidebar | 5 permissions for disabled module |
| `DASHBOARD_*` | DASHBOARD | ❌ Disabled | 6 permissions for disabled module |

### 3. **Missing Granular Permission Control**
**Components render without proper permission checks:**

#### Example: Inventory Module
- **Current**: `inventory.view` → Shows entire inventory page
- **Problem**: Timeline, bulk upload, damage recovery all show regardless
- **Should be**: 
  - `inventory.view` → Basic inventory list
  - `inventory.timeline` → Timeline tab/feature
  - `inventory.bulk_upload` → Bulk upload button
  - `inventory.damage` → Damage operations

#### Example: Orders Module  
- **Current**: `orders.view` → Shows entire orders page
- **Problem**: Delete buttons, dispatch, status update show for all users
- **Should be**:
  - `orders.view` → View orders list
  - `orders.delete` → Delete button visibility
  - `orders.dispatch` → Dispatch operations
  - `orders.status_update` → Status update functionality

### 4. **Role-Based Access Issues**
**Customer Support role example:**
- **Should NOT have**: `orders.delete`, `dispatch.create`, `inventory.delete`
- **Should have**: `orders.view`, `orders.status_update`, `inventory.view`
- **Current problem**: All operations show if base permission granted

---

## 🎯 Correct Permission Mapping

### **Active Sidebar Modules Only**

#### 1. **Products Module** (`/products`)
```javascript
PRODUCTS: {
    'products.view': 'View product catalog',
    'products.create': 'Add new products', 
    'products.edit': 'Edit product details',
    'products.delete': 'Delete products',
    'products.categories': 'Manage categories',
    'products.bulk_import': 'Bulk import products',
    'products.export': 'Export product data',
    'products.self_transfer': 'Create self transfers'  // NEW
}
```

#### 2. **Inventory Module** (`/inventory`)
```javascript
INVENTORY: {
    'inventory.view': 'View inventory list',
    'inventory.timeline': 'View product timeline',
    'inventory.bulk_upload': 'Bulk upload inventory',
    'inventory.transfer': 'Transfer between warehouses',
    'inventory.adjust': 'Adjust stock quantities',
    'inventory.export': 'Export inventory data'
}
```

#### 3. **Orders Module** (`/order`)
```javascript
ORDERS: {
    'orders.view': 'View orders list',
    'orders.create': 'Create new orders',
    'orders.edit': 'Edit order details',
    'orders.delete': 'Delete orders',
    'orders.status_update': 'Update order status',
    'orders.export': 'Export order data'
}
```

#### 4. **Operations (Modal-based)**
```javascript
OPERATIONS: {
    'operations.dispatch': 'Create dispatch orders',
    'operations.damage': 'Damage management',
    'operations.return': 'Process returns',
    'operations.bulk': 'Bulk operations',
    'operations.self_transfer': 'Self transfer operations'  // NEW
}
```

#### 5. **Permissions Module** (`/permissions`)
```javascript
SYSTEM: {
    'system.user_management': 'Manage users',
    'system.role_management': 'Manage roles',
    'system.audit_log': 'View audit logs'
}
```

---

## 🔧 Implementation Fix Plan

### Step 1: Clean Database Permissions
```sql
-- Remove duplicate permissions
DELETE FROM permissions WHERE name IN (
    'DASHBOARD_VIEW', 'DASHBOARD_STATS', 'DASHBOARD_CHARTS', 'DASHBOARD_EXPORT', 'DASHBOARD_CUSTOMIZE',
    'INVENTORY_VIEW', 'INVENTORY_CREATE', 'INVENTORY_EDIT', 'INVENTORY_DELETE', 'INVENTORY_BULK_UPLOAD',
    'INVENTORY_BULK_EXPORT', 'INVENTORY_TRANSFER', 'INVENTORY_ADJUST', 'INVENTORY_AUDIT', 'INVENTORY_TIMELINE', 'INVENTORY_REPORTS',
    'ORDERS_VIEW', 'ORDERS_CREATE', 'ORDERS_EDIT', 'ORDERS_DELETE', 'ORDERS_PROCESS', 'ORDERS_DISPATCH',
    'ORDERS_RETURNS', 'ORDERS_BULK_PROCESS', 'ORDERS_EXPORT', 'ORDERS_REPORTS',
    'PRODUCTS_VIEW', 'PRODUCTS_CREATE', 'PRODUCTS_EDIT', 'PRODUCTS_DELETE', 'PRODUCTS_BULK_IMPORT',
    'PRODUCTS_BULK_EXPORT', 'PRODUCTS_CATEGORIES', 'PRODUCTS_PRICING', 'PRODUCTS_REPORTS'
);

-- Remove permissions for disabled modules
DELETE FROM permissions WHERE category IN ('TRACKING', 'MESSAGES', 'DASHBOARD');

-- Add missing granular permissions
INSERT INTO permissions (name, display_name, description, category) VALUES
('inventory.timeline', 'View Timeline', 'View product movement timeline', 'inventory'),
('orders.status_update', 'Update Status', 'Update order status', 'orders');
```

### Step 2: Update Frontend Permission Context
```javascript
// src/contexts/PermissionsContext.jsx
export const PERMISSIONS = {
    // Products
    PRODUCTS_VIEW: 'products.view',
    PRODUCTS_CREATE: 'products.create',
    PRODUCTS_EDIT: 'products.edit',
    PRODUCTS_DELETE: 'products.delete',
    PRODUCTS_CATEGORIES: 'products.categories',
    PRODUCTS_BULK_IMPORT: 'products.bulk_import',
    PRODUCTS_EXPORT: 'products.export',
    PRODUCTS_SELF_TRANSFER: 'products.self_transfer',
    
    // Inventory
    INVENTORY_VIEW: 'inventory.view',
    INVENTORY_TIMELINE: 'inventory.timeline',
    INVENTORY_BULK_UPLOAD: 'inventory.bulk_upload',
    INVENTORY_TRANSFER: 'inventory.transfer',
    INVENTORY_ADJUST: 'inventory.adjust',
    INVENTORY_EXPORT: 'inventory.export',
    
    // Orders
    ORDERS_VIEW: 'orders.view',
    ORDERS_CREATE: 'orders.create',
    ORDERS_EDIT: 'orders.edit',
    ORDERS_DELETE: 'orders.delete',
    ORDERS_STATUS_UPDATE: 'orders.status_update',
    ORDERS_EXPORT: 'orders.export',
    
    // Operations
    OPERATIONS_DISPATCH: 'operations.dispatch',
    OPERATIONS_DAMAGE: 'operations.damage',
    OPERATIONS_RETURN: 'operations.return',
    OPERATIONS_BULK: 'operations.bulk',
    OPERATIONS_SELF_TRANSFER: 'operations.self_transfer',
    
    // System
    SYSTEM_USER_MANAGEMENT: 'system.user_management',
    SYSTEM_ROLE_MANAGEMENT: 'system.role_management',
    SYSTEM_AUDIT_LOG: 'system.audit_log'
};
```

### Step 3: Fix Component Permission Checks

#### Products Component Fix
```javascript
// src/app/products/ProductManager.jsx
import { usePermissions, PERMISSIONS } from '@/contexts/PermissionsContext';

export default function ProductManager() {
    const { hasPermission } = usePermissions();
    
    return (
        <div>
            {/* Products list - always show if has products.view */}
            <ProductsList />
            
            {/* Self Transfer button - only show if has self transfer permission */}
            {hasPermission(PERMISSIONS.PRODUCTS_SELF_TRANSFER) && (
                <button onClick={handleSelfTransfer}>
                    Self Transfer
                </button>
            )}
            
            {/* Delete button - only show if has delete permission */}
            {hasPermission(PERMISSIONS.PRODUCTS_DELETE) && (
                <DeleteButton />
            )}
        </div>
    );
}
```

#### Operations Modal Fix
```javascript
// src/components/OperationsTabs.jsx
export default function OperationsTabs() {
    const { hasPermission } = usePermissions();
    
    const tabs = [
        {
            id: "dispatch",
            label: "Dispatch",
            permission: PERMISSIONS.OPERATIONS_DISPATCH
        },
        {
            id: "transfer", 
            label: "Self Transfer",
            permission: PERMISSIONS.OPERATIONS_SELF_TRANSFER  // NEW
        },
        {
            id: "damage",
            label: "Damage",
            permission: PERMISSIONS.OPERATIONS_DAMAGE
        }
    ];
    
    return (
        <div>
            {tabs.filter(tab => hasPermission(tab.permission)).map(tab => (
                <TabButton key={tab.id} {...tab} />
            ))}
        </div>
    );
}
```

#### Inventory Component Fix
```javascript
// src/app/inventory/InventorySheet.jsx
import { usePermissions, PERMISSIONS } from '@/contexts/PermissionsContext';

export default function InventorySheet() {
    const { hasPermission } = usePermissions();
    
    return (
        <div>
            {/* Basic inventory list - always show if has inventory.view */}
            <InventoryList />
            
            {/* Timeline tab - only show if has timeline permission */}
            {hasPermission(PERMISSIONS.INVENTORY_TIMELINE) && (
                <TimelineTab />
            )}
            
            {/* Bulk upload button - only show if has bulk upload permission */}
            {hasPermission(PERMISSIONS.INVENTORY_BULK_UPLOAD) && (
                <BulkUploadButton />
            )}
        </div>
    );
}
```

#### Orders Component Fix
```javascript
// src/app/order/OrderSheet.jsx
export default function OrderSheet() {
    const { hasPermission } = usePermissions();
    
    return (
        <div>
            {/* Orders list - always show if has orders.view */}
            <OrdersList />
            
            {/* Delete button - only show if has delete permission */}
            {hasPermission(PERMISSIONS.ORDERS_DELETE) && (
                <DeleteButton />
            )}
            
            {/* Status update - only show if has status update permission */}
            {hasPermission(PERMISSIONS.ORDERS_STATUS_UPDATE) && (
                <StatusUpdateDropdown />
            )}
        </div>
    );
}
```

### Step 4: Define Proper Role Templates

#### Customer Support Role
```javascript
CUSTOMER_SUPPORT: {
    name: 'Customer Support',
    permissions: [
        'orders.view',           // View orders
        'orders.status_update',  // Update status only
        'inventory.view',        // Check stock
        'products.view'          // View product details
        // NO: orders.delete, operations.dispatch, inventory.timeline
    ]
}
```

#### Warehouse Staff Role  
```javascript
WAREHOUSE_STAFF: {
    name: 'Warehouse Staff',
    permissions: [
        'inventory.view',        // View inventory
        'inventory.adjust',      // Adjust stock
        'inventory.transfer',    // Transfer stock
        'operations.dispatch',   // Create dispatches
        'operations.self_transfer', // Self transfers
        'orders.view',          // View orders
        'orders.status_update'   // Update order status
        // NO: orders.delete, inventory.timeline, products.delete
    ]
}
```

---

## 🎯 Correct Permission Structure

### **Final Clean Permission List (28 permissions)**

#### Products (8 permissions)
- `products.view` - View product catalog
- `products.create` - Add new products  
- `products.edit` - Edit product details
- `products.delete` - Delete products
- `products.categories` - Manage categories
- `products.bulk_import` - Bulk import
- `products.export` - Export data
- `products.self_transfer` - Create self transfers

#### Inventory (6 permissions)
- `inventory.view` - View inventory list
- `inventory.timeline` - View timeline
- `inventory.bulk_upload` - Bulk upload
- `inventory.transfer` - Transfer stock
- `inventory.adjust` - Adjust quantities
- `inventory.export` - Export data

#### Orders (6 permissions)
- `orders.view` - View orders
- `orders.create` - Create orders
- `orders.edit` - Edit orders
- `orders.delete` - Delete orders
- `orders.status_update` - Update status
- `orders.export` - Export data

#### Operations (5 permissions)
- `operations.dispatch` - Dispatch operations
- `operations.damage` - Damage management
- `operations.return` - Return processing
- `operations.bulk` - Bulk operations
- `operations.self_transfer` - Self transfer operations

#### System (3 permissions)
- `system.user_management` - Manage users
- `system.role_management` - Manage roles
- `system.audit_log` - View audit logs

---

## 🚀 Implementation Steps

1. **Clean Database**: Remove duplicate and unused permissions
2. **Update Frontend Context**: Use only active permissions
3. **Fix Component Checks**: Add granular permission checks
4. **Update Role Templates**: Define proper role-based access
5. **Test Permission Flow**: Verify each component respects permissions

This will create a clean, logical permission system where:
- ✅ No duplicate permissions
- ✅ Only active UI components have permissions  
- ✅ Granular control (timeline separate from inventory view)
- ✅ Role-based access works correctly
- ✅ Customer support can't delete orders
- ✅ Components render based on specific permissions