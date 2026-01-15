# 🔐 Permissions System - Complete Design

## Current Database Structure (UNDERSTOOD):

### Users Table:
- `id` - Primary key
- `name` - User name
- `email` - Unique email
- `password` - Hashed password
- `role` - ENUM (developer, admin, user, viewer) - LEGACY
- `role_id` - FK to roles table (NEW SYSTEM)
- `permissions` - JSON array (LEGACY - for backward compatibility)
- `is_active` - Active status
- `created_at`, `last_login`, `login_count`

### Roles Table:
- `id` - Primary key
- `name` - Unique role name (super_admin, admin, manager, operator, warehouse_staff, viewer)
- `display_name` - Human readable name
- `description` - Role description
- `color` - UI color code
- `priority` - Role hierarchy (1 = highest)
- `is_active` - Active status

### Permissions Table:
- `id` - Primary key
- `name` - Unique permission name (e.g., DASHBOARD_VIEW, INVENTORY_CREATE)
- `display_name` - Human readable name
- `description` - Permission description
- `category` - Permission category (DASHBOARD, INVENTORY, ORDERS, PRODUCTS, etc.)
- `is_active` - Active status

### Role_Permissions Table (Junction):
- `id` - Primary key
- `role_id` - FK to roles
- `permission_id` - FK to permissions
- Maps which permissions each role has

## Implementation Plan (NO BUSINESS LOGIC CHANGES):

### Phase 1: Backend API Routes (NEW FILES ONLY)

#### 1. Create `routes/usersRoutes.js`:
```javascript
GET /api/users - List all users
GET /api/users/:id - Get single user
POST /api/users - Create new user
PUT /api/users/:id - Update user
DELETE /api/users/:id - Delete user
GET /api/users/:id/permissions - Get user's effective permissions
```

#### 2. Create `routes/rolesRoutes.js`:
```javascript
GET /api/roles - List all roles
GET /api/roles/:id - Get single role
GET /api/roles/:id/permissions - Get role's permissions
```

#### 3. Create `routes/permissionsRoutes.js`:
```javascript
GET /api/permissions - List all permissions
GET /api/permissions/by-category - Get permissions grouped by category
```

### Phase 2: Frontend Components (NEW FILES ONLY)

#### 1. Create `src/app/permissions/page.jsx`:
User Management Page with:
- User list table
- Create user form
- Edit user modal
- Delete confirmation
- Role assignment
- Permission override (optional)

#### 2. Create `src/hooks/usePermissions.js`:
```javascript
const { hasPermission, userPermissions } = usePermissions();

// Usage:
if (hasPermission('INVENTORY_DELETE')) {
  // Show delete button
}
```

#### 3. Create `src/contexts/PermissionsContext.jsx`:
Global permission state management

#### 4. Create `src/components/PermissionGate.jsx`:
```javascript
<PermissionGate permission="INVENTORY_DELETE">
  <DeleteButton />
</PermissionGate>
```

### Phase 3: Sidebar Permission Control

Modify sidebar to check permissions before showing menu items:
```javascript
{hasPermission('DASHBOARD_VIEW') && <DashboardLink />}
{hasPermission('INVENTORY_VIEW') && <InventoryLink />}
{hasPermission('ORDERS_VIEW') && <OrdersLink />}
```

### Phase 4: Component-Level Permission Checks

Wrap action buttons with permission checks:
```javascript
// In Orders page:
{hasPermission('ORDERS_DELETE') && <DeleteButton />}
{hasPermission('ORDERS_UPDATE') && <UpdateStatusButton />}
{hasPermission('ORDERS_CREATE') && <CreateOrderButton />}

// In Inventory page:
{hasPermission('INVENTORY_DELETE') && <DeleteButton />}
{hasPermission('INVENTORY_EDIT') && <EditButton />}
{hasPermission('INVENTORY_BULK_UPLOAD') && <BulkUploadButton />}
```

## Example User Flow:

### Create User "Shorya Singh":
1. Admin goes to `/permissions` page
2. Clicks "Create User"
3. Fills form:
   - Name: Shorya Singh
   - Email: shorya@example.com
   - Password: ****
   - Role: User (role_id = 6)
4. System automatically assigns permissions based on role
5. Admin can optionally add/remove specific permissions

### User "Shorya Singh" Logs In:
1. System loads user data
2. Fetches role permissions from `role_permissions` table
3. Merges with user-specific permissions (if any)
4. Stores in PermissionsContext
5. Sidebar shows only allowed pages
6. Components render only allowed actions

### Example Permissions for "User" Role:
```
ORDERS_VIEW ✅
ORDERS_UPDATE ✅
ORDERS_DELETE ❌
INVENTORY_VIEW ✅
INVENTORY_CREATE ❌
DASHBOARD_VIEW ❌
```

Result: Shorya can see orders, update status, but cannot delete orders or access dashboard.

## Files to Create:

### Backend (8 new files):
1. `routes/usersRoutes.js`
2. `routes/rolesRoutes.js`  
3. `routes/permissionsRoutes.js`
4. `controllers/usersController.js`
5. `controllers/rolesController.js`
6. `controllers/permissionsController.js`
7. `middleware/checkPermission.js`
8. `middleware/authenticate.js`

### Frontend (6 new files):
1. `src/app/permissions/page.jsx`
2. `src/hooks/usePermissions.js`
3. `src/contexts/PermissionsContext.jsx`
4. `src/components/PermissionGate.jsx`
5. `src/services/api/users.js`
6. `src/services/api/roles.js`

### Modified Files (ONLY ADD PERMISSION CHECKS):
1. Sidebar component - Add permission checks
2. Order pages - Wrap buttons with PermissionGate
3. Inventory pages - Wrap buttons with PermissionGate
4. Product pages - Wrap buttons with PermissionGate

## NO CHANGES TO:
- Existing business logic
- Database schema
- Existing API endpoints
- Existing component functionality

## ONLY ADDING:
- New API routes for user/role/permission management
- Permission checking layer
- UI for user management
- Conditional rendering based on permissions
