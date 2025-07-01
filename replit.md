# Crudzocial - User Management System

## Overview

Crudzocial is a comprehensive client-side user management system built with vanilla HTML, CSS, and JavaScript. It provides authentication, user profiles, image sharing, note-taking, and administrative controls. The application uses localStorage for data persistence and sessionStorage for authentication state management.

## System Architecture

### Frontend Architecture
- **Pure Client-Side Application**: Built with vanilla HTML5, CSS3, and ES6 JavaScript
- **Bootstrap 5 Dark Theme**: Uses CDN-hosted Bootstrap with custom CSS overrides
- **Single Page Application (SPA) Pattern**: Multiple HTML pages with shared JavaScript modules
- **Responsive Design**: Mobile-first approach using Bootstrap's grid system

### Authentication System
- **Session-Based Authentication**: Uses sessionStorage for maintaining login state
- **Role-Based Access Control**: Supports user and admin roles
- **Client-Side Session Management**: No server-side authentication required

### Data Storage Strategy
- **localStorage for Persistence**: All user data, images, notes, and logs stored locally
- **sessionStorage for Auth State**: Current user session maintained across page reloads
- **JSON-Based Data Structure**: All data stored as JSON strings in browser storage

## Key Components

### Core Modules
1. **auth.js**: Authentication and session management
2. **storage.js**: Data persistence and CRUD operations
3. **users.js**: Admin user management functionality
4. **images.js**: Image sharing and validation
5. **notes.js**: Note-taking functionality
6. **profile.js**: User profile management
7. **utils.js**: Common utility functions

### UI Components
- **Navigation**: Consistent navbar across all pages with role-based visibility
- **Forms**: Registration, login, profile editing with validation
- **Cards**: Bootstrap card components for displaying users, images, and notes
- **Modals**: Bootstrap modals for add/edit operations
- **Alerts**: Dynamic alert system for user feedback

### Data Models
- **Users**: firstName, lastName, email, phone, country, city, address, zipCode, role, createdAt
- **Images**: id, userId, url, title, description, isPublic, createdAt
- **Notes**: id, userId, title, content, category, isPublic, createdAt, updatedAt
- **Logs**: id, userId, action, details, timestamp

## Data Flow

### Authentication Flow
1. User submits login credentials
2. System validates against localStorage users
3. Session established in sessionStorage
4. Role-based navigation updated
5. User redirected to dashboard

### Content Management Flow
1. Authenticated user creates/edits content
2. Client-side validation performed
3. Data stored in localStorage
4. Activity logged for admin tracking
5. UI updated with new content

### Admin Operations Flow
1. Admin access verified via role check
2. Comprehensive statistics calculated
3. User management operations performed
4. All actions logged for audit trail

## External Dependencies

### CDN Resources
- **Bootstrap 5**: `https://cdn.replit.com/agent/bootstrap-agent-dark-theme.min.css`
- **Font Awesome 6.4.0**: `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css`
- **Bootstrap JavaScript**: Loaded via CDN for modal and component functionality

### Browser APIs
- **localStorage**: Primary data persistence
- **sessionStorage**: Authentication state management
- **Image API**: For image validation and preloading
- **URL API**: For URL validation

## Deployment Strategy

### Static Hosting Requirements
- **No Server Required**: Pure client-side application
- **HTTPS Recommended**: For security best practices
- **Modern Browser Support**: Requires ES6+ support

### Deployment Considerations
- All files can be served from any static web server
- No build process or compilation required
- localStorage data is per-domain, ensuring data isolation
- Mobile-responsive design works across devices

### Performance Optimizations
- Bootstrap and Font Awesome loaded from CDN
- Minimal custom CSS for fast loading
- Efficient localStorage operations with JSON parsing
- Image preloading for validation

## Changelog

```
Changelog:
- July 01, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```