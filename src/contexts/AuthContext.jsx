"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { api, getToken, getUser, clearAuth } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in from localStorage
        const storedUser = getUser();
        const token = getToken();
        
        if (storedUser && token) {
            setUser(storedUser);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await api.login({ email, password });
            
            if (response.success && response.token) {
                // Store JWT token and user data
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                
                setUser(response.user);
                return { success: true, user: response.user };
            } else {
                return { success: false, error: response.message || "Invalid credentials" };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: "Network error. Please try again." };
        }
    };

    const logout = async () => {
        try {
            // Call logout API if user is logged in
            if (user) {
                try {
                    await api.logout();
                } catch (apiError) {
                    console.warn('API logout failed:', apiError);
                }
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage and state
            clearAuth();
            setUser(null);
        }
    };

    const hasPermission = (permission) => {
        if (!user || !user.permissions) return false;
        
        // Super admin has all permissions
        if (user.role === "super_admin") return true;
        
        // Check if user has specific permission
        return user.permissions.includes(permission);
    };

    const hasRole = (role) => {
        if (!user) return false;
        return user.role === role;
    };

    const isAuthenticated = () => {
        return !!user && !!getToken();
    };

    return (
        <AuthContext.Provider
            value={{ 
                user, 
                login, 
                logout, 
                loading, 
                hasPermission,
                hasRole,
                isAuthenticated
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}

