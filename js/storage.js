// Storage management functions for localStorage and sessionStorage

// Initialize storage with default data structure
function initializeStorage() {
    // Initialize users array if not exists
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify([]));
    }
    
    // Initialize images array if not exists
    if (!localStorage.getItem('images')) {
        localStorage.setItem('images', JSON.stringify([]));
    }
    
    // Initialize notes array if not exists
    if (!localStorage.getItem('notes')) {
        localStorage.setItem('notes', JSON.stringify([]));
    }
    
    // Initialize logs array if not exists
    if (!localStorage.getItem('logs')) {
        localStorage.setItem('logs', JSON.stringify([]));
    }
}

// User management functions
function getAllUsers() {
    return JSON.parse(localStorage.getItem('users') || '[]');
}

function getUserById(id) {
    const users = getAllUsers();
    return users.find(user => user.id === id);
}

function getUserByEmail(email) {
    const users = getAllUsers();
    return users.find(user => user.email === email);
}

function addUser(user) {
    const users = getAllUsers();
    users.push(user);
    localStorage.setItem('users', JSON.stringify(users));
}

function updateUser(updatedUser) {
    const users = getAllUsers();
    const index = users.findIndex(user => user.id === updatedUser.id);
    if (index !== -1) {
        users[index] = { ...users[index], ...updatedUser };
        localStorage.setItem('users', JSON.stringify(users));
    }
}

function removeUser(id) {
    const users = getAllUsers();
    const filteredUsers = users.filter(user => user.id !== id);
    localStorage.setItem('users', JSON.stringify(filteredUsers));
}

// Image management functions
function getAllImages() {
    return JSON.parse(localStorage.getItem('images') || '[]');
}

function getImageById(id) {
    const images = getAllImages();
    return images.find(image => image.id === id);
}

function getUserImages(userId) {
    const images = getAllImages();
    return images.filter(image => image.userId === userId);
}

function addImage(image) {
    const images = getAllImages();
    images.push(image);
    localStorage.setItem('images', JSON.stringify(images));
}

function updateImage(updatedImage) {
    const images = getAllImages();
    const index = images.findIndex(image => image.id === updatedImage.id);
    if (index !== -1) {
        images[index] = { ...images[index], ...updatedImage };
        localStorage.setItem('images', JSON.stringify(images));
    }
}

function removeImage(id) {
    const images = getAllImages();
    const filteredImages = images.filter(image => image.id !== id);
    localStorage.setItem('images', JSON.stringify(filteredImages));
}

// Note management functions
function getAllNotes() {
    return JSON.parse(localStorage.getItem('notes') || '[]');
}

function getNoteById(id) {
    const notes = getAllNotes();
    return notes.find(note => note.id === id);
}

function getUserNotes(userId) {
    const notes = getAllNotes();
    return notes.filter(note => note.userId === userId);
}

function addNote(note) {
    const notes = getAllNotes();
    notes.push(note);
    localStorage.setItem('notes', JSON.stringify(notes));
}

function updateNote(updatedNote) {
    const notes = getAllNotes();
    const index = notes.findIndex(note => note.id === updatedNote.id);
    if (index !== -1) {
        notes[index] = { ...notes[index], ...updatedNote };
        localStorage.setItem('notes', JSON.stringify(notes));
    }
}

function removeNote(id) {
    const notes = getAllNotes();
    const filteredNotes = notes.filter(note => note.id !== id);
    localStorage.setItem('notes', JSON.stringify(filteredNotes));
}

// Log management functions
function getAllLogs() {
    return JSON.parse(localStorage.getItem('logs') || '[]');
}

function getUserLogs(userId) {
    const logs = getAllLogs();
    return logs.filter(log => log.userId === userId);
}

function addLog(userId, action, description) {
    const logs = getAllLogs();
    const newLog = {
        id: generateId(),
        userId: userId,
        action: action,
        description: description,
        timestamp: new Date().toISOString()
    };
    logs.push(newLog);
    localStorage.setItem('logs', JSON.stringify(logs));
}

// Clear all data (for testing purposes)
function clearAllData() {
    localStorage.removeItem('users');
    localStorage.removeItem('images');
    localStorage.removeItem('notes');
    localStorage.removeItem('logs');
    sessionStorage.removeItem('currentUser');
    initializeStorage();
}

// Export data (for backup purposes)
function exportData() {
    return {
        users: getAllUsers(),
        images: getAllImages(),
        notes: getAllNotes(),
        logs: getAllLogs(),
        exportDate: new Date().toISOString()
    };
}

// Import data (for restore purposes)
function importData(data) {
    if (data.users) localStorage.setItem('users', JSON.stringify(data.users));
    if (data.images) localStorage.setItem('images', JSON.stringify(data.images));
    if (data.notes) localStorage.setItem('notes', JSON.stringify(data.notes));
    if (data.logs) localStorage.setItem('logs', JSON.stringify(data.logs));
}
