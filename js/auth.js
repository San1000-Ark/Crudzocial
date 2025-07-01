// Authentication and session management functions

// Login function
function login(email) {
    const user = getUserByEmail(email);
    if (user) {
        setCurrentUser(user);
        addLog(user.id, 'login', 'User logged in');
        return true;
    }
    return false;
}

// Logout function
function logout() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        addLog(currentUser.id, 'logout', 'User logged out');
    }
    sessionStorage.removeItem('currentUser');
}

// Check if user is logged in
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Get current user from session
function getCurrentUser() {
    const userJson = sessionStorage.getItem('currentUser');
    return userJson ? JSON.parse(userJson) : null;
}

// Set current user in session
function setCurrentUser(user) {
    sessionStorage.setItem('currentUser', JSON.stringify(user));
}

// Check if current user is admin
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// Session guardian - middleware function
function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Admin-only access
function requireAdmin() {
    if (!requireAuth()) return false;
    
    if (!isAdmin()) {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'index.html';
        return false;
    }
    return true;
}

// Auto-executable function to create default admin user
(function createDefaultAdmin() {
    // Check if admin user already exists
    const existingAdmin = getAllUsers().find(user => user.role === 'admin');
    
    if (!existingAdmin) {
        const adminUser = {
            id: generateId(),
            firstName: 'Admin',
            lastName: 'User',
            email: 'admin@crudzocial.com',
            phone: '',
            country: '',
            city: '',
            address: '',
            zipCode: '',
            role: 'admin',
            createdAt: new Date().toISOString()
        };
        
        addUser(adminUser);
        addLog(adminUser.id, 'register', 'Default admin user created');
    }
})();
