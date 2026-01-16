"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/utils/api";
import styles from "./permissions.module.css";

export default function PermissionsPage() {
    const { user, hasPermission } = useAuth();
    const [activeTab, setActiveTab] = useState("users");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    
    // Users state
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    
    // Roles state
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    
    // Permissions state
    const [permissions, setPermissions] = useState([]);
    const [rolePermissions, setRolePermissions] = useState({});
    
    // Audit logs state
    const [auditLogs, setAuditLogs] = useState([]);

    // Check permissions
    const canManageUsers = hasPermission('SYSTEM_USER_MANAGEMENT');
    const canManageRoles = hasPermission('SYSTEM_ROLE_MANAGEMENT');
    const canViewAudit = hasPermission('SYSTEM_AUDIT_LOG');

    useEffect(() => {
        if (!canManageUsers && !canManageRoles && !canViewAudit) {
            setError("You don't have permission to access this page");
            return;
        }
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [usersRes, rolesRes, permissionsRes] = await Promise.all([
                canManageUsers ? api.getUsers() : Promise.resolve({ data: [] }),
                api.getRoles(),
                api.getPermissions()
            ]);
            
            setUsers(usersRes.data || []);
            setRoles(rolesRes.data || []);
            setPermissions(permissionsRes.data?.permissions || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadAuditLogs = async () => {
        if (!canViewAudit) return;
        try {
            const response = await api.getAuditLogs({ limit: 50 });
            setAuditLogs(response.data?.logs || []);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCreateUser = async (userData) => {
        try {
            await api.createUser(userData);
            await loadInitialData();
            setShowUserModal(false);
            setSelectedUser(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdateUser = async (userData) => {
        try {
            await api.updateUser(selectedUser.id, userData);
            await loadInitialData();
            setShowUserModal(false);
            setSelectedUser(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            await api.deleteUser(userId);
            await loadInitialData();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCreateRole = async (roleData) => {
        try {
            await api.createRole(roleData);
            await loadInitialData();
            setShowRoleModal(false);
            setSelectedRole(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdateRole = async (roleData) => {
        try {
            await api.updateRole(selectedRole.id, roleData);
            await loadInitialData();
            setShowRoleModal(false);
            setSelectedRole(null);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteRole = async (roleId) => {
        if (!confirm("Are you sure you want to delete this role?")) return;
        try {
            await api.deleteRole(roleId);
            await loadInitialData();
        } catch (err) {
            setError(err.message);
        }
    };

    if (error && !canManageUsers && !canManageRoles && !canViewAudit) {
        return (
            <div className={styles.container}>
                <div className={styles.errorCard}>
                    <div className={styles.errorIcon}>🔒</div>
                    <h2>Access Denied</h2>
                    <p>You don't have permission to access the permissions management page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>Permissions Management</h1>
                    <p className={styles.subtitle}>Manage users, roles, and system permissions</p>
                </div>
            </div>

            {error && (
                <div className={styles.errorMessage}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>{error}</span>
                    <button onClick={() => setError("")} className={styles.errorClose}>×</button>
                </div>
            )}

            <div className={styles.tabsContainer}>
                <div className={styles.tabs}>
                    {canManageUsers && (
                        <button
                            className={`${styles.tab} ${activeTab === "users" ? styles.active : ""}`}
                            onClick={() => setActiveTab("users")}
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                            Users
                        </button>
                    )}
                    {canManageRoles && (
                        <button
                            className={`${styles.tab} ${activeTab === "roles" ? styles.active : ""}`}
                            onClick={() => setActiveTab("roles")}
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
                            </svg>
                            Roles
                        </button>
                    )}
                    <button
                        className={`${styles.tab} ${activeTab === "permissions" ? styles.active : ""}`}
                        onClick={() => setActiveTab("permissions")}
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        Permissions
                    </button>
                    {canViewAudit && (
                        <button
                            className={`${styles.tab} ${activeTab === "audit" ? styles.active : ""}`}
                            onClick={() => {
                                setActiveTab("audit");
                                loadAuditLogs();
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Audit Logs
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.content}>
                {activeTab === "users" && canManageUsers && (
                    <UsersTab
                        users={users}
                        roles={roles}
                        onCreateUser={() => {
                            setSelectedUser(null);
                            setShowUserModal(true);
                        }}
                        onEditUser={(user) => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                        }}
                        onDeleteUser={handleDeleteUser}
                        loading={loading}
                    />
                )}

                {activeTab === "roles" && canManageRoles && (
                    <RolesTab
                        roles={roles}
                        permissions={permissions}
                        onCreateRole={() => {
                            setSelectedRole(null);
                            setShowRoleModal(true);
                        }}
                        onEditRole={(role) => {
                            setSelectedRole(role);
                            setShowRoleModal(true);
                        }}
                        onDeleteRole={handleDeleteRole}
                        loading={loading}
                    />
                )}

                {activeTab === "permissions" && (
                    <PermissionsTab permissions={permissions} loading={loading} />
                )}

                {activeTab === "audit" && canViewAudit && (
                    <AuditTab auditLogs={auditLogs} loading={loading} />
                )}
            </div>

            {/* User Modal */}
            {showUserModal && (
                <UserModal
                    user={selectedUser}
                    roles={roles}
                    onSave={selectedUser ? handleUpdateUser : handleCreateUser}
                    onClose={() => {
                        setShowUserModal(false);
                        setSelectedUser(null);
                    }}
                />
            )}

            {/* Role Modal */}
            {showRoleModal && (
                <RoleModal
                    role={selectedRole}
                    permissions={permissions}
                    onSave={selectedRole ? handleUpdateRole : handleCreateRole}
                    onClose={() => {
                        setShowRoleModal(false);
                        setSelectedRole(null);
                    }}
                />
            )}
        </div>
    );
}

// Users Tab Component
function UsersTab({ users, roles, onCreateUser, onEditUser, onDeleteUser, loading }) {
    if (loading) {
        return <div className={styles.loading}>Loading users...</div>;
    }

    return (
        <div className={styles.tabContent}>
            <div className={styles.tabHeader}>
                <h2>Users Management</h2>
                <button className={styles.primaryButton} onClick={onCreateUser}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add User
                </button>
            </div>

            <div className={styles.tableContainer}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Last Login</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>
                                    <div className={styles.userInfo}>
                                        <div className={styles.avatar}>
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span>{user.name}</span>
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`${styles.badge} ${styles[user.role_name]}`}>
                                        {user.role_display_name || user.role_name}
                                    </span>
                                </td>
                                <td>
                                    <span className={`${styles.status} ${user.is_active ? styles.active : styles.inactive}`}>
                                        {user.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td>{user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</td>
                                <td>
                                    <div className={styles.actions}>
                                        <button
                                            className={styles.editButton}
                                            onClick={() => onEditUser(user)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className={styles.deleteButton}
                                            onClick={() => onDeleteUser(user.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Roles Tab Component
function RolesTab({ roles, permissions, onCreateRole, onEditRole, onDeleteRole, loading }) {
    if (loading) {
        return <div className={styles.loading}>Loading roles...</div>;
    }

    return (
        <div className={styles.tabContent}>
            <div className={styles.tabHeader}>
                <h2>Roles Management</h2>
                <button className={styles.primaryButton} onClick={onCreateRole}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Role
                </button>
            </div>

            <div className={styles.rolesGrid}>
                {roles.map((role) => (
                    <div key={role.id} className={styles.roleCard}>
                        <div className={styles.roleHeader}>
                            <div className={styles.roleIcon} style={{ backgroundColor: role.color || '#6366f1' }}>
                                {role.display_name?.charAt(0) || role.name?.charAt(0)}
                            </div>
                            <div className={styles.roleInfo}>
                                <h3>{role.display_name || role.name}</h3>
                                <p>{role.description || 'No description'}</p>
                            </div>
                        </div>
                        <div className={styles.roleStats}>
                            <div className={styles.stat}>
                                <span className={styles.statNumber}>{role.user_count || 0}</span>
                                <span className={styles.statLabel}>Users</span>
                            </div>
                            <div className={styles.stat}>
                                <span className={styles.statNumber}>{role.permission_count || 0}</span>
                                <span className={styles.statLabel}>Permissions</span>
                            </div>
                        </div>
                        <div className={styles.roleActions}>
                            <button
                                className={styles.editButton}
                                onClick={() => onEditRole(role)}
                            >
                                Edit
                            </button>
                            <button
                                className={styles.deleteButton}
                                onClick={() => onDeleteRole(role.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Permissions Tab Component
function PermissionsTab({ permissions, loading }) {
    if (loading) {
        return <div className={styles.loading}>Loading permissions...</div>;
    }

    // Group permissions by category
    const groupedPermissions = permissions.reduce((acc, permission) => {
        const category = permission.category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(permission);
        return acc;
    }, {});

    return (
        <div className={styles.tabContent}>
            <div className={styles.tabHeader}>
                <h2>System Permissions</h2>
                <div className={styles.permissionStats}>
                    <span>{permissions.length} total permissions</span>
                    <span>{Object.keys(groupedPermissions).length} categories</span>
                </div>
            </div>

            <div className={styles.permissionsContainer}>
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                    <div key={category} className={styles.permissionCategory}>
                        <h3 className={styles.categoryTitle}>{category}</h3>
                        <div className={styles.permissionsList}>
                            {perms.map((permission) => (
                                <div key={permission.id} className={styles.permissionItem}>
                                    <div className={styles.permissionInfo}>
                                        <span className={styles.permissionName}>{permission.display_name}</span>
                                        <span className={styles.permissionCode}>{permission.name}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Audit Tab Component
function AuditTab({ auditLogs, loading }) {
    if (loading) {
        return <div className={styles.loading}>Loading audit logs...</div>;
    }

    return (
        <div className={styles.tabContent}>
            <div className={styles.tabHeader}>
                <h2>Audit Logs</h2>
                <div className={styles.auditStats}>
                    <span>{auditLogs.length} recent activities</span>
                </div>
            </div>

            <div className={styles.auditContainer}>
                {auditLogs.map((log, index) => (
                    <div key={index} className={styles.auditItem}>
                        <div className={styles.auditIcon}>
                            {getAuditIcon(log.action)}
                        </div>
                        <div className={styles.auditContent}>
                            <div className={styles.auditHeader}>
                                <span className={styles.auditUser}>{log.user_name || log.user_email}</span>
                                <span className={styles.auditAction}>{log.action}</span>
                                <span className={styles.auditTime}>
                                    {new Date(log.created_at).toLocaleString()}
                                </span>
                            </div>
                            <div className={styles.auditDetails}>
                                {log.resource && <span>Resource: {log.resource}</span>}
                                {log.resource_id && <span>ID: {log.resource_id}</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// User Modal Component
function UserModal({ user, roles, onSave, onClose }) {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        password: '',
        role_id: user?.role_id || '',
        is_active: user?.is_active ?? true
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{user ? 'Edit User' : 'Create User'}</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formGroup}>
                        <label>Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Password {user && '(leave blank to keep current)'}</label>
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required={!user}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Role</label>
                        <select
                            value={formData.role_id}
                            onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                            required
                        >
                            <option value="">Select a role</option>
                            {roles.map((role) => (
                                <option key={role.id} value={role.id}>
                                    {role.display_name || role.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className={styles.formGroup}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            />
                            Active
                        </label>
                    </div>
                    <div className={styles.modalActions}>
                        <button type="button" className={styles.secondaryButton} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.primaryButton}>
                            {user ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Role Modal Component
function RoleModal({ role, permissions, onSave, onClose }) {
    const [formData, setFormData] = useState({
        name: role?.name || '',
        display_name: role?.display_name || '',
        description: role?.description || '',
        color: role?.color || '#6366f1',
        permissionIds: role?.permissions?.map(p => p.id) || []
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const togglePermission = (permissionId) => {
        const newPermissionIds = formData.permissionIds.includes(permissionId)
            ? formData.permissionIds.filter(id => id !== permissionId)
            : [...formData.permissionIds, permissionId];
        
        setFormData({ ...formData, permissionIds: newPermissionIds });
    };

    // Group permissions by category
    const groupedPermissions = permissions.reduce((acc, permission) => {
        const category = permission.category || 'Other';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(permission);
        return acc;
    }, {});

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2>{role ? 'Edit Role' : 'Create Role'}</h2>
                    <button className={styles.closeButton} onClick={onClose}>×</button>
                </div>
                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label>Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label>Display Name</label>
                            <input
                                type="text"
                                value={formData.display_name}
                                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div className={styles.formGroup}>
                        <label>Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Color</label>
                        <input
                            type="color"
                            value={formData.color}
                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        />
                    </div>
                    <div className={styles.formGroup}>
                        <label>Permissions</label>
                        <div className={styles.permissionsSelector}>
                            {Object.entries(groupedPermissions).map(([category, perms]) => (
                                <div key={category} className={styles.permissionCategory}>
                                    <h4>{category}</h4>
                                    <div className={styles.permissionCheckboxes}>
                                        {perms.map((permission) => (
                                            <label key={permission.id} className={styles.permissionCheckbox}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.permissionIds.includes(permission.id)}
                                                    onChange={() => togglePermission(permission.id)}
                                                />
                                                <span>{permission.display_name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={styles.modalActions}>
                        <button type="button" className={styles.secondaryButton} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className={styles.primaryButton}>
                            {role ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// Helper function for audit icons
function getAuditIcon(action) {
    switch (action) {
        case 'LOGIN':
            return '🔑';
        case 'LOGOUT':
            return '🚪';
        case 'CREATE':
            return '➕';
        case 'UPDATE':
            return '✏️';
        case 'DELETE':
            return '🗑️';
        default:
            return '📝';
    }
}