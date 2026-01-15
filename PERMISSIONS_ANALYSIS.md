# 🔐 Permissions System Analysis & Implementation Plan

## Objective:
Create a user management system where:
1. Admin can create users with specific roles
2. Each role has specific permissions (page access, actions)
3. Components render based on user's permissions
4. Example: User "Shorya Singh" with role "User" can only see/do what's permitted

## Step-by-Step Plan:

### Phase 1: Database Analysis (DO NOT CHANGE EXISTING LOGIC)
1. ✅ Connect to database
2. ✅ Analyze all tables (users, roles, permissions, role_permissions, user_permissions)
3. ✅ Understand existing relationships
4. ✅ Document current permission structure

### Phase 2: Understand Frontend Components
1. Find sidebar component
2. Analyze how pages are rendered
3. Identify all action components (delete, update, create buttons)
4. Map components to permissions

### Phase 3: Create Permission System (WITHOUT CHANGING BUSINESS LOGIC)
1. Create `/api/users` endpoints (CRUD)
2. Create `/api/roles` endpoints (GET)
3. Create `/api/permissions` endpoints (GET)
4. Create permission checking middleware

### Phase 4: Build Permissions Page
1. User management table (list all users)
2. Create user form with:
   - Name
   - Email
   - Password
   - Role selection
   - Permission checkboxes (per role)
3. Edit user functionality
4. Delete user functionality

### Phase 5: Implement Permission-Based Rendering
1. Create `usePermissions()` hook
2. Wrap components with permission checks
3. Example:
   ```jsx
   {hasPermission('orders', 'delete') && <DeleteButton />}
   {hasPermission('orders', 'update') && <UpdateButton />}
   ```

### Phase 6: Sidebar Permission Control
1. Hide/show menu items based on permissions
2. Example: If no "dashboard" permission, hide dashboard link

## Permission Structure Example:

```
User: Shorya Singh
Role: User
Permissions:
  - orders:view ✅
  - orders:update ✅
  - orders:delete ❌
  - products:view ✅
  - products:create ❌
  - dashboard:view ❌
```

Result: Shorya can see orders page, update status, but cannot delete orders or access dashboard.

## Files to Create/Modify:

### Backend (NO BUSINESS LOGIC CHANGES):
- `routes/usersRoutes.js` (NEW)
- `routes/rolesRoutes.js` (NEW)
- `controllers/usersController.js` (NEW)
- `controllers/rolesController.js` (NEW)
- `middleware/checkPermission.js` (NEW)

### Frontend (NO BUSINESS LOGIC CHANGES):
- `src/app/permissions/page.jsx` (NEW - User Management UI)
- `src/hooks/usePermissions.js` (NEW)
- `src/contexts/PermissionsContext.jsx` (NEW)
- Modify sidebar to check permissions
- Wrap action buttons with permission checks

## Next Steps:
1. Run `analyze-and-fix-permissions.sh` on server
2. Review database structure
3. Create backend API routes
4. Build permissions UI
5. Implement permission checks in components
