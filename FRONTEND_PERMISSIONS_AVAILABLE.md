# Frontend Permissions Available in Role Management

## Permissions Available When Adding/Editing Roles in UI

**Location**: `/permissions` page → Roles tab → Add/Edit Role Modal  
**Total Frontend Permissions**: 42 permissions

---

## Frontend Permission Categories

### 1. DASHBOARD (3 permissions)
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `dashboard.view` | View Dashboard | Access to main dashboard |
| `dashboard.analytics` | Dashboard Analytics | View dashboard analytics and metrics |
| `dashboard.export` | Export Dashboard | Export dashboard data and reports |

### 2. INVENTORY (7 permissions)
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `inventory.view` | View Inventory | View inventory items and stock levels |
| `inventory.create` | Create Inventory | Add new inventory items |
| `inventory.edit` | Edit Inventory | Modify existing inventory items |
| `inventory.delete` | Delete Inventory | Remove inventory items |
| `inventory.transfer` | Transfer Inventory | Transfer inventory between warehouses |
| `inventory.export` | Export Inventory | Export inventory data |
| `inventory.bulk_upload` | Bulk Upload Inventory | Upload inventory in bulk via CSV |

### 3. ORDERS (7 permissions)
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `orders.view` | View Orders | View order list and details |
| `orders.create` | Create Orders | Create new orders |
| `orders.edit` | Edit Orders | Modify existing orders |
| `orders.delete` | Delete Orders | Cancel or delete orders |
| `orders.dispatch` | Dispatch Orders | Dispatch orders for delivery |
| `orders.export` | Export Orders | Export order data and reports |
| `orders.remarks` | Order Remarks | Add remarks to orders |

### 4. TRACKING (2 permissions)
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `tracking.view` | View Tracking | View shipment tracking information |
| `tracking.real_time` | Real-time Tracking | Access real-time tracking updates |

### 5. MESSAGES (6 permissions)
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `messages.view` | View Messages | View team messages and communications |
| `messages.send` | Send Messages | Send messages to team members |
| `messages.create_channel` | Create Channel | Create new message channels |
| `messages.delete` | Delete Messages | Delete messages and conversations |
| `messages.voice` | Voice Messages | Send and receive voice messages |
| `messages.file_upload` | File Upload | Upload files in messages |

### 6. PRODUCTS (7 permissions)
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `products.view` | View Products | View product catalog and details |
| `products.create` | Create Products | Add new products to catalog |
| `products.edit` | Edit Products | Modify existing product information |
| `products.delete` | Delete Products | Remove products from catalog |
| `products.categories` | Manage Categories | Manage product categories |
| `products.bulk_import` | Bulk Import Products | Import products in bulk via CSV |
| `products.export` | Export Products | Export product data |

### 7. OPERATIONS (5 permissions)
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `operations.dispatch` | Dispatch Operations | Create and manage dispatch operations |
| `operations.damage` | Damage Operations | Handle damage reporting and recovery |
| `operations.return` | Return Operations | Process product returns |
| `operations.recover` | Recovery Operations | Recover damaged or lost items |
| `operations.bulk` | Bulk Operations | Perform bulk inventory operations |

### 8. SYSTEM (4 permissions)
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `system.settings` | System Settings | Configure system settings |
| `system.user_management` | User Management | Manage system users and accounts |
| `system.permissions` | Permission Management | Manage system permissions |
| `system.audit_log` | Audit Log | View system audit logs |

### 9. EXPORT (3 permissions)
| Permission Key | Display Name | Description |
|----------------|--------------|-------------|
| `export.csv` | Export CSV | Export data in CSV format |
| `export.pdf` | Export PDF | Export data in PDF format |
| `export.excel` | Export Excel | Export data in Excel format |

---

## Predefined Role Templates

### 1. SUPER_ADMIN
**Color**: Red (#dc2626)  
**Priority**: 1  
**Permissions**: All 42 permissions  
**Description**: Full system access with user management

### 2. ADMIN
**Color**: Orange (#ea580c)  
**Priority**: 2  
**Permissions**: 38 permissions (excludes some system permissions)  
**Description**: Full operational access without user management

**Excluded Permissions**:
- `system.user_management`
- `system.permissions`
- `system.audit_log`
- `system.settings`

### 3. MANAGER
**Color**: Blue (#2563eb)  
**Priority**: 3  
**Permissions**: 31 permissions  
**Description**: Management access with reporting capabilities

**Key Permissions**:
- Dashboard analytics and export
- Inventory view, edit, transfer, export
- Orders create, edit, dispatch, export
- Products view, create, edit, categories, export
- Operations dispatch, damage, return
- Export CSV and Excel

### 4. OPERATOR
**Color**: Green (#16a34a)  
**Priority**: 4  
**Permissions**: 16 permissions  
**Description**: Operational access for daily tasks

**Key Permissions**:
- Dashboard view
- Inventory view, edit, transfer
- Orders view, create, edit, dispatch, remarks
- Tracking view
- Messages view, send, voice
- Operations dispatch, damage, return

### 5. WAREHOUSE_STAFF
**Color**: Purple (#7c3aed)  
**Priority**: 5  
**Permissions**: 9 permissions  
**Description**: Inventory and warehouse operations only

**Key Permissions**:
- Inventory view, edit, transfer
- Orders view, dispatch
- Tracking view
- Messages view, send
- Operations dispatch

### 6. VIEWER
**Color**: Gray (#64748b)  
**Priority**: 6  
**Permissions**: 5 permissions  
**Description**: Read-only access to reports and data

**Key Permissions**:
- Dashboard view
- Inventory view
- Orders view
- Tracking view
- Messages view

---

## Role Management UI Features

### Permission Selection Interface
- **Grouped by Category**: Permissions are organized by functional categories
- **Checkbox Selection**: Each permission can be individually selected/deselected
- **Visual Grouping**: Categories are visually separated for easy navigation
- **Bulk Selection**: Can select all permissions in a category
- **Search/Filter**: Can search for specific permissions

### Role Creation Form
```javascript
{
    name: "Role Name",              // Internal role name
    display_name: "Display Name",   // User-friendly name
    description: "Role description", // Role purpose description
    color: "#6366f1",              // Role color for UI
    permissionIds: [1, 2, 3, ...]  // Array of selected permission IDs
}
```

### Permission Categories in UI
The frontend groups permissions into logical categories for better user experience:

1. **Dashboard** - Dashboard access and analytics
2. **Inventory** - Stock management and operations
3. **Orders** - Order processing and fulfillment
4. **Tracking** - Shipment and delivery tracking
5. **Messages** - Team communication features
6. **Products** - Product catalog management
7. **Operations** - Operational tasks and workflows
8. **System** - System administration
9. **Export** - Data export capabilities

---

## Permission Mapping

### Frontend to Database Mapping
The frontend permissions context defines 42 permissions that map to the database permissions table. When a role is created/updated:

1. **Frontend Selection**: User selects permissions via checkboxes
2. **Permission IDs**: Selected permissions are converted to database IDs
3. **Role Creation**: Role is created with selected permission IDs
4. **Database Storage**: Permissions are stored in `role_permissions` table

### Dynamic Loading
- Permissions are loaded from the database via API
- Frontend falls back to local definitions if API unavailable
- Real-time permission checking for UI elements
- Role-based navigation and feature access

---

## Usage in Role Management

### Creating a New Role
1. Navigate to `/permissions` page
2. Click "Roles" tab
3. Click "Add Role" button
4. Fill in role details (name, display name, description, color)
5. Select permissions by category
6. Click "Create" to save

### Editing Existing Role
1. Navigate to `/permissions` page
2. Click "Roles" tab
3. Click "Edit" on desired role
4. Modify role details and permissions
5. Click "Update" to save changes

### Permission Inheritance
- Roles can be assigned to users
- Users inherit all permissions from their assigned role
- Permission checking is done in real-time
- UI elements are shown/hidden based on permissions

This frontend permission system provides a user-friendly interface for managing the complex permission structure stored in the database.