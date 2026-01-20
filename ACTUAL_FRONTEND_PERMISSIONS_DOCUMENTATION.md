# 🔐 ACTUAL Frontend Permissions Documentation
## Based on Real Sidebar and Components Analysis

**Generated:** January 20, 2026  
**Analysis:** Based on actual sidebar.jsx and component files  

---

## 📋 ACTUAL SIDEBAR STRUCTURE

From `src/components/ui/sidebar.jsx`, here are the **ACTUAL ACTIVE TABS**:

### 1. 📦 **PRODUCTS** 
**Route:** `/products`  
**Sidebar Permission:** `PERMISSIONS.PRODUCTS_VIEW`  
**Component:** `ProductManager.jsx`

### 2. 📊 **INVENTORY** 
**Route:** `/inventory`  
**Sidebar Permission:** `PERMISSIONS.INVENTORY_VIEW`  
**Component:** `InventorySheet.jsx`  
**Sub-features:** No sub-items in sidebar (features controlled within page)

### 3. 🚚 **ORDERS** 
**Route:** `/order`  
**Sidebar Permission:** `PERMISSIONS.ORDERS_VIEW`  
**Component:** `OrderSheet.jsx`  
**Sub-items in sidebar:**
- **Dispatch** (modal) - `PERMISSIONS.OPERATIONS_DISPATCH`
- **Website Orders** - `/order/websiteorder`
- **Store** - `/order/store`

### 4. ⚙️ **OPERATIONS** 
**Route:** `#` (Modal-based)  
**Component:** Modal operations  
**Sub-items in sidebar:**
- **📦 Dispatch** - `PERMISSIONS.OPERATIONS_DISPATCH`
- **⚠️ Damage** - `PERMISSIONS.OPERATIONS_DAMAGE`
- **🔄 Return** - `PERMISSIONS.OPERATIONS_RETURN`
- **📤 Bulk Upload** - `PERMISSIONS.OPERATIONS_BULK`
- **🔄 Self Transfer** - `PERMISSIONS.OPERATIONS_SELF_TRANSFER`

### 5. 🛡️ **PERMISSIONS** 
**Route:** `/permissions`  
**Sidebar Permission:** `PERMISSIONS.SYSTEM_USER_MANAGEMENT` OR `PERMISSIONS.SYSTEM_ROLE_MANAGEMENT` OR `PERMISSIONS.SYSTEM_AUDIT_LOG`  
**Component:** `PermissionsManager.jsx`

---

## 🚫 **DISABLED/COMMENTED OUT TABS**

From sidebar analysis, these are **DISABLED** (commented out):
- **Dashboard** - Code removed for cleaner build
- **Tracking** - Code removed for cleaner build  
- **Access Control** - Code removed for cleaner build

---

## 🧩 **TAB-WISE PERMISSION BREAKDOWN**

### 1. 📦 **PRODUCTS TAB**
**Main Permission:** `PRODUCTS_VIEW`

**Features in ProductManager.jsx:**
- View products list
- Search and filter products
- Product categories
- Product management

**Required Permissions:**
```javascript
PRODUCTS_VIEW          // View products tab
PRODUCTS_CREATE        // Add new products
PRODUCTS_EDIT          // Edit existing products  
PRODUCTS_DELETE        // Delete products
PRODUCTS_CATEGORIES    // Manage categories
PRODUCTS_BULK_IMPORT   // Bulk import products
PRODUCTS_EXPORT        // Export products
```

---

### 2. 📊 **INVENTORY TAB**
**Main Permission:** `INVENTORY_VIEW`

**Features in InventorySheet.jsx:**
- View inventory levels
- Search inventory (with chips)
- Filter by warehouse
- Filter by stock status (all/in-stock/low-stock/out-of-stock)
- Sort inventory
- Date range filtering
- Export inventory
- **Product Timeline** (modal) - View individual product movement history

**Required Permissions:**
```javascript
INVENTORY_VIEW         // View inventory tab
INVENTORY_EXPORT       // Export inventory data
INVENTORY_TIMELINE     // View product timeline (modal)
INVENTORY_BULK_UPLOAD  // Bulk upload (if available)
```

**Note:** No "edit inventory" feature found in the component - it's view-only with export and timeline.

---

### 3. 🚚 **ORDERS TAB**
**Main Permission:** `ORDERS_VIEW`

**Features in OrderSheet.jsx:**
- View dispatch orders
- Search orders
- Filter by date range
- Status updates (dropdown with 10 status options)
- Export orders
- Delete orders (with confirmation)
- Edit remarks
- **Timeline modal** - View order timeline
- Customer details modal
- Product details modal

**Sub-pages:**
- **Website Orders** (`/order/websiteorder`)
- **Store Orders** (`/order/store`)

**Required Permissions:**
```javascript
ORDERS_VIEW            // View orders tab
ORDERS_STATUS_UPDATE   // Update order status
ORDERS_DELETE          // Delete orders
ORDERS_EXPORT          // Export orders
ORDERS_TIMELINE        // View order timeline
OPERATIONS_DISPATCH    // Access dispatch sub-item
```

---

### 4. ⚙️ **OPERATIONS TAB**
**Modal-based operations** (no dedicated page)

**Sub-operations:**
- **📦 Dispatch** - Create dispatch orders
- **⚠️ Damage** - Report damaged items  
- **🔄 Return** - Process returns
- **📤 Bulk Upload** - Mass inventory upload
- **🔄 Self Transfer** - Inter-warehouse transfers

**Required Permissions:**
```javascript
OPERATIONS_DISPATCH      // Dispatch operations
OPERATIONS_DAMAGE        // Damage operations  
OPERATIONS_RETURN        // Return operations
OPERATIONS_BULK          // Bulk operations
OPERATIONS_SELF_TRANSFER // Self transfer operations
```

---

### 5. 🛡️ **PERMISSIONS TAB**
**Main Permission:** `SYSTEM_USER_MANAGEMENT` OR `SYSTEM_ROLE_MANAGEMENT` OR `SYSTEM_AUDIT_LOG`

**Features in PermissionsManager.jsx:**
- **Users Tab** - User CRUD operations
- **Roles Tab** - Role CRUD operations  
- **Permissions Tab** - View all permissions (read-only)
- **Audit Logs Tab** - View system activity

**Required Permissions:**
```javascript
SYSTEM_USER_MANAGEMENT   // Users tab
SYSTEM_ROLE_MANAGEMENT   // Roles tab  
SYSTEM_AUDIT_LOG         // Audit logs tab
// Permissions tab is always visible (read-only)
```

---

## 🎯 **SIMPLIFIED PERMISSION LIST**

Based on actual frontend analysis, here are the **ESSENTIAL PERMISSIONS** needed:

### **Core Navigation Permissions:**
```javascript
PRODUCTS_VIEW           // Products tab access
INVENTORY_VIEW          // Inventory tab access  
ORDERS_VIEW             // Orders tab access
SYSTEM_USER_MANAGEMENT  // Permissions tab access (users)
SYSTEM_ROLE_MANAGEMENT  // Permissions tab access (roles)
SYSTEM_AUDIT_LOG        // Permissions tab access (audit)
```

### **Products Permissions:**
```javascript
PRODUCTS_CREATE         // Add products
PRODUCTS_EDIT           // Edit products
PRODUCTS_DELETE         // Delete products
PRODUCTS_CATEGORIES     // Manage categories
PRODUCTS_BULK_IMPORT    // Bulk import
PRODUCTS_EXPORT         // Export products
```

### **Inventory Permissions:**
```javascript
INVENTORY_EXPORT        // Export inventory
INVENTORY_TIMELINE      // View product timeline
INVENTORY_BULK_UPLOAD   // Bulk upload
```

### **Orders Permissions:**
```javascript
ORDERS_STATUS_UPDATE    // Update order status
ORDERS_DELETE           // Delete orders
ORDERS_EXPORT           // Export orders
ORDERS_TIMELINE         // View order timeline
```

### **Operations Permissions:**
```javascript
OPERATIONS_DISPATCH     // Dispatch operations
OPERATIONS_DAMAGE       // Damage operations
OPERATIONS_RETURN       // Return operations  
OPERATIONS_BULK         // Bulk operations
OPERATIONS_SELF_TRANSFER // Self transfer
```

---

## 🔧 **IMPLEMENTATION EXAMPLE**

### Sidebar Permission Gates:
```jsx
// Products tab
{hasPermission(PERMISSIONS.PRODUCTS_VIEW) && (
    <SidebarMenuItem>
        <Link href="/products">Products</Link>
    </SidebarMenuItem>
)}

// Inventory tab  
{hasPermission(PERMISSIONS.INVENTORY_VIEW) && (
    <MenuItemWithSub label="Inventory" basePath="/inventory">
        {/* No sub-items */}
    </MenuItemWithSub>
)}

// Orders tab
{hasPermission(PERMISSIONS.ORDERS_VIEW) && (
    <MenuItemWithSub label="Orders" basePath="/order">
        {hasPermission(PERMISSIONS.OPERATIONS_DISPATCH) && (
            <button onClick={() => openOperation("dispatch")}>
                Dispatch
            </button>
        )}
        <Link href="/order/websiteorder">Website Orders</Link>
        <Link href="/order/store">Store</Link>
    </MenuItemWithSub>
)}

// Operations tab
{(hasPermission(PERMISSIONS.OPERATIONS_DISPATCH) || 
  hasPermission(PERMISSIONS.OPERATIONS_DAMAGE) || 
  hasPermission(PERMISSIONS.OPERATIONS_RETURN) || 
  hasPermission(PERMISSIONS.OPERATIONS_BULK) ||
  hasPermission(PERMISSIONS.OPERATIONS_SELF_TRANSFER)) && (
    <MenuItemWithSub label="Operations">
        {/* Operation buttons */}
    </MenuItemWithSub>
)}

// Permissions tab
{(hasPermission(PERMISSIONS.SYSTEM_USER_MANAGEMENT) || 
  hasPermission(PERMISSIONS.SYSTEM_ROLE_MANAGEMENT) || 
  hasPermission(PERMISSIONS.SYSTEM_AUDIT_LOG)) && (
    <SidebarMenuItem>
        <Link href="/permissions">Permissions</Link>
    </SidebarMenuItem>
)}
```

### Component Permission Gates:
```jsx
// In InventorySheet.jsx
{hasPermission(PERMISSIONS.INVENTORY_EXPORT) && (
    <button onClick={exportInventory}>Export</button>
)}

{hasPermission(PERMISSIONS.INVENTORY_TIMELINE) && (
    <button onClick={() => openTimeline(item)}>Timeline</button>
)}

// In OrderSheet.jsx  
{hasPermission(PERMISSIONS.ORDERS_STATUS_UPDATE) && (
    <StatusDropdown orderId={order.id} />
)}

{hasPermission(PERMISSIONS.ORDERS_DELETE) && (
    <button onClick={() => deleteOrder(order.id)}>Delete</button>
)}
```

---

## 📊 **ROLE RECOMMENDATIONS**

Based on actual frontend features:

### **SUPER_ADMIN** - All permissions
### **ADMIN** - All except system management
```javascript
PRODUCTS_VIEW, PRODUCTS_CREATE, PRODUCTS_EDIT, PRODUCTS_DELETE, PRODUCTS_CATEGORIES, PRODUCTS_BULK_IMPORT, PRODUCTS_EXPORT,
INVENTORY_VIEW, INVENTORY_EXPORT, INVENTORY_TIMELINE, INVENTORY_BULK_UPLOAD,
ORDERS_VIEW, ORDERS_STATUS_UPDATE, ORDERS_DELETE, ORDERS_EXPORT, ORDERS_TIMELINE,
OPERATIONS_DISPATCH, OPERATIONS_DAMAGE, OPERATIONS_RETURN, OPERATIONS_BULK, OPERATIONS_SELF_TRANSFER
```

### **MANAGER** - View + limited operations
```javascript
PRODUCTS_VIEW, PRODUCTS_EXPORT,
INVENTORY_VIEW, INVENTORY_EXPORT, INVENTORY_TIMELINE,
ORDERS_VIEW, ORDERS_STATUS_UPDATE, ORDERS_EXPORT, ORDERS_TIMELINE,
OPERATIONS_DISPATCH, OPERATIONS_RETURN
```

### **OPERATOR** - Basic operations
```javascript
PRODUCTS_VIEW,
INVENTORY_VIEW, INVENTORY_TIMELINE,
ORDERS_VIEW, ORDERS_STATUS_UPDATE,
OPERATIONS_DISPATCH, OPERATIONS_RETURN
```

### **WAREHOUSE_STAFF** - Inventory focused
```javascript
INVENTORY_VIEW, INVENTORY_TIMELINE, INVENTORY_BULK_UPLOAD,
OPERATIONS_DISPATCH, OPERATIONS_DAMAGE
```

### **VIEWER** - Read-only
```javascript
PRODUCTS_VIEW,
INVENTORY_VIEW,
ORDERS_VIEW
```

---

## ✅ **SUMMARY**

**Total Active Tabs:** 5 (Products, Inventory, Orders, Operations, Permissions)  
**Total Disabled Tabs:** 3 (Dashboard, Tracking, Access Control)  
**Essential Permissions:** ~25 permissions  
**Modal Operations:** 5 (Dispatch, Damage, Return, Bulk Upload, Self Transfer)

This documentation is based on **ACTUAL CODE ANALYSIS** of your frontend components, not assumptions. The permissions listed here directly correspond to what's implemented in your sidebar and component files.