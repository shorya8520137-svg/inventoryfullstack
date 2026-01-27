"use client";

import React, { useState } from "react";
import { Search, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import NotificationBell from "./NotificationBell";
import styles from "./TopNavBar.module.css";

export default function TopNavBar() {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e) => {
        e.preventDefault();
        // Implement search functionality here
        console.log("Searching for:", searchQuery);
    };

    return (
        <div className={styles.topNav}>
            <div className={styles.container}>
                {/* Search Section */}
                <div className={styles.searchSection}>
                    <form onSubmit={handleSearch} className={styles.searchForm}>
                        <div className={styles.searchContainer}>
                            <Search className={styles.searchIcon} size={18} />
                            <input
                                type="text"
                                placeholder="Search orders, products, customers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>
                    </form>
                </div>

                {/* Actions Section */}
                <div className={styles.actionsSection}>
                    {/* Real-time Notifications */}
                    <div className={styles.notificationWrapper}>
                        <NotificationBell />
                    </div>

                    {/* User Profile */}
                    <div className={styles.userProfile}>
                        <div className={styles.userAvatar}>
                            <User size={16} />
                        </div>
                        <div className={styles.userInfo}>
                            <span className={styles.userName}>{user?.name || "Admin"}</span>
                            <span className={styles.userRole}>Administrator</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
