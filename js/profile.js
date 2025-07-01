// Profile management specific functions

// Load and populate profile form with current user data
function loadProfileData(user) {
    if (!user) return;
    
    const fields = {
        'firstName': user.firstName || '',
        'lastName': user.lastName || '',
        'email': user.email || '',
        'phone': user.phone || '',
        'country': user.country || '',
        'city': user.city || '',
        'address': user.address || '',
        'zipCode': user.zipCode || '',
        'role': user.role || ''
    };
    
    Object.keys(fields).forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (element) {
            element.value = fields[fieldId];
        }
    });
}

// Validate profile form data
function validateProfileForm() {
    const requiredFields = ['firstName', 'lastName', 'email'];
    const errors = [];
    
    requiredFields.forEach(fieldId => {
        const element = document.getElementById(fieldId);
        if (!element || !element.value.trim()) {
            errors.push(`${fieldId.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
            if (element) element.classList.add('is-invalid');
        } else {
            if (element) element.classList.remove('is-invalid');
        }
    });
    
    // Validate email format
    const emailField = document.getElementById('email');
    if (emailField && emailField.value && !isValidEmail(emailField.value)) {
        errors.push('Please enter a valid email address');
        emailField.classList.add('is-invalid');
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

// Get form data as user object
function getProfileFormData() {
    return {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        country: document.getElementById('country').value.trim(),
        city: document.getElementById('city').value.trim(),
        address: document.getElementById('address').value.trim(),
        zipCode: document.getElementById('zipCode').value.trim()
    };
}

// Check if email is available for current user
function isEmailAvailable(email, currentUserId) {
    const existingUser = getUserByEmail(email);
    return !existingUser || existingUser.id === currentUserId;
}

// Update user profile
function updateUserProfile(userId, profileData) {
    const currentUser = getUserById(userId);
    if (!currentUser) return false;
    
    const updatedUser = {
        ...currentUser,
        ...profileData,
        updatedAt: new Date().toISOString()
    };
    
    updateUser(updatedUser);
    setCurrentUser(updatedUser);
    
    return updatedUser;
}

// Get user activity summary
function getUserActivitySummary(userId) {
    const userImages = getUserImages(userId);
    const userNotes = getUserNotes(userId);
    const userLogs = getUserLogs(userId);
    
    // Calculate activity over time periods
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const weeklyImages = userImages.filter(img => new Date(img.createdAt) > weekAgo).length;
    const weeklyNotes = userNotes.filter(note => new Date(note.createdAt) > weekAgo).length;
    const weeklyActivity = userLogs.filter(log => new Date(log.timestamp) > weekAgo).length;
    
    const monthlyImages = userImages.filter(img => new Date(img.createdAt) > monthAgo).length;
    const monthlyNotes = userNotes.filter(note => new Date(note.createdAt) > monthAgo).length;
    const monthlyActivity = userLogs.filter(log => new Date(log.timestamp) > monthAgo).length;
    
    return {
        total: {
            images: userImages.length,
            notes: userNotes.length,
            activities: userLogs.length
        },
        weekly: {
            images: weeklyImages,
            notes: weeklyNotes,
            activities: weeklyActivity
        },
        monthly: {
            images: monthlyImages,
            notes: monthlyNotes,
            activities: monthlyActivity
        },
        recent: {
            images: userImages.slice(-3).reverse(),
            notes: userNotes.slice(-3).reverse(),
            activities: userLogs.slice(-5).reverse()
        }
    };
}

// Format activity summary for display
function formatActivitySummary(summary) {
    return `
        <div class="row text-center mb-3">
            <div class="col-4">
                <div class="text-primary">
                    <i class="fas fa-images fa-2x"></i>
                    <div class="fw-bold">${summary.total.images}</div>
                    <small class="text-muted">Images</small>
                    <div class="small text-success">+${summary.weekly.images} this week</div>
                </div>
            </div>
            <div class="col-4">
                <div class="text-warning">
                    <i class="fas fa-sticky-note fa-2x"></i>
                    <div class="fw-bold">${summary.total.notes}</div>
                    <small class="text-muted">Notes</small>
                    <div class="small text-success">+${summary.weekly.notes} this week</div>
                </div>
            </div>
            <div class="col-4">
                <div class="text-info">
                    <i class="fas fa-history fa-2x"></i>
                    <div class="fw-bold">${summary.total.activities}</div>
                    <small class="text-muted">Activities</small>
                    <div class="small text-success">+${summary.weekly.activities} this week</div>
                </div>
            </div>
        </div>
    `;
}

// Get recent activity for profile display
function getRecentActivityHtml(activities) {
    if (!activities || activities.length === 0) {
        return '<p class="text-muted">No recent activity</p>';
    }
    
    return activities.map(activity => {
        const icon = getActivityIcon(activity.action);
        return `
            <div class="d-flex align-items-start mb-3">
                <div class="me-3">
                    <i class="fas ${icon} text-muted"></i>
                </div>
                <div class="flex-grow-1">
                    <div class="fw-bold">${escapeHtml(activity.description)}</div>
                    <small class="text-muted">${formatDate(activity.timestamp)}</small>
                </div>
            </div>
        `;
    }).join('');
}

// Get appropriate icon for activity type
function getActivityIcon(action) {
    const iconMap = {
        'login': 'fa-sign-in-alt',
        'logout': 'fa-sign-out-alt',
        'register': 'fa-user-plus',
        'update_profile': 'fa-user-edit',
        'create_image': 'fa-image',
        'update_image': 'fa-edit',
        'delete_image': 'fa-trash',
        'create_note': 'fa-sticky-note',
        'update_note': 'fa-edit',
        'delete_note': 'fa-trash',
        'archive_note': 'fa-archive',
        'admin_delete_image': 'fa-user-shield',
        'admin_delete_note': 'fa-user-shield'
    };
    
    return iconMap[action] || 'fa-circle';
}

// Calculate profile completion percentage
function calculateProfileCompletion(user) {
    if (!user) return 0;
    
    const fields = ['firstName', 'lastName', 'email', 'phone', 'country', 'city', 'address', 'zipCode'];
    const requiredFields = ['firstName', 'lastName', 'email'];
    const optionalFields = fields.filter(f => !requiredFields.includes(f));
    
    let score = 0;
    let maxScore = 0;
    
    // Required fields are worth more points
    requiredFields.forEach(field => {
        maxScore += 3;
        if (user[field] && user[field].trim()) {
            score += 3;
        }
    });
    
    // Optional fields are worth less
    optionalFields.forEach(field => {
        maxScore += 1;
        if (user[field] && user[field].trim()) {
            score += 1;
        }
    });
    
    return Math.round((score / maxScore) * 100);
}

// Get profile completion status with suggestions
function getProfileCompletionStatus(user) {
    const completion = calculateProfileCompletion(user);
    const missingFields = [];
    
    const fieldLabels = {
        'firstName': 'First Name',
        'lastName': 'Last Name',
        'email': 'Email',
        'phone': 'Phone Number',
        'country': 'Country',
        'city': 'City',
        'address': 'Address',
        'zipCode': 'Zip Code'
    };
    
    Object.keys(fieldLabels).forEach(field => {
        if (!user[field] || !user[field].trim()) {
            missingFields.push(fieldLabels[field]);
        }
    });
    
    return {
        percentage: completion,
        missing: missingFields,
        isComplete: completion === 100,
        suggestions: missingFields.length > 0 ? 
            `Complete your profile by adding: ${missingFields.slice(0, 3).join(', ')}${missingFields.length > 3 ? '...' : ''}` 
            : 'Your profile is complete!'
    };
}

// Export user profile data
function exportUserProfile(userId) {
    const user = getUserById(userId);
    if (!user) return null;
    
    const summary = getUserActivitySummary(userId);
    const completion = getProfileCompletionStatus(user);
    
    return {
        profile: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            country: user.country,
            city: user.city,
            address: user.address,
            zipCode: user.zipCode,
            role: user.role,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        },
        statistics: summary,
        completion: completion,
        exportDate: new Date().toISOString()
    };
}

// Delete user account (with confirmation)
function deleteUserAccount(userId, currentUser) {
    if (!currentUser || (currentUser.id !== userId && currentUser.role !== 'admin')) {
        return { success: false, message: 'Unauthorized to delete this account' };
    }
    
    // Prevent admin from deleting their own account if they're the only admin
    if (currentUser.role === 'admin' && currentUser.id === userId) {
        const adminUsers = getAllUsers().filter(u => u.role === 'admin');
        if (adminUsers.length === 1) {
            return { success: false, message: 'Cannot delete the only admin account' };
        }
    }
    
    // Log the deletion
    addLog(userId, 'delete_account', 'User account deleted');
    
    // Remove user's images and notes
    const userImages = getUserImages(userId);
    const userNotes = getUserNotes(userId);
    
    userImages.forEach(image => removeImage(image.id));
    userNotes.forEach(note => removeNote(note.id));
    
    // Remove user
    removeUser(userId);
    
    // If current user deleted their own account, logout
    if (currentUser.id === userId) {
        logout();
    }
    
    return { success: true, message: 'Account deleted successfully' };
}

// Change user role (admin only)
function changeUserRole(userId, newRole, currentUser) {
    if (!currentUser || currentUser.role !== 'admin') {
        return { success: false, message: 'Admin privileges required' };
    }
    
    if (currentUser.id === userId && newRole !== 'admin') {
        const adminUsers = getAllUsers().filter(u => u.role === 'admin');
        if (adminUsers.length === 1) {
            return { success: false, message: 'Cannot remove admin role from the only admin' };
        }
    }
    
    const user = getUserById(userId);
    if (!user) {
        return { success: false, message: 'User not found' };
    }
    
    const updatedUser = {
        ...user,
        role: newRole,
        updatedAt: new Date().toISOString()
    };
    
    updateUser(updatedUser);
    addLog(currentUser.id, 'change_role', `Changed ${user.firstName} ${user.lastName}'s role to ${newRole}`);
    
    return { success: true, message: 'User role updated successfully' };
}
