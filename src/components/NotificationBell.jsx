/**
 * NOTIFICATION BELL COMPONENT
 * Shows real-time notifications with unread count in top navbar
 */

'use client';

import { useState, useEffect } from 'react';
import { Bell, X, Check, MapPin } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const NotificationBell = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch notifications from your backend
    const fetchNotifications = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token || !user) return;

            const response = await fetch('/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setNotifications(data.data.notifications || []);
                    setUnreadCount(data.data.unreadCount || 0);
                }
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    // Mark notification as read
    const markAsRead = async (notificationId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Update local state
                setNotifications(prev => 
                    prev.map(notif => 
                        notif.id === notificationId 
                            ? { ...notif, is_read: 1 }
                            : notif
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('/api/notifications/mark-all-read', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setNotifications(prev => 
                    prev.map(notif => ({ ...notif, is_read: 1 }))
                );
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        } finally {
            setLoading(false);
        }
    };

    // Format time ago
    const timeAgo = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return `${Math.floor(diffInSeconds / 86400)}d ago`;
    };

    // Get notification icon based on type
    const getNotificationIcon = (type) => {
        const icons = {
            'user_login': '👤',
            'dispatch': '📦',
            'return': '↩️',
            'damage': '⚠️',
            'product': '🏷️',
            'inventory': '📊',
            'system': '🔔'
        };
        return icons[type] || '🔔';
    };

    // Get notification color based on type
    const getNotificationColor = (type) => {
        const colors = {
            'user_login': 'bg-blue-50 border-l-blue-500',
            'dispatch': 'bg-green-50 border-l-green-500',
            'return': 'bg-orange-50 border-l-orange-500',
            'damage': 'bg-red-50 border-l-red-500',
            'product': 'bg-purple-50 border-l-purple-500',
            'inventory': 'bg-indigo-50 border-l-indigo-500',
            'system': 'bg-gray-50 border-l-gray-500'
        };
        return colors[type] || 'bg-gray-50 border-l-gray-500';
    };

    // Parse location from notification data
    const getLocationInfo = (notification) => {
        try {
            const data = typeof notification.data === 'string' 
                ? JSON.parse(notification.data) 
                : notification.data;
            return data?.location || null;
        } catch {
            return null;
        }
    };

    // Fetch notifications on component mount and set up polling
    useEffect(() => {
        if (user) {
            fetchNotifications();
            
            // Set up polling for new notifications every 30 seconds
            const interval = setInterval(fetchNotifications, 30000);
            
            return () => clearInterval(interval);
        }
    }, [user]);

    return (
        <div className="relative">
            {/* Notification Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                title={`${unreadCount} unread notifications`}
            >
                <Bell size={18} className={unreadCount > 0 ? 'animate-pulse' : ''} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification Dropdown */}
            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div>
                            <h3 className="font-semibold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <p className="text-sm text-gray-600">{unreadCount} unread</p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    disabled={loading}
                                    className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 flex items-center gap-1 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors"
                                    title="Mark all as read"
                                >
                                    <Check size={14} />
                                    <span>Mark all read</span>
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <Bell size={32} className="mx-auto mb-3 opacity-50" />
                                <p className="font-medium">No notifications yet</p>
                                <p className="text-sm mt-1">You'll see login alerts, dispatch updates, and more here</p>
                            </div>
                        ) : (
                            notifications.map((notification) => {
                                const location = getLocationInfo(notification);
                                const isUnread = !notification.is_read;
                                
                                return (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                                            isUnread ? `${getNotificationColor(notification.type)} border-l-4` : ''
                                        }`}
                                        onClick={() => isUnread && markAsRead(notification.id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-xl flex-shrink-0 mt-0.5">
                                                {getNotificationIcon(notification.type)}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${isUnread ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-gray-500">
                                                        {timeAgo(notification.created_at)}
                                                    </span>
                                                    {location && (
                                                        <div className="flex items-center gap-1 text-xs text-gray-500">
                                                            <MapPin size={12} />
                                                            <span>{location}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {isUnread && (
                                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 bg-gray-50">
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    // Navigate to full notifications page
                                    window.location.href = '/notifications';
                                }}
                                className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                                View All Notifications
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default NotificationBell;