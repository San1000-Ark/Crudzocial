// Admin user management specific functions

// Get comprehensive user statistics
function getUsersStatistics() {
    const users = getAllUsers();
    const images = getAllImages();
    const notes = getAllNotes();
    const logs = getAllLogs();
    
    const totalUsers = users.length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    const regularUsers = users.filter(u => u.role === 'user').length;
    
    // Activity over time periods
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const newUsersThisWeek = users.filter(u => new Date(u.createdAt) > weekAgo).length;
    const newUsersThisMonth = users.filter(u => new Date(u.createdAt) > monthAgo).length;
    
    const activeUsersThisWeek = new Set(logs.filter(l => new Date(l.timestamp) > weekAgo).map(l => l.userId)).size;
    const activeUsersThisMonth = new Set(logs.filter(l => new Date(l.timestamp) > monthAgo).map(l => l.userId)).size;
    
    return {
        total: {
            users: totalUsers,
            admins: adminUsers,
            regular: regularUsers,
            images: images.length,
            notes: notes.length,
            activities: logs.length
        },
        activity: {
            newUsersWeek: newUsersThisWeek,
            newUsersMonth: newUsersThisMonth,
            activeUsersWeek: activeUsersThisWeek,
            activeUsersMonth: activeUsersThisMonth
        },
        content: {
            imagesPerUser: totalUsers > 0 ? Math.round(images.length / totalUsers * 10) / 10 : 0,
            notesPerUser: totalUsers > 0 ? Math.round(notes.length / totalUsers * 10) / 10 : 0
        }
    };
}

// Get detailed user information with activity
function getUserDetails(userId) {
    const user = getUserById(userId);
    if (!user) return null;
    
    const userImages = getUserImages(userId);
    const userNotes = getUserNotes(userId);
    const userLogs = getUserLogs(userId);
    
    // Calculate user engagement
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recentActivity = userLogs.filter(log => new Date(log.timestamp) > weekAgo).length;
    const lastActivity = userLogs.length > 0 ? userLogs[userLogs.length - 1].timestamp : user.createdAt;
    
    // Profile completion
    const profileFields = ['firstName', 'lastName', 'email', 'phone', 'country', 'city', 'address', 'zipCode'];
    const completedFields = profileFields.filter(field => user[field] && user[field].trim()).length;
    const profileCompletion = Math.round((completedFields / profileFields.length) * 100);
    
    return {
        user: user,
        statistics: {
            images: userImages.length,
            notes: userNotes.length,
            activities: userLogs.length,
            recentActivity: recentActivity,
            profileCompletion: profileCompletion
        },
        timeline: {
            registered: user.createdAt,
            lastActivity: lastActivity,
            daysSinceRegistration: Math.floor((now - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))
        },
        content: {
            recentImages: userImages.slice(-3).reverse(),
            recentNotes: userNotes.slice(-3).reverse(),
            recentLogs: userLogs.slice(-10).reverse()
        }
    };
}

// Search and filter users
function searchUsers(searchTerm, filters = {}) {
    let users = getAllUsers();
    
    // Apply text search
    if (searchTerm && searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        users = users.filter(user => 
            `${user.firstName} ${user.lastName}`.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term) ||
            (user.phone && user.phone.includes(term)) ||
            (user.country && user.country.toLowerCase().includes(term)) ||
            (user.city && user.city.toLowerCase().includes(term))
        );
    }
    
    // Apply role filter
    if (filters.role && filters.role !== 'all') {
        users = users.filter(user => user.role === filters.role);
    }
    
    // Apply date filters
    if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        users = users.filter(user => new Date(user.createdAt) >= fromDate);
    }
    
    if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        users = users.filter(user => new Date(user.createdAt) <= toDate);
    }
    
    // Apply activity filter
    if (filters.activity) {
        const now = new Date();
        const threshold = new Date();
        
        switch (filters.activity) {
            case 'active-week':
                threshold.setDate(now.getDate() - 7);
                break;
            case 'active-month':
                threshold.setMonth(now.getMonth() - 1);
                break;
            case 'inactive':
                threshold.setMonth(now.getMonth() - 1);
                const activeLogs = getAllLogs().filter(log => new Date(log.timestamp) > threshold);
                const activeUserIds = new Set(activeLogs.map(log => log.userId));
                users = users.filter(user => !activeUserIds.has(user.id));
                return users;
        }
        
        if (filters.activity !== 'inactive') {
            const activeLogs = getAllLogs().filter(log => new Date(log.timestamp) > threshold);
            const activeUserIds = new Set(activeLogs.map(log => log.userId));
            users = users.filter(user => activeUserIds.has(user.id));
        }
    }
    
    return users;
}

// Sort users by different criteria
function sortUsers(users, sortBy = 'name', ascending = true) {
    return users.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
            case 'name':
                aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
                bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
                break;
            case 'email':
                aValue = a.email.toLowerCase();
                bValue = b.email.toLowerCase();
                break;
            case 'role':
                aValue = a.role;
                bValue = b.role;
                break;
            case 'registered':
                aValue = new Date(a.createdAt);
                bValue = new Date(b.createdAt);
                break;
            case 'activity':
                const logsA = getUserLogs(a.id);
                const logsB = getUserLogs(b.id);
                aValue = logsA.length > 0 ? new Date(logsA[logsA.length - 1].timestamp) : new Date(a.createdAt);
                bValue = logsB.length > 0 ? new Date(logsB[logsB.length - 1].timestamp) : new Date(b.createdAt);
                break;
            default:
                return 0;
        }
        
        if (aValue < bValue) return ascending ? -1 : 1;
        if (aValue > bValue) return ascending ? 1 : -1;
        return 0;
    });
}

// Generate user activity report
function generateUserActivityReport(userId, dateRange = 30) {
    const user = getUserById(userId);
    if (!user) return null;
    
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - dateRange * 24 * 60 * 60 * 1000);
    
    const logs = getUserLogs(userId).filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= startDate && logDate <= endDate;
    });
    
    // Group activities by type
    const activityTypes = {};
    logs.forEach(log => {
        activityTypes[log.action] = (activityTypes[log.action] || 0) + 1;
    });
    
    // Group activities by date
    const dailyActivity = {};
    logs.forEach(log => {
        const date = new Date(log.timestamp).toDateString();
        dailyActivity[date] = (dailyActivity[date] || 0) + 1;
    });
    
    return {
        user: {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email
        },
        period: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
            days: dateRange
        },
        summary: {
            totalActivities: logs.length,
            averagePerDay: Math.round((logs.length / dateRange) * 10) / 10,
            mostActiveDay: Object.keys(dailyActivity).reduce((a, b) => 
                dailyActivity[a] > dailyActivity[b] ? a : b, Object.keys(dailyActivity)[0]
            ),
            activityTypes: activityTypes
        },
        timeline: logs.map(log => ({
            timestamp: log.timestamp,
            action: log.action,
            description: log.description
        })),
        generatedAt: new Date().toISOString()
    };
}

// Get system-wide activity logs with filtering
function getFilteredLogs(filters = {}) {
    let logs = getAllLogs();
    
    // Filter by user
    if (filters.userId) {
        logs = logs.filter(log => log.userId === filters.userId);
    }
    
    // Filter by action type
    if (filters.action && filters.action !== 'all') {
        logs = logs.filter(log => log.action === filters.action);
    }
    
    // Filter by date range
    if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        logs = logs.filter(log => new Date(log.timestamp) >= fromDate);
    }
    
    if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        logs = logs.filter(log => new Date(log.timestamp) <= toDate);
    }
    
    // Filter by search term
    if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        logs = logs.filter(log => 
            log.description.toLowerCase().includes(term) ||
            log.action.toLowerCase().includes(term)
        );
    }
    
    return logs;
}

// Export all users data
function exportAllUsersData() {
    const users = getAllUsers();
    const statistics = getUsersStatistics();
    
    const userData = users.map(user => {
        const details = getUserDetails(user.id);
        return {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role,
            phone: user.phone,
            location: {
                country: user.country,
                city: user.city,
                address: user.address,
                zipCode: user.zipCode
            },
            dates: {
                registered: user.createdAt,
                lastUpdated: user.updatedAt,
                lastActivity: details.timeline.lastActivity
            },
            statistics: details.statistics
        };
    });
    
    return {
        metadata: {
            totalUsers: users.length,
            exportDate: new Date().toISOString(),
            systemStatistics: statistics
        },
        users: userData
    };
}

// Bulk user operations
function bulkUserOperation(userIds, operation, params = {}) {
    const results = [];
    const currentUser = getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
        return { success: false, message: 'Admin privileges required' };
    }
    
    userIds.forEach(userId => {
        const user = getUserById(userId);
        if (!user) {
            results.push({ userId, success: false, message: 'User not found' });
            return;
        }
        
        switch (operation) {
            case 'delete':
                // Prevent deleting all admins
                if (user.role === 'admin') {
                    const adminUsers = getAllUsers().filter(u => u.role === 'admin');
                    if (adminUsers.length === 1) {
                        results.push({ userId, success: false, message: 'Cannot delete the only admin' });
                        return;
                    }
                }
                
                // Remove user's content
                getUserImages(userId).forEach(img => removeImage(img.id));
                getUserNotes(userId).forEach(note => removeNote(note.id));
                
                removeUser(userId);
                addLog(currentUser.id, 'bulk_delete_user', `Bulk deleted user: ${user.firstName} ${user.lastName}`);
                results.push({ userId, success: true, message: 'User deleted' });
                break;
                
            case 'changeRole':
                if (!params.newRole) {
                    results.push({ userId, success: false, message: 'New role not specified' });
                    return;
                }
                
                const updatedUser = { ...user, role: params.newRole, updatedAt: new Date().toISOString() };
                updateUser(updatedUser);
                addLog(currentUser.id, 'bulk_change_role', `Changed ${user.firstName} ${user.lastName}'s role to ${params.newRole}`);
                results.push({ userId, success: true, message: `Role changed to ${params.newRole}` });
                break;
                
            default:
                results.push({ userId, success: false, message: 'Unknown operation' });
        }
    });
    
    return {
        success: true,
        message: `Bulk operation completed`,
        results: results,
        summary: {
            total: userIds.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length
        }
    };
}

// Get user engagement metrics
function getUserEngagementMetrics() {
    const users = getAllUsers();
    const logs = getAllLogs();
    const images = getAllImages();
    const notes = getAllNotes();
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Calculate engagement scores
    const userEngagement = users.map(user => {
        const userLogs = logs.filter(log => log.userId === user.id);
        const userImages = images.filter(img => img.userId === user.id);
        const userNotes = notes.filter(note => note.userId === user.id);
        
        const weeklyLogs = userLogs.filter(log => new Date(log.timestamp) > weekAgo).length;
        const monthlyLogs = userLogs.filter(log => new Date(log.timestamp) > monthAgo).length;
        
        const engagementScore = (userLogs.length * 1) + (userImages.length * 3) + (userNotes.length * 2);
        const recentEngagement = (weeklyLogs * 2) + (userImages.filter(img => new Date(img.createdAt) > weekAgo).length * 5);
        
        return {
            userId: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            totalScore: engagementScore,
            recentScore: recentEngagement,
            lastActivity: userLogs.length > 0 ? userLogs[userLogs.length - 1].timestamp : user.createdAt,
            contentCount: {
                images: userImages.length,
                notes: userNotes.length,
                activities: userLogs.length
            }
        };
    });
    
    // Sort by engagement score
    userEngagement.sort((a, b) => b.totalScore - a.totalScore);
    
    return {
        topEngaged: userEngagement.slice(0, 5),
        leastEngaged: userEngagement.slice(-5).reverse(),
        averageScore: userEngagement.reduce((sum, user) => sum + user.totalScore, 0) / userEngagement.length,
        metrics: userEngagement
    };
}

// Clean up inactive users (soft delete)
function cleanupInactiveUsers(inactiveDays = 90) {
    const users = getAllUsers();
    const logs = getAllLogs();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);
    
    const inactiveUsers = users.filter(user => {
        if (user.role === 'admin') return false; // Never cleanup admin users
        
        const userLogs = logs.filter(log => log.userId === user.id);
        const lastActivity = userLogs.length > 0 ? 
            new Date(userLogs[userLogs.length - 1].timestamp) : 
            new Date(user.createdAt);
            
        return lastActivity < cutoffDate;
    });
    
    return {
        found: inactiveUsers.length,
        users: inactiveUsers.map(user => ({
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            lastActivity: logs.filter(log => log.userId === user.id).slice(-1)[0]?.timestamp || user.createdAt,
            daysSinceActivity: Math.floor((new Date() - new Date(logs.filter(log => log.userId === user.id).slice(-1)[0]?.timestamp || user.createdAt)) / (1000 * 60 * 60 * 24))
        })),
        cutoffDate: cutoffDate.toISOString()
    };
}
