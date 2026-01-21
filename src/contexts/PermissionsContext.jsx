"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { PermissionsAPI } from "../services/permissionsApi";

const PermissionsContext = createContext(null);

// Define all available permissions (Backend format - UPPERCASE)
export const PERMISSIONS = {
    // Products permissions
    PRODUCTS_VIEW: 'PRODUCTS_VIEW',
    PRODUCTS_CREATE: 'PRODUCTS_CREATE',
    PRODUCTS_EDIT: 'PRODUCTS_EDIT',
    PRODUCTS_DELETE: 'PRODUCTS_DELETE',
    PRODUCTS_BULK_IMPORT: 'PRODUCTS_BULK_IMPORT',
    PRODUCTS_EXPORT: 'PRODUCTS_EXPORT',
    PRODUCTS_CATEGORIES: 'PRODUCTS_CATEGORIES',
    PRODUCTS_SELF_TRANSFER: 'PRODUCTS_SELF_TRANSFER',
    
    // Inventory permissions
    INVENTORY_VIEW: 'INVENTORY_VIEW',
    INVENTORY_EDIT: 'INVENTORY_EDIT',
    INVENTORY_TIMELINE: 'INVENTORY_TIMELINE',
    INVENTORY_ADJUST: 'INVENTORY_ADJUST',
    INVENTORY_TRANSFER: 'INVENTORY_TRANSFER',
    INVENTORY_EXPORT: 'INVENTORY_EXPORT',
    
    // Orders permissions
    ORDERS_VIEW: 'ORDERS_VIEW',
    ORDERS_CREATE: 'ORDERS_CREATE',
    ORDERS_EDIT: 'ORDERS_EDIT',
    ORDERS_STATUS_UPDATE: 'ORDERS_STATUS_UPDATE',
    ORDERS_EXPORT: 'ORDERS_EXPORT',
    
    // Operations permissions
    OPERATIONS_DISPATCH: 'OPERATIONS_DISPATCH',
    OPERATIONS_DAMAGE: 'OPERATIONS_DAMAGE',
    OPERATIONS_RETURN: 'OPERATIONS_RETURN',
    OPERATIONS_BULK: 'OPERATIONS_BULK',
    OPERATIONS_SELF_TRANSFER: 'OPERATIONS_SELF_TRANSFER',
    
    // Dashboard permissions
    DASHBOARD_VIEW: 'DASHBOARD_VIEW',
    
    // Tracking permissions
    TRACKING_VIEW: 'TRACKING_VIEW',
    
    // Messages permissions
    MESSAGES_VIEW: 'MESSAGES_VIEW',
    
    // System permissions
    SYSTEM_USER_MANAGEMENT: 'SYSTEM_USER_MANAGEMENT',
    SYSTEM_ROLE_MANAGEMENT: 'SYSTEM_ROLE_MANAGEMENT',
    SYSTEM_AUDIT_LOG: 'SYSTEM_AUDIT_LOG',
    SYSTEM_PERMISSION_MANAGEMENT: 'SYSTEM_PERMISSION_MANAGEMENT',
};

// Define roles and their permissions (Updated for backend format)
export const ROLES = {
    SUPER_ADMIN: {
        name: 'Super Admin',
        description: 'Full system access with all permissions',
        permissions: Object.values(PERMISSIONS), // All permissions
        color: '#dc2626', // Red
        priority: 1
    },
    ADMIN: {
        name: 'Admin',
        description: 'Full operational access without user management',
        permissions: [
            PERMISSIONS.PRODUCTS_VIEW,
            PERMISSIONS.PRODUCTS_CREATE,
            PERMISSIONS.PRODUCTS_EDIT,
            PERMISSIONS.PRODUCTS_DELETE,
            PERMISSIONS.PRODUCTS_BULK_IMPORT,
            PERMISSIONS.PRODUCTS_EXPORT,
            PERMISSIONS.PRODUCTS_CATEGORIES,
            PERMISSIONS.PRODUCTS_SELF_TRANSFER,
            PERMISSIONS.INVENTORY_VIEW,
            PERMISSIONS.INVENTORY_EDIT,
            PERMISSIONS.INVENTORY_TIMELINE,
            PERMISSIONS.INVENTORY_ADJUST,
            PERMISSIONS.INVENTORY_TRANSFER,
            PERMISSIONS.INVENTORY_EXPORT,
            PERMISSIONS.ORDERS_VIEW,
            PERMISSIONS.ORDERS_CREATE,
            PERMISSIONS.ORDERS_EDIT,
            PERMISSIONS.ORDERS_STATUS_UPDATE,
            PERMISSIONS.ORDERS_EXPORT,
            PERMISSIONS.OPERATIONS_DISPATCH,
            PERMISSIONS.OPERATIONS_DAMAGE,
            PERMISSIONS.OPERATIONS_RETURN,
            PERMISSIONS.OPERATIONS_BULK,
            PERMISSIONS.OPERATIONS_SELF_TRANSFER,
            PERMISSIONS.DASHBOARD_VIEW,
            PERMISSIONS.TRACKING_VIEW,
            PERMISSIONS.MESSAGES_VIEW,
        ],
        color: '#ea580c', // Orange
        priority: 2
    },
    MANAGER: {
        name: 'Manager',
        description: 'Management access with reporting capabilities',
        permissions: [
            PERMISSIONS.PRODUCTS_VIEW,
            PERMISSIONS.PRODUCTS_CREATE,
            PERMISSIONS.PRODUCTS_EDIT,
            PERMISSIONS.PRODUCTS_CATEGORIES,
            PERMISSIONS.PRODUCTS_EXPORT,
            // Inventory (view, timeline, export)
            PERMISSIONS.INVENTORY_VIEW,
            PERMISSIONS.INVENTORY_TIMELINE,
            PERMISSIONS.INVENTORY_EXPORT,
            // Orders (view, create, edit, status_update, export)
            PERMISSIONS.ORDERS_VIEW,
            PERMISSIONS.ORDERS_CREATE,
            PERMISSIONS.ORDERS_EDIT,
            PERMISSIONS.ORDERS_STATUS_UPDATE,
            PERMISSIONS.ORDERS_EXPORT,
            // Operations (dispatch, damage, return)
            PERMISSIONS.OPERATIONS_DISPATCH,
            PERMISSIONS.OPERATIONS_DAMAGE,
            PERMISSIONS.OPERATIONS_RETURN,
        ],
        color: '#2563eb', // Blue
        priority: 3
    },
    WAREHOUSE_STAFF: {
        name: 'Warehouse Staff',
        description: 'Inventory and warehouse operations only',
        permissions: [
            // Inventory (view, adjust, transfer)
            PERMISSIONS.INVENTORY_VIEW,
            PERMISSIONS.INVENTORY_ADJUST,
            PERMISSIONS.INVENTORY_TRANSFER,
            // Orders (view, status_update)
            PERMISSIONS.ORDERS_VIEW,
            PERMISSIONS.ORDERS_STATUS_UPDATE,
            // Operations (dispatch, self_transfer)
            PERMISSIONS.OPERATIONS_DISPATCH,
            PERMISSIONS.OPERATIONS_SELF_TRANSFER,
        ],
        color: '#7c3aed', // Purple
        priority: 4
    },
    CUSTOMER_SUPPORT: {
        name: 'Customer Support',
        description: 'Customer service and order support',
        permissions: [
            // Products (view only)
            PERMISSIONS.PRODUCTS_VIEW,
            // Inventory (view only)
            PERMISSIONS.INVENTORY_VIEW,
            // Orders (view, status_update)
            PERMISSIONS.ORDERS_VIEW,
            PERMISSIONS.ORDERS_STATUS_UPDATE,
        ],
        color: '#16a34a', // Green
        priority: 5
    },
    VIEWER: {
        name: 'Viewer',
        description: 'Read-only access to reports and data',
        permissions: [
            PERMISSIONS.PRODUCTS_VIEW,
            PERMISSIONS.INVENTORY_VIEW,
            PERMISSIONS.ORDERS_VIEW,
        ],
        color: '#64748b', // Gray
        priority: 6
    }
};

// Feature-based access control
export const FEATURES = {
    DASHBOARD: {
        name: 'Dashboard',
        requiredPermissions: [PERMISSIONS.DASHBOARD_VIEW],
        route: '/dashboard',
        icon: 'LayoutDashboard'
    },
    INVENTORY: {
        name: 'Inventory',
        requiredPermissions: [PERMISSIONS.INVENTORY_VIEW],
        route: '/inventory',
        icon: 'Package'
    },
    ORDERS: {
        name: 'Orders',
        requiredPermissions: [PERMISSIONS.ORDERS_VIEW],
        route: '/order',
        icon: 'Truck'
    },
    TRACKING: {
        name: 'Tracking',
        requiredPermissions: [PERMISSIONS.TRACKING_VIEW],
        route: '/tracking',
        icon: 'MapPin'
    },
    MESSAGES: {
        name: 'Messages',
        requiredPermissions: [PERMISSIONS.MESSAGES_VIEW],
        route: '/messages',
        icon: 'MessageSquare'
    }
};

export function PermissionsProvider({ children }) {
    const { user, apiAvailable } = useAuth();
    const [userPermissions, setUserPermissions] = useState([]);
    const [userRole, setUserRole] = useState(null);
    const [roles, setRoles] = useState(ROLES);
    const [permissions, setPermissions] = useState(PERMISSIONS);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user && user.role) {
            loadUserPermissions();
        } else {
            setUserRole(null);
            setUserPermissions([]);
        }
    }, [user, apiAvailable]);

    const loadUserPermissions = async () => {
        if (!user) return;
        
        setLoading(true);
        try {
            // FIRST: Try to use permissions from login response
            if (user.permissions && Array.isArray(user.permissions)) {
                setUserPermissions(user.permissions);
                
                // Set role info
                const roleKey = user.role?.toUpperCase();
                const role = ROLES[roleKey];
                if (role) {
                    setUserRole({
                        ...role,
                        permissions: user.permissions // Use actual permissions, not hardcoded
                    });
                } else {
                    setUserRole({
                        name: user.role || 'User',
                        description: 'User role',
                        permissions: user.permissions,
                        color: '#64748b',
                        priority: 999
                    });
                }
                setLoading(false);
                return;
            }
            
            // SECOND: Try API if login response doesn't have permissions
            if (apiAvailable) {
                try {
                    const [rolesData, permissionsData] = await Promise.all([
                        PermissionsAPI.getRoles(),
                        PermissionsAPI.getPermissions()
                    ]);
                    
                    // Update roles and permissions from API
                    if (rolesData) setRoles(rolesData);
                    if (permissionsData) setPermissions(permissionsData);
                    
                    // Get user's role permissions from API
                    const userRoleData = rolesData?.find(r => r.name === user.role);
                    if (userRoleData) {
                        const rolePermissions = await PermissionsAPI.getRolePermissions(userRoleData.id);
                        const permissionNames = rolePermissions?.map(p => p.name) || [];
                        setUserRole(userRoleData);
                        setUserPermissions(permissionNames);
                    } else {
                        // No role found in API, use empty permissions
                        setUserPermissions([]);
                        setUserRole(null);
                    }
                } catch (apiError) {
                    console.warn('Failed to load permissions from API:', apiError);
                    // Don't fall back to hardcoded roles - use empty permissions
                    setUserPermissions([]);
                    setUserRole(null);
                }
            } else {
                // API not available, use empty permissions (don't assume permissions)
                setUserPermissions([]);
                setUserRole(null);
            }
        } catch (error) {
            console.error('Error loading permissions:', error);
            // Don't fall back to hardcoded roles - use empty permissions
            setUserPermissions([]);
            setUserRole(null);
        } finally {
            setLoading(false);
        }
    };

    const loadLocalPermissions = () => {
        // Use permissions from login response instead of hardcoded fallback
        if (user && user.permissions) {
            // Use actual permissions from login response
            setUserPermissions(user.permissions);
            
            // Set role info if available
            const roleKey = user.role?.toUpperCase();
            const role = ROLES[roleKey];
            if (role) {
                setUserRole({
                    ...role,
                    permissions: user.permissions // Use actual permissions, not hardcoded ones
                });
            } else {
                // Create role object with actual permissions
                setUserRole({
                    name: user.role || 'User',
                    description: 'User role',
                    permissions: user.permissions,
                    color: '#64748b',
                    priority: 999
                });
            }
        } else {
            // No permissions available - set empty
            setUserRole(null);
            setUserPermissions([]);
        }
    };

    const hasPermission = (permission) => {
        // If no user is logged in, deny all permissions
        if (!user) {
            return false;
        }
        
        // If userPermissions is not an array or is empty, deny all permissions
        if (!Array.isArray(userPermissions) || userPermissions.length === 0) {
            return false;
        }
        
        // Check if user has the specific permission
        return userPermissions.includes(permission);
    };

    const hasAnyPermission = (permissions) => {
        if (!user || !userPermissions.length) return false;
        return permissions.some(permission => userPermissions.includes(permission));
    };

    const hasAllPermissions = (permissions) => {
        if (!user || !userPermissions.length) return false;
        return permissions.every(permission => userPermissions.includes(permission));
    };

    const canAccessFeature = (featureKey) => {
        const feature = FEATURES[featureKey];
        if (!feature) return false;
        return hasAnyPermission(feature.requiredPermissions);
    };

    const getAccessibleFeatures = () => {
        return Object.entries(FEATURES).filter(([key, feature]) => 
            canAccessFeature(key)
        ).map(([key, feature]) => ({ key, ...feature }));
    };

    const getRoleColor = () => {
        return userRole?.color || '#64748b';
    };

    const getRolePriority = () => {
        return userRole?.priority || 999;
    };

    const isHigherRole = (otherRole) => {
        const currentPriority = getRolePriority();
        const otherPriority = ROLES[otherRole?.toUpperCase()]?.priority || 999;
        return currentPriority < otherPriority;
    };

    // Audit logging function
    const logAction = async (action, resource, details = {}) => {
        if (!user) return;
        
        const logEntry = {
            action,
            resource,
            details: {
                ...details,
                source: apiAvailable ? 'api' : 'local'
            }
        };
        
        try {
            if (apiAvailable) {
                // Send to API
                await PermissionsAPI.createAuditLog(logEntry);
            } else {
                // Store locally
                const fullLogEntry = {
                    timestamp: new Date().toISOString(),
                    user: user.email,
                    role: user.role,
                    ...logEntry,
                    ip: 'client-side'
                };
                
                const auditLog = JSON.parse(localStorage.getItem('auditLog') || '[]');
                auditLog.push(fullLogEntry);
                
                // Keep only last 1000 entries
                if (auditLog.length > 1000) {
                    auditLog.splice(0, auditLog.length - 1000);
                }
                
                localStorage.setItem('auditLog', JSON.stringify(auditLog));
            }
        } catch (error) {
            console.error('Failed to log action:', error);
        }
    };

    const getAuditLog = async () => {
        if (!hasPermission(PERMISSIONS.SYSTEM_AUDIT_LOG)) return [];
        
        try {
            if (apiAvailable) {
                const logs = await PermissionsAPI.getAuditLogs({ limit: 50 });
                return logs || [];
            } else {
                return JSON.parse(localStorage.getItem('auditLog') || '[]');
            }
        } catch (error) {
            console.error('Failed to get audit log:', error);
            return JSON.parse(localStorage.getItem('auditLog') || '[]');
        }
    };

    return (
        <PermissionsContext.Provider
            value={{
                userPermissions,
                userRole,
                hasPermission,
                hasAnyPermission,
                hasAllPermissions,
                canAccessFeature,
                getAccessibleFeatures,
                getRoleColor,
                getRolePriority,
                isHigherRole,
                logAction,
                getAuditLog,
                loading,
                apiAvailable,
                PERMISSIONS,
                ROLES: roles,
                FEATURES
            }}
        >
            {children}
        </PermissionsContext.Provider>
    );
}

export function usePermissions() {
    const context = useContext(PermissionsContext);
    if (!context) {
        throw new Error("usePermissions must be used within PermissionsProvider");
    }
    return context;
}

// Convenience hooks
export function useHasPermission(permission) {
    const { hasPermission } = usePermissions();
    return hasPermission(permission);
}

export function useCanAccess(featureKey) {
    const { canAccessFeature } = usePermissions();
    return canAccessFeature(featureKey);
}

export function useRole() {
    const { userRole } = usePermissions();
    return userRole;
}
