"use client";

import React from 'react';
import { 
    BarChart3, 
    TrendingUp, 
    Package, 
    Users, 
    DollarSign,
    Activity,
    Bell,
    Calendar,
    Clock,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';

export default function DashboardPage() {
    const stats = [
        {
            title: "Total Products",
            value: "1,234",
            change: "+12%",
            trend: "up",
            icon: Package,
            color: "blue"
        },
        {
            title: "Active Orders",
            value: "89",
            change: "+5%",
            trend: "up",
            icon: Activity,
            color: "green"
        },
        {
            title: "Revenue",
            value: "$45,678",
            change: "-2%",
            trend: "down",
            icon: DollarSign,
            color: "purple"
        },
        {
            title: "Users",
            value: "156",
            change: "+8%",
            trend: "up",
            icon: Users,
            color: "orange"
        }
    ];

    const recentActivity = [
        {
            id: 1,
            action: "New product added",
            user: "Admin User",
            time: "2 minutes ago",
            type: "create"
        },
        {
            id: 2,
            action: "Order dispatched",
            user: "System",
            time: "5 minutes ago",
            type: "dispatch"
        },
        {
            id: 3,
            action: "Inventory updated",
            user: "Admin User",
            time: "10 minutes ago",
            type: "update"
        },
        {
            id: 4,
            action: "User logged in",
            user: "Admin User",
            time: "15 minutes ago",
            type: "login"
        }
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-600 mt-1">Welcome back! Here's what's happening with your inventory.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                        <Calendar size={16} />
                        <span className="text-sm">Last 30 days</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Bell size={16} />
                        <span className="text-sm">View Notifications</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                                    <Icon size={24} className={`text-${stat.color}-600`} />
                                </div>
                                <div className={`flex items-center gap-1 text-sm ${
                                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    {stat.trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                    {stat.change}
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-900 mb-1">{stat.value}</div>
                                <div className="text-sm text-slate-600">{stat.title}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart Area */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-slate-900">Inventory Overview</h2>
                        <div className="flex items-center gap-2">
                            <BarChart3 size={20} className="text-slate-400" />
                            <span className="text-sm text-slate-600">Analytics</span>
                        </div>
                    </div>
                    
                    {/* Placeholder Chart */}
                    <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                            <TrendingUp size={48} className="text-blue-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-700 mb-2">Chart Coming Soon</h3>
                            <p className="text-slate-500">Inventory analytics will be displayed here</p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-slate-900">Recent Activity</h2>
                        <Clock size={20} className="text-slate-400" />
                    </div>
                    
                    <div className="space-y-4">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                <div className={`p-2 rounded-full ${
                                    activity.type === 'create' ? 'bg-green-100 text-green-600' :
                                    activity.type === 'dispatch' ? 'bg-blue-100 text-blue-600' :
                                    activity.type === 'update' ? 'bg-orange-100 text-orange-600' :
                                    'bg-purple-100 text-purple-600'
                                }`}>
                                    <Activity size={14} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                                    <p className="text-xs text-slate-500">by {activity.user}</p>
                                    <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <button className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                        View all activity
                    </button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                        <Package size={24} className="text-blue-600" />
                        <span className="text-sm font-medium text-slate-700">Add Product</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                        <Activity size={24} className="text-green-600" />
                        <span className="text-sm font-medium text-slate-700">Create Order</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                        <BarChart3 size={24} className="text-purple-600" />
                        <span className="text-sm font-medium text-slate-700">View Reports</span>
                    </button>
                    <button className="flex flex-col items-center gap-2 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                        <Users size={24} className="text-orange-600" />
                        <span className="text-sm font-medium text-slate-700">Manage Users</span>
                    </button>
                </div>
            </div>
        </div>
    );
}