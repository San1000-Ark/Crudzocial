// Note management specific functions

// Validate note content
function validateNote(title, content) {
    const errors = [];
    
    if (!title || title.trim().length === 0) {
        errors.push('Title is required');
    } else if (title.length > 200) {
        errors.push('Title must be less than 200 characters');
    }
    
    if (!content || content.trim().length === 0) {
        errors.push('Content is required');
    } else if (content.length > 10000) {
        errors.push('Content must be less than 10,000 characters');
    }
    
    return {
        valid: errors.length === 0,
        errors: errors
    };
}

// Check if user can edit note
function canEditNote(note, currentUser) {
    if (!currentUser) return false;
    return currentUser.role === 'admin' || note.userId === currentUser.id;
}

// Get note statistics for user
function getUserNoteStats(userId) {
    const userNotes = getUserNotes(userId);
    const totalNotes = userNotes.length;
    const totalWords = userNotes.reduce((total, note) => 
        total + note.content.split(/\s+/).length, 0);
    
    const categories = userNotes.reduce((cats, note) => {
        if (note.category) {
            cats[note.category] = (cats[note.category] || 0) + 1;
        }
        return cats;
    }, {});
    
    const recentNotes = userNotes.filter(note => {
        const noteDate = new Date(note.updatedAt || note.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return noteDate > weekAgo;
    }).length;
    
    return {
        total: totalNotes,
        totalWords: totalWords,
        categories: categories,
        recent: recentNotes,
        oldest: totalNotes > 0 ? userNotes.reduce((oldest, note) => 
            new Date(note.createdAt) < new Date(oldest.createdAt) ? note : oldest
        ) : null,
        newest: totalNotes > 0 ? userNotes.reduce((newest, note) => 
            new Date(note.updatedAt || note.createdAt) > new Date(newest.updatedAt || newest.createdAt) ? note : newest
        ) : null
    };
}

// Search notes by title, content, or category
function searchNotes(searchTerm, userId = null) {
    let notes = getAllNotes();
    
    // Filter by user if specified
    if (userId) {
        notes = notes.filter(note => note.userId === userId);
    }
    
    if (!searchTerm) return notes;
    
    const term = searchTerm.toLowerCase();
    return notes.filter(note => {
        return (
            note.title.toLowerCase().includes(term) ||
            note.content.toLowerCase().includes(term) ||
            (note.category && note.category.toLowerCase().includes(term))
        );
    });
}

// Sort notes by different criteria
function sortNotes(notes, sortBy = 'updated', ascending = false) {
    return notes.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
            case 'title':
                aValue = a.title.toLowerCase();
                bValue = b.title.toLowerCase();
                break;
            case 'created':
                aValue = new Date(a.createdAt);
                bValue = new Date(b.createdAt);
                break;
            case 'updated':
                aValue = new Date(a.updatedAt || a.createdAt);
                bValue = new Date(b.updatedAt || b.createdAt);
                break;
            case 'category':
                aValue = (a.category || '').toLowerCase();
                bValue = (b.category || '').toLowerCase();
                break;
            case 'user':
                const userA = getUserById(a.userId);
                const userB = getUserById(b.userId);
                aValue = userA ? `${userA.firstName} ${userA.lastName}`.toLowerCase() : '';
                bValue = userB ? `${userB.firstName} ${userB.lastName}`.toLowerCase() : '';
                break;
            default:
                return 0;
        }
        
        if (aValue < bValue) return ascending ? -1 : 1;
        if (aValue > bValue) return ascending ? 1 : -1;
        return 0;
    });
}

// Get notes by category
function getNotesByCategory(category, userId = null) {
    let notes = getAllNotes();
    
    if (userId) {
        notes = getUserNotes(userId);
    }
    
    return notes.filter(note => note.category === category);
}

// Get all unique categories
function getAllCategories(userId = null) {
    let notes = getAllNotes();
    
    if (userId) {
        notes = getUserNotes(userId);
    }
    
    const categories = new Set();
    notes.forEach(note => {
        if (note.category) {
            categories.add(note.category);
        }
    });
    
    return Array.from(categories).sort();
}

// Create note preview
function createNotePreview(note, maxLength = 100) {
    const content = note.content.replace(/\n/g, ' ').trim();
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
}

// Count words in note content
function countWords(content) {
    if (!content) return 0;
    return content.trim().split(/\s+/).filter(word => word.length > 0).length;
}

// Estimate reading time
function estimateReadingTime(content) {
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = countWords(content);
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes === 1 ? '1 minute' : `${minutes} minutes`;
}

// Create note card HTML
function createNoteCard(note, currentUser) {
    const user = getUserById(note.userId);
    const canEdit = canEditNote(note, currentUser);
    const preview = createNotePreview(note);
    const wordCount = countWords(note.content);
    const readingTime = estimateReadingTime(note.content);
    
    return `
        <div class="col-md-6 col-lg-4 mb-4">
            <div class="card h-100">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title">${escapeHtml(note.title)}</h5>
                        ${note.category ? `<span class="badge bg-secondary">${escapeHtml(note.category)}</span>` : ''}
                    </div>
                    <p class="card-text">${escapeHtml(preview)}</p>
                    <div class="small text-muted mb-2">
                        <i class="fas fa-book-open me-1"></i>${wordCount} words • ${readingTime}
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">
                            By: ${user ? escapeHtml(user.firstName + ' ' + user.lastName) : 'Unknown'}
                        </small>
                        <small class="text-muted">
                            ${formatDate(note.updatedAt || note.createdAt)}
                        </small>
                    </div>
                    ${canEdit ? `
                        <div class="mt-3">
                            <button class="btn btn-sm btn-outline-primary me-2" onclick="viewNote('${note.id}')">
                                <i class="fas fa-eye"></i> View
                            </button>
                            <button class="btn btn-sm btn-outline-secondary me-2" onclick="editNote('${note.id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteNote('${note.id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    ` : `
                        <div class="mt-3">
                            <button class="btn btn-sm btn-outline-primary" onclick="viewNote('${note.id}')">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </div>
                    `}
                </div>
            </div>
        </div>
    `;
}

// Export user notes data
function exportUserNotes(userId) {
    const userNotes = getUserNotes(userId);
    const user = getUserById(userId);
    const stats = getUserNoteStats(userId);
    
    return {
        user: user ? {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email
        } : null,
        notes: userNotes,
        statistics: stats,
        exportDate: new Date().toISOString()
    };
}

// Get notes by date range
function getNotesByDateRange(startDate, endDate, userId = null) {
    let notes = getAllNotes();
    
    if (userId) {
        notes = getUserNotes(userId);
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return notes.filter(note => {
        const noteDate = new Date(note.updatedAt || note.createdAt);
        return noteDate >= start && noteDate <= end;
    });
}

// Duplicate note
function duplicateNote(noteId, currentUser) {
    const originalNote = getNoteById(noteId);
    if (!originalNote || !canEditNote(originalNote, currentUser)) {
        return null;
    }
    
    const duplicatedNote = {
        id: generateId(),
        userId: currentUser.id,
        title: originalNote.title + ' (Copy)',
        content: originalNote.content,
        category: originalNote.category,
        createdAt: new Date().toISOString()
    };
    
    addNote(duplicatedNote);
    addLog(currentUser.id, 'create_note', `Duplicated note: ${duplicatedNote.title}`);
    
    return duplicatedNote;
}

// Archive note (soft delete)
function archiveNote(noteId, currentUser) {
    const note = getNoteById(noteId);
    if (!note || !canEditNote(note, currentUser)) {
        return false;
    }
    
    const archivedNote = {
        ...note,
        archived: true,
        archivedAt: new Date().toISOString()
    };
    
    updateNote(archivedNote);
    addLog(currentUser.id, 'archive_note', `Archived note: ${note.title}`);
    
    return true;
}

// Get archived notes
function getArchivedNotes(userId = null) {
    let notes = getAllNotes();
    
    if (userId) {
        notes = getUserNotes(userId);
    }
    
    return notes.filter(note => note.archived === true);
}
