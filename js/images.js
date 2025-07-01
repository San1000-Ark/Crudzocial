// Image management specific functions

// Validate image URL
function validateImageUrl(url) {
    if (!isValidUrl(url)) {
        return { valid: false, message: 'Please enter a valid URL' };
    }
    
    // Check if URL appears to be an image
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const urlLower = url.toLowerCase();
    const hasImageExtension = imageExtensions.some(ext => urlLower.includes(ext));
    
    // Also check for common image hosting domains
    const imageHosts = ['imgur.com', 'flickr.com', 'unsplash.com', 'pexels.com', 'pixabay.com'];
    const hasImageHost = imageHosts.some(host => url.includes(host));
    
    if (!hasImageExtension && !hasImageHost) {
        return { 
            valid: false, 
            message: 'URL does not appear to be an image. Please use a direct link to an image file.' 
        };
    }
    
    return { valid: true, message: '' };
}

// Preload image to check if it's valid
function preloadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = url;
    });
}

// Check if user can edit image
function canEditImage(image, currentUser) {
    if (!currentUser) return false;
    return currentUser.role === 'admin' || image.userId === currentUser.id;
}

// Get image statistics for user
function getUserImageStats(userId) {
    const userImages = getUserImages(userId);
    const totalImages = userImages.length;
    const recentImages = userImages.filter(image => {
        const imageDate = new Date(image.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return imageDate > weekAgo;
    }).length;
    
    return {
        total: totalImages,
        recent: recentImages,
        oldest: totalImages > 0 ? userImages.reduce((oldest, image) => 
            new Date(image.createdAt) < new Date(oldest.createdAt) ? image : oldest
        ) : null,
        newest: totalImages > 0 ? userImages.reduce((newest, image) => 
            new Date(image.createdAt) > new Date(newest.createdAt) ? image : newest
        ) : null
    };
}

// Search images by title or description
function searchImages(searchTerm, userId = null) {
    let images = getAllImages();
    
    // Filter by user if specified
    if (userId) {
        images = images.filter(image => image.userId === userId);
    }
    
    if (!searchTerm) return images;
    
    const term = searchTerm.toLowerCase();
    return images.filter(image => {
        return (
            image.title.toLowerCase().includes(term) ||
            (image.description && image.description.toLowerCase().includes(term))
        );
    });
}

// Sort images by different criteria
function sortImages(images, sortBy = 'date', ascending = false) {
    return images.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
            case 'title':
                aValue = a.title.toLowerCase();
                bValue = b.title.toLowerCase();
                break;
            case 'date':
                aValue = new Date(a.createdAt);
                bValue = new Date(b.createdAt);
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

// Get image thumbnail placeholder
function getImagePlaceholder() {
    return 'data:image/svg+xml;base64,' + btoa(`
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="200" height="200" fill="#f8f9fa"/>
            <circle cx="100" cy="80" r="20" fill="#dee2e6"/>
            <path d="M40 140 L80 100 L120 140 L160 100 L200 140 L200 200 L0 200 Z" fill="#dee2e6"/>
            <text x="100" y="170" text-anchor="middle" fill="#6c757d" font-size="12" font-family="Arial">
                Image not available
            </text>
        </svg>
    `);
}

// Handle image load error
function handleImageError(img) {
    img.src = getImagePlaceholder();
    img.title = 'Image failed to load';
    img.alt = 'Image not available';
}

// Create image card HTML
function createImageCard(image, currentUser) {
    const user = getUserById(image.userId);
    const canEdit = canEditImage(image, currentUser);
    
    return `
        <div class="col-md-4 mb-4">
            <div class="card">
                <img src="${image.url}" class="card-img-top" alt="${escapeHtml(image.title)}" 
                     style="height: 200px; object-fit: cover;" 
                     onerror="handleImageError(this)">
                <div class="card-body">
                    <h5 class="card-title">${escapeHtml(image.title)}</h5>
                    <p class="card-text">${escapeHtml(image.description || 'No description')}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">
                            By: ${user ? escapeHtml(user.firstName + ' ' + user.lastName) : 'Unknown'}
                        </small>
                        <small class="text-muted">
                            ${formatDate(image.createdAt)}
                        </small>
                    </div>
                    ${canEdit ? `
                        <div class="mt-2">
                            <button class="btn btn-sm btn-outline-primary me-2" onclick="editImage('${image.id}')">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteImage('${image.id}')">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

// Export user images data
function exportUserImages(userId) {
    const userImages = getUserImages(userId);
    const user = getUserById(userId);
    
    return {
        user: user ? {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email
        } : null,
        images: userImages,
        totalCount: userImages.length,
        exportDate: new Date().toISOString()
    };
}

// Get images by date range
function getImagesByDateRange(startDate, endDate, userId = null) {
    let images = getAllImages();
    
    if (userId) {
        images = getUserImages(userId);
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return images.filter(image => {
        const imageDate = new Date(image.createdAt);
        return imageDate >= start && imageDate <= end;
    });
}

// Clean up broken image references
function cleanupBrokenImages() {
    const images = getAllImages();
    const brokenImages = [];
    
    images.forEach(image => {
        preloadImage(image.url).catch(() => {
            brokenImages.push(image);
        });
    });
    
    return brokenImages;
}
