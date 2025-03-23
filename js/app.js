// Main application JavaScript file

// DOM Elements
const welcomeSection = document.getElementById('welcome-section');
const loginSection = document.getElementById('login-section');
const loginNav = document.getElementById('login-nav');
const getStartedBtn = document.getElementById('get-started-btn');
const navLinks = document.getElementById('nav-links');

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', function() {
    // Initialize user data in localStorage if it doesn't exist
    if (!localStorage.getItem('users')) {
        initializeUsers();
    }
    
    // Initialize projects data if it doesn't exist
    if (!localStorage.getItem('projects')) {
        localStorage.setItem('projects', JSON.stringify([]));
    }
    
    // Initialize notifications if they don't exist
    if (!localStorage.getItem('notifications')) {
        localStorage.setItem('notifications', JSON.stringify([]));
    }
    
    // Check if user is logged in
    const currentUser = getCurrentUser();
    updateNavigation(currentUser);
    
    // Handle initial page state
    handleInitialState();
});

// Toggle between welcome and login sections
function toggleSections(showLogin) {
    if (showLogin) {
        welcomeSection.style.display = 'none';
        loginSection.style.display = 'block';
    } else {
        welcomeSection.style.display = 'block';
        loginSection.style.display = 'none';
    }
}

// Event listeners
if (getStartedBtn) {
    getStartedBtn.addEventListener('click', function() {
        toggleSections(true);
    });
}

if (loginNav) {
    loginNav.addEventListener('click', function(e) {
        e.preventDefault();
        
        const currentUser = getCurrentUser();
        if (currentUser) {
            // If already logged in, log out
            logout();
        } else {
            // Show login section
            toggleSections(true);
        }
    });
}

// Handle initial application state
function handleInitialState() {
    const currentUser = getCurrentUser();
    
    // If user is logged in, redirect to appropriate dashboard
    if (currentUser) {
        window.location.href = `pages/${currentUser.role}.html`;
    }
}

// Update navigation based on login status
function updateNavigation(user) {
    if (navLinks) {
        // Clear existing navigation links except the Home and Login links
        const homeLink = navLinks.querySelector('a.active'); // First link (Home)
        
        // Remove any links that are not Home or Login
        Array.from(navLinks.children).forEach(child => {
            if (child !== homeLink && child !== loginNav) {
                navLinks.removeChild(child);
            }
        });
        
        if (user) {
            // Add role-specific dashboard link
            const dashboardLink = document.createElement('a');
            dashboardLink.href = `pages/${user.role}.html`;
            dashboardLink.textContent = 'Dashboard';
            navLinks.insertBefore(dashboardLink, loginNav);
            
            // Change login link to logout
            loginNav.textContent = 'Logout';
        } else {
            // Change to Login
            loginNav.textContent = 'Login';
        }
    }
}

// Initialize default users
function initializeUsers() {
    const defaultUsers = [
        {
            id: 1,
            username: 'admin',
            password: 'admin123',
            role: 'admin',
            name: 'Administrator',
            email: 'admin@example.com'
        },
        {
            id: 2,
            username: 'hod',
            password: 'hod123',
            role: 'hod',
            name: 'Dr. Smith',
            email: 'hod@example.com',
            department: 'Computer Science'
        },
        {
            id: 3,
            username: 'incharge',
            password: 'incharge123',
            role: 'incharge',
            name: 'Prof. Johnson',
            email: 'incharge@example.com',
            department: 'Computer Science'
        },
        {
            id: 4,
            username: 'guide',
            password: 'guide123',
            role: 'guide',
            name: 'Dr. Williams',
            email: 'guide@example.com',
            department: 'Computer Science',
            specialization: 'AI & Machine Learning'
        },
        {
            id: 5,
            username: 'student',
            password: 'student123',
            role: 'student',
            name: 'John Doe',
            email: 'student@example.com',
            department: 'Computer Science',
            rollNumber: 'CS2023001',
            year: '3rd Year'
        }
    ];
    
    localStorage.setItem('users', JSON.stringify(defaultUsers));
}

// Format current date and time
function formatDateTime(date) {
    const d = date ? new Date(date) : new Date();
    return d.toLocaleString();
}

// Create a notification
function createNotification(userId, message, relatedTo = null) {
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    
    const newNotification = {
        id: Date.now(),
        userId: userId, 
        message: message,
        timestamp: new Date().toISOString(),
        read: false,
        relatedTo: relatedTo
    };
    
    notifications.push(newNotification);
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    return newNotification;
}

// Get unread notifications count for a user
function getUnreadNotificationsCount(userId) {
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    return notifications.filter(n => n.userId === userId && !n.read).length;
}

// Build commonly used components
function buildStatusBadge(status) {
    let className = '';
    switch(status.toLowerCase()) {
        case 'pending':
            className = 'status-pending';
            break;
        case 'approved':
            className = 'status-approved';
            break;
        case 'rejected':
            className = 'status-rejected';
            break;
        case 'under review':
            className = 'status-under-review';
            break;
        default:
            className = 'status-pending';
    }
    
    return `<span class="status-tag ${className}">${status}</span>`;
}
