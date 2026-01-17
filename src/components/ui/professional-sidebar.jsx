"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Package,
    Package2,
    Truck,
    ChevronDown,
    Menu,
    ChevronLeft,
    ChevronRight,
    Settings,
    Box,
    LogOut,
    Plus,
    Shield,
    Bell,
    Search,
    User,
    Crown,
    Activity,
    BarChart3,
    Home,
    Zap
} from "lucide-react";
import { cva } from "class-variance-authority";
import { motion, AnimatePresence } from "framer-motion";

import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions, PERMISSIONS } from "@/contexts/PermissionsContext";

/* ================= CONTEXT ================= */

const ProfessionalSidebarContext = React.createContext(null);

function useProfessionalSidebar() {
    const context = React.useContext(ProfessionalSidebarContext);
    if (!context) {
        throw new Error("useProfessionalSidebar must be used within ProfessionalSidebarProvider");
    }
    return context;
}

/* ================= PROVIDER ================= */

const ProfessionalSidebarProvider = ({ children }) => {
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = React.useState(false);
    const [collapsed, setCollapsed] = React.useState(false);

    const toggleCollapse = () => setCollapsed((prev) => !prev);

    return (
        <ProfessionalSidebarContext.Provider value={{ isMobile, openMobile, setOpenMobile, collapsed, toggleCollapse }}>
            <div className="flex min-h-screen w-full bg-slate-50 text-slate-900">
                {children}
            </div>
        </ProfessionalSidebarContext.Provider>
    );
};

/* ================= PROFESSIONAL SIDEBAR ================= */

const ProfessionalSidebar = ({ children }) => {
    const { isMobile, openMobile, setOpenMobile, collapsed, toggleCollapse } = useProfessionalSidebar();

    if (isMobile) {
        return (
            <>
                <div className="fixed top-4 left-4 z-40 md:hidden">
                    <Button variant="ghost" size="icon" onClick={() => setOpenMobile(true)}>
                        <Menu className="h-6 w-6" />
                    </Button>
                </div>
                <Sheet open={openMobile} onOpenChange={setOpenMobile}>
                    <SheetContent side="left" className="w-80 p-0 bg-white border-r border-slate-200/60">
                        {children}
                    </SheetContent>
                </Sheet>
            </>
        );
    }

    return (
        <motion.aside
            initial={false}
            animate={{ width: collapsed ? 80 : 280 }}
            className="hidden md:flex flex-col border-r border-slate-200/60 bg-white relative shrink-0 z-30 shadow-lg"
        >
            {/* Collapse Toggle Button */}
            <button
                onClick={toggleCollapse}
                className="absolute -right-3 top-8 bg-white border border-slate-200 rounded-full p-1.5 shadow-lg hover:bg-slate-50 text-slate-600 hover:text-slate-900 z-50 transition-all duration-200"
            >
                {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            
            {children}
        </motion.aside>
    );
};

/* ================= PROFILE SECTION ================= */

const ProfileSection = () => {
    const { user } = useAuth();
    const { userRole } = usePermissions();
    const { collapsed } = useProfessionalSidebar();
    const [notificationCount] = React.useState(4); // This will come from your notification system

    if (collapsed) {
        return (
            <div className="p-4 border-b border-slate-100">
                <div className="flex flex-col items-center gap-3">
                    {/* Profile Avatar */}
                    <div className="relative">
                        <div 
                            className="h-10 w-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-md"
                            style={{ backgroundColor: userRole?.color || '#3b82f6' }}
                        >
                            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                        </div>
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    
                    {/* Notification Bell */}
                    <div className="relative">
                        <Bell size={18} className="text-slate-500 hover:text-slate-700 cursor-pointer transition-colors" />
                        {notificationCount > 0 && (
                            <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                {notificationCount > 9 ? '9+' : notificationCount}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 border-b border-slate-100">
            {/* Profile Header */}
            <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                    <div 
                        className="h-12 w-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-md"
                        style={{ backgroundColor: userRole?.color || '#3b82f6' }}
                    >
                        {user?.name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900 truncate">
                            {user?.name || 'Admin User'}
                        </h3>
                        {userRole?.name === 'super_admin' && (
                            <Crown size={14} className="text-amber-500" />
                        )}
                    </div>
                    <p className="text-sm text-slate-500 truncate">
                        {user?.email || 'admin@company.com'}
                    </p>
                </div>
                
                {/* Notification Bell */}
                <div className="relative">
                    <Bell size={20} className="text-slate-500 hover:text-slate-700 cursor-pointer transition-colors" />
                    {notificationCount > 0 && (
                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                            {notificationCount > 9 ? '9+' : notificationCount}
                        </div>
                    )}
                </div>
            </div>

            {/* Role Badge */}
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 flex-1">
                    <div 
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: userRole?.color || '#3b82f6' }}
                    ></div>
                    <span className="text-sm font-medium text-slate-700">
                        {userRole?.display_name || 'Super Administrator'}
                    </span>
                </div>
                <div className="text-xs text-slate-500">
                    {userRole?.permissions?.length || 28} perms
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Activity size={14} className="text-blue-600" />
                        <span className="text-xs font-medium text-blue-700">Active</span>
                    </div>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Zap size={14} className="text-green-600" />
                        <span className="text-xs font-medium text-green-700">Online</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ================= SEARCH BAR ================= */

const SearchBar = () => {
    const { collapsed } = useProfessionalSidebar();
    
    if (collapsed) {
        return (
            <div className="px-4 py-2">
                <div className="flex justify-center">
                    <Search size={18} className="text-slate-400" />
                </div>
            </div>
        );
    }

    return (
        <div className="px-6 py-4">
            <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
            </div>
        </div>
    );
};

/* ================= MENU COMPONENTS ================= */

const ProfessionalSidebarContent = ({ children }) => (
    <div className="flex flex-1 flex-col overflow-y-auto">{children}</div>
);

const ProfessionalSidebarMenu = ({ children }) => (
    <div className="flex flex-col gap-1 px-4 pb-4">{children}</div>
);

const sidebarMenuButtonVariants = cva(
    "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 group",
    {
        variants: {
            active: {
                true: "bg-blue-50 text-blue-700 shadow-sm border border-blue-100",
                false: "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
            },
            collapsed: {
                true: "justify-center px-2",
                false: "",
            }
        },
        defaultVariants: {
            active: false,
            collapsed: false
        }
    }
);

/* ================= ENHANCED INVENTORY MENU ================= */

const ProfessionalInventoryMenu = ({ onOpenOperation }) => {
    const pathname = usePathname();
    const { collapsed } = useProfessionalSidebar();
    const { logout } = useAuth();
    const { hasPermission, userRole } = usePermissions();

    const isInventoryRoute = pathname.startsWith("/inventory");
    const isOrdersRoute = pathname.startsWith("/order");

    // Local state for expanded submenus
    const [inventoryOpen, setInventoryOpen] = React.useState(true);
    const [ordersOpen, setOrdersOpen] = React.useState(true);
    const [operationsExpanded, setOperationsExpanded] = React.useState(false);

    // Auto-expand if active
    React.useEffect(() => {
        if (isInventoryRoute) setInventoryOpen(true);
        if (isOrdersRoute) setOrdersOpen(true);
    }, [isInventoryRoute, isOrdersRoute]);

    // Menu Item with Submenu
    const MenuItemWithSub = ({ 
        icon: Icon, 
        label, 
        isActive, 
        isOpen, 
        onToggle, 
        basePath, 
        children,
        badge 
    }) => {
        if (collapsed) {
            return (
                <div className="relative group">
                    <Link 
                        href={basePath} 
                        className={cn(sidebarMenuButtonVariants({ active: isActive, collapsed: true }))}
                    >
                        <Icon size={20} />
                        {badge && (
                            <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                {badge}
                            </div>
                        )}
                    </Link>
                    {/* Tooltip */}
                    <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-slate-900 text-white px-2 py-1 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                        {label}
                    </div>
                </div>
            );
        }

        return (
            <div className="flex flex-col gap-1">
                <div className="flex items-center">
                    <Link 
                        href={basePath} 
                        className={cn(
                            "flex-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                            isActive ? "bg-blue-50 text-blue-700 border border-blue-100" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        )}
                    >
                        <Icon size={18} />
                        <span className="flex-1">{label}</span>
                        {badge && (
                            <div className="h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                {badge}
                            </div>
                        )}
                    </Link>
                    <button
                        onClick={onToggle}
                        className="p-2 text-slate-400 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100 ml-1"
                    >
                        <ChevronDown
                            size={16}
                            className={cn("transition-transform duration-200", isOpen && "rotate-180")}
                        />
                    </button>
                </div>
                
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden ml-6 space-y-1"
                        >
                            {children}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Profile Section */}
            <ProfileSection />

            {/* Search Bar */}
            <SearchBar />

            <ProfessionalSidebarContent>
                <ProfessionalSidebarMenu>
                    
                    {/* DASHBOARD */}
                    <Link 
                        href="/dashboard" 
                        className={cn(sidebarMenuButtonVariants({ active: pathname === "/dashboard", collapsed }))}
                    >
                        <Home size={collapsed ? 20 : 18} />
                        {!collapsed && <span>Dashboard</span>}
                        {!collapsed && (
                            <div className="ml-auto">
                                <BarChart3 size={14} className="text-slate-400" />
                            </div>
                        )}
                    </Link>

                    {/* PRODUCTS */}
                    {hasPermission(PERMISSIONS.PRODUCTS_VIEW) && (
                        <Link 
                            href="/products" 
                            className={cn(sidebarMenuButtonVariants({ active: pathname === "/products", collapsed }))}
                        >
                            <Package2 size={collapsed ? 20 : 18} />
                            {!collapsed && <span>Products</span>}
                            {!collapsed && (
                                <div className="ml-auto text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                                    1.2k
                                </div>
                            )}
                        </Link>
                    )}

                    {/* INVENTORY */}
                    {hasPermission(PERMISSIONS.INVENTORY_VIEW) && (
                        <MenuItemWithSub
                            icon={Package}
                            label="Inventory"
                            isActive={isInventoryRoute}
                            isOpen={inventoryOpen}
                            onToggle={() => setInventoryOpen(!inventoryOpen)}
                            basePath="/inventory"
                        >
                            <Link 
                                href="/inventory/tracker"
                                className={cn(
                                    "block rounded-lg px-3 py-2 text-sm transition-colors",
                                    pathname === "/inventory/tracker" ? "text-blue-700 font-medium bg-blue-50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                )}
                            >
                                📊 Tracker
                            </Link>
                            <Link 
                                href="/inventory/adjustments"
                                className={cn(
                                    "block rounded-lg px-3 py-2 text-sm transition-colors",
                                    pathname === "/inventory/adjustments" ? "text-blue-700 font-medium bg-blue-50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                )}
                            >
                                ⚖️ Adjustments
                            </Link>
                        </MenuItemWithSub>
                    )}

                    {/* ORDERS */}
                    {hasPermission(PERMISSIONS.ORDERS_VIEW) && (
                        <MenuItemWithSub
                            icon={Truck}
                            label="Orders"
                            isActive={isOrdersRoute}
                            isOpen={ordersOpen}
                            onToggle={() => setOrdersOpen(!ordersOpen)}
                            basePath="/order"
                            badge={3}
                        >
                            {hasPermission(PERMISSIONS.OPERATIONS_DISPATCH) && (
                                <button 
                                    onClick={() => {
                                        if (onOpenOperation) {
                                            onOpenOperation("dispatch");
                                        }
                                    }}
                                    className={cn(
                                        "block rounded-lg px-3 py-2 text-sm transition-colors w-full text-left",
                                        "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    )}
                                >
                                    📦 Dispatch
                                </button>
                            )}
                            <Link 
                                href="/order/websiteorder"
                                className={cn(
                                    "block rounded-lg px-3 py-2 text-sm transition-colors",
                                    pathname === "/order/websiteorder" ? "text-blue-700 font-medium bg-blue-50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                )}
                            >
                                🌐 Website Orders
                            </Link>
                            <Link 
                                href="/order/store"
                                className={cn(
                                    "block rounded-lg px-3 py-2 text-sm transition-colors",
                                    pathname === "/order/store" ? "text-blue-700 font-medium bg-blue-50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                )}
                            >
                                🏪 Store
                            </Link>
                        </MenuItemWithSub>
                    )}

                    {/* OPERATIONS */}
                    {(hasPermission(PERMISSIONS.OPERATIONS_DISPATCH) || 
                      hasPermission(PERMISSIONS.OPERATIONS_DAMAGE) || 
                      hasPermission(PERMISSIONS.OPERATIONS_RETURN) || 
                      hasPermission(PERMISSIONS.OPERATIONS_BULK) ||
                      hasPermission(PERMISSIONS.OPERATIONS_SELF_TRANSFER)) && (
                        <MenuItemWithSub
                            icon={Plus}
                            label="Operations"
                            isActive={false}
                            isOpen={operationsExpanded}
                            onToggle={() => setOperationsExpanded(!operationsExpanded)}
                            basePath="#"
                        >
                            {hasPermission(PERMISSIONS.OPERATIONS_DISPATCH) && (
                                <button 
                                    onClick={() => {
                                        if (onOpenOperation) {
                                            onOpenOperation("dispatch");
                                        }
                                    }}
                                    className={cn(
                                        "block rounded-lg px-3 py-2 text-sm transition-colors w-full text-left",
                                        "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    )}
                                >
                                    📦 Dispatch
                                </button>
                            )}
                            {hasPermission(PERMISSIONS.OPERATIONS_DAMAGE) && (
                                <button 
                                    onClick={() => {
                                        if (onOpenOperation) {
                                            onOpenOperation("damage");
                                        }
                                    }}
                                    className={cn(
                                        "block rounded-lg px-3 py-2 text-sm transition-colors w-full text-left",
                                        "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    )}
                                >
                                    ⚠️ Damage
                                </button>
                            )}
                            {hasPermission(PERMISSIONS.OPERATIONS_RETURN) && (
                                <button 
                                    onClick={() => {
                                        if (onOpenOperation) {
                                            onOpenOperation("return");
                                        }
                                    }}
                                    className={cn(
                                        "block rounded-lg px-3 py-2 text-sm transition-colors w-full text-left",
                                        "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    )}
                                >
                                    🔄 Return
                                </button>
                            )}
                            {hasPermission(PERMISSIONS.OPERATIONS_BULK) && (
                                <button 
                                    onClick={() => {
                                        if (onOpenOperation) {
                                            onOpenOperation("bulk");
                                        }
                                    }}
                                    className={cn(
                                        "block rounded-lg px-3 py-2 text-sm transition-colors w-full text-left",
                                        "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    )}
                                >
                                    📤 Bulk Upload
                                </button>
                            )}
                            {hasPermission(PERMISSIONS.OPERATIONS_SELF_TRANSFER) && (
                                <button 
                                    onClick={() => {
                                        if (onOpenOperation) {
                                            onOpenOperation("transfer");
                                        }
                                    }}
                                    className={cn(
                                        "block rounded-lg px-3 py-2 text-sm transition-colors w-full text-left",
                                        "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    )}
                                >
                                    🔄 Self Transfer
                                </button>
                            )}
                        </MenuItemWithSub>
                    )}

                    {/* PERMISSIONS & USER MANAGEMENT */}
                    {(hasPermission(PERMISSIONS.SYSTEM_USER_MANAGEMENT) || 
                      hasPermission(PERMISSIONS.SYSTEM_ROLE_MANAGEMENT) || 
                      hasPermission(PERMISSIONS.SYSTEM_AUDIT_LOG)) && (
                        <Link 
                            href="/permissions" 
                            className={cn(sidebarMenuButtonVariants({ active: pathname === "/permissions", collapsed }))}
                        >
                            <Shield size={collapsed ? 20 : 18} />
                            {!collapsed && <span>Permissions</span>}
                            {!collapsed && (
                                <div className="ml-auto">
                                    <Crown size={14} className="text-amber-500" />
                                </div>
                            )}
                        </Link>
                    )}

                </ProfessionalSidebarMenu>
            </ProfessionalSidebarContent>

            {/* FOOTER */}
            <div className={cn("p-4 border-t border-slate-100 bg-slate-50/50", collapsed && "flex flex-col gap-2 items-center")}>
                {!collapsed ? (
                    <div className="space-y-3">
                        {/* Settings */}
                        {hasPermission(PERMISSIONS.SYSTEM_SETTINGS) && (
                            <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-colors cursor-pointer group">
                                <div className="h-8 w-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 group-hover:bg-slate-300 transition-colors">
                                    <Settings size={16} />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-slate-900">Settings</div>
                                    <div className="text-xs text-slate-500">System configuration</div>
                                </div>
                            </div>
                        )}
                        
                        {/* Logout */}
                        <button 
                            onClick={logout}
                            className="flex items-center gap-3 w-full p-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors group"
                        >
                            <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                <LogOut size={16} />
                            </div>
                            <div className="text-sm font-medium">Sign out</div>
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Collapsed Settings */}
                        {hasPermission(PERMISSIONS.SYSTEM_SETTINGS) && (
                            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer">
                                <Settings size={18} />
                            </div>
                        )}
                        
                        {/* Collapsed Logout */}
                        <button 
                            onClick={logout}
                            className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 hover:bg-red-200 transition-colors"
                        >
                            <LogOut size={18} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

/* ================= EXPORTS ================= */

export {
    ProfessionalSidebar,
    ProfessionalSidebarProvider,
    ProfessionalSidebarContent,
    ProfessionalInventoryMenu 
};