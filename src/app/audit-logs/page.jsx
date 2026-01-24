'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, User, Activity, MapPin, Clock, Filter, Search, RefreshCw } from 'lucide-react';

// Simple Badge component
const Badge = ({ children, className = '', variant = 'default' }) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
    const variantClasses = {
        default: 'bg-gray-100 text-gray-800',
        outline: 'border border-gray-300 text-gray-700',
        secondary: 'bg-blue-100 text-blue-800'
    };
    
    return (
        <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
            {children}
        </span>
    );
};

// Simple Select component
const Select = ({ value, onValueChange, children, placeholder }) => {
    return (
        <select 
            value={value} 
            onChange={(e) => onValueChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            <option value="">{placeholder}</option>
            {children}
        </select>
    );
};

const SelectItem = ({ value, children }) => {
    return <option value={value}>{children}</option>;
};

export default function AuditLogsPage() {
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [refreshInterval, setRefreshInterval] = useState(30); // seconds
    const [lastRefresh, setLastRefresh] = useState(null);
    const [filters, setFilters] = useState({
        action: '',
        resource: '',
        userId: '',
        search: '',
        page: 1,
        limit: 50
    });

    const fetchAuditLogs = async (showLoading = true) => {
        try {
            if (showLoading) setLoading(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError('No authentication token found');
                return;
            }

            const queryParams = new URLSearchParams();
            if (filters.action) queryParams.append('action', filters.action);
            if (filters.resource) queryParams.append('resource', filters.resource);
            if (filters.userId) queryParams.append('userId', filters.userId);
            if (filters.search) queryParams.append('search', filters.search);
            queryParams.append('page', filters.page.toString());
            queryParams.append('limit', filters.limit.toString());

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/audit-logs?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                // Handle different response formats
                const logs = data.data?.logs || data.data || [];
                setAuditLogs(logs);
                setError(null);
                setLastRefresh(new Date());
            } else {
                setError(data.message || 'Failed to fetch audit logs');
            }
        } catch (err) {
            console.error('Error fetching audit logs:', err);
            setError(err.message || 'Failed to fetch audit logs');
        } finally {
            if (showLoading) setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuditLogs();
    }, [filters]);

    // Auto-refresh effect
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            fetchAuditLogs(false); // Don't show loading spinner for auto-refresh
        }, refreshInterval * 1000);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, filters]);

    const getActionBadgeColor = (action) => {
        switch (action) {
            case 'LOGIN': return 'bg-green-100 text-green-800';
            case 'LOGOUT': return 'bg-gray-100 text-gray-800';
            case 'CREATE': return 'bg-blue-100 text-blue-800';
            case 'UPDATE': return 'bg-yellow-100 text-yellow-800';
            case 'DELETE': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getResourceIcon = (resource) => {
        switch (resource) {
            case 'SESSION': return <User className="w-4 h-4" />;
            case 'DISPATCH': return <Activity className="w-4 h-4" />;
            case 'USER': return <User className="w-4 h-4" />;
            case 'ROLE': return <User className="w-4 h-4" />;
            default: return <Activity className="w-4 h-4" />;
        }
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString();
    };

    const parseDetails = (details) => {
        try {
            return typeof details === 'string' ? JSON.parse(details) : details;
        } catch {
            return details;
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: 1 // Reset to first page when filtering
        }));
    };

    const clearFilters = () => {
        setFilters({
            action: '',
            resource: '',
            userId: '',
            search: '',
            page: 1,
            limit: 50
        });
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-center h-64">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="ml-2 text-lg">Loading audit logs...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Card className="border-red-200">
                    <CardContent className="p-6">
                        <div className="text-center text-red-600">
                            <Activity className="w-12 h-12 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">Error Loading Audit Logs</h3>
                            <p className="text-sm">{error}</p>
                            <Button onClick={fetchAuditLogs} className="mt-4">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Retry
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
                    <p className="text-gray-600 mt-1">Complete user journey and system activity tracking</p>
                </div>
                <div className="flex items-center space-x-3">
                    {/* Auto-refresh controls */}
                    <div className="flex items-center space-x-2 text-sm">
                        <label className="flex items-center space-x-1">
                            <input
                                type="checkbox"
                                checked={autoRefresh}
                                onChange={(e) => setAutoRefresh(e.target.checked)}
                                className="rounded"
                            />
                            <span>Auto-refresh</span>
                        </label>
                        {autoRefresh && (
                            <select
                                value={refreshInterval}
                                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                                className="px-2 py-1 border border-gray-300 rounded text-xs"
                            >
                                <option value={10}>10s</option>
                                <option value={30}>30s</option>
                                <option value={60}>1m</option>
                                <option value={300}>5m</option>
                            </select>
                        )}
                        {lastRefresh && (
                            <span className="text-gray-500 text-xs">
                                Last: {lastRefresh.toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                    <Button onClick={() => fetchAuditLogs()} variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Filter className="w-5 h-5 mr-2" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Action</label>
                            <Select value={filters.action} onValueChange={(value) => handleFilterChange('action', value)} placeholder="All Actions">
                                <SelectItem value="">All Actions</SelectItem>
                                <SelectItem value="LOGIN">Login</SelectItem>
                                <SelectItem value="LOGOUT">Logout</SelectItem>
                                <SelectItem value="CREATE">Create</SelectItem>
                                <SelectItem value="UPDATE">Update</SelectItem>
                                <SelectItem value="DELETE">Delete</SelectItem>
                            </Select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">Resource</label>
                            <Select value={filters.resource} onValueChange={(value) => handleFilterChange('resource', value)} placeholder="All Resources">
                                <SelectItem value="">All Resources</SelectItem>
                                <SelectItem value="SESSION">Session</SelectItem>
                                <SelectItem value="DISPATCH">Dispatch</SelectItem>
                                <SelectItem value="USER">User</SelectItem>
                                <SelectItem value="ROLE">Role</SelectItem>
                            </Select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">User ID</label>
                            <Input
                                placeholder="Filter by user ID"
                                value={filters.userId}
                                onChange={(e) => handleFilterChange('userId', e.target.value)}
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium mb-2">Search</label>
                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                                <Input
                                    placeholder="Search details..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end mt-4">
                        <Button variant="outline" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Audit Logs */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center">
                            <Activity className="w-5 h-5 mr-2" />
                            Audit Trail ({auditLogs.length} entries)
                            {autoRefresh && (
                                <span className="ml-3 flex items-center text-sm text-green-600">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                                    Live
                                </span>
                            )}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {auditLogs.length === 0 ? (
                        <div className="text-center py-12">
                            <Activity className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Audit Logs Found</h3>
                            <p className="text-gray-500">No audit entries match your current filters.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {auditLogs.map((log) => {
                                const details = parseDetails(log.details);
                                
                                return (
                                    <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-shrink-0 mt-1">
                                                    {getResourceIcon(log.resource)}
                                                </div>
                                                
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <Badge className={getActionBadgeColor(log.action)}>
                                                            {log.action}
                                                        </Badge>
                                                        <Badge variant="outline">
                                                            {log.resource}
                                                        </Badge>
                                                        {log.resource_id && (
                                                            <Badge variant="secondary">
                                                                ID: {log.resource_id}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                        <div className="flex items-center text-gray-600">
                                                            <User className="w-4 h-4 mr-1" />
                                                            <span>
                                                                User: {log.user_name || log.user_id || 'System'}
                                                                {log.user_email && (
                                                                    <span className="text-xs text-gray-500 ml-1">({log.user_email})</span>
                                                                )}
                                                            </span>
                                                        </div>
                                                        
                                                        <div className="flex items-center text-gray-600">
                                                            <MapPin className="w-4 h-4 mr-1" />
                                                            <span>IP: {log.ip_address || 'Unknown'}</span>
                                                        </div>
                                                        
                                                        <div className="flex items-center text-gray-600">
                                                            <Clock className="w-4 h-4 mr-1" />
                                                            <span>{formatTimestamp(log.created_at)}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {details && Object.keys(details).length > 0 && (
                                                        <div className="mt-3 p-3 bg-gray-100 rounded text-sm">
                                                            <div className="font-medium text-gray-700 mb-2">Details:</div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                {Object.entries(details).map(([key, value]) => (
                                                                    <div key={key} className="flex">
                                                                        <span className="font-medium text-gray-600 mr-2">{key}:</span>
                                                                        <span className="text-gray-800 break-all">
                                                                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}