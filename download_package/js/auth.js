// Authentication related functions

// DOM Elements
const loginBtn = document.getElementById('login-btn');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');

// Event listeners
if (loginBtn) {
    loginBtn.addEventListener('click', function() {
        handleLogin();
    });
}

// Handle form submission with Enter key
if (passwordInput) {
    passwordInput.addEventListener('keyup', function(event) {
        if (event.key === 'Enter') {
            handleLogin();
        }
    });
}

// Login function
function handleLogin() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!username || !password) {
        showLoginError('Please enter both username and password');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        // Store current user info in localStorage
        localStorage.setItem('currentUser', JSON.stringify({
            id: user.id,
            username: user.username,
            role: user.role,
            name: user.name
        }));
        
        // Create login notification
        createNotification(user.id, `You logged in successfully at ${formatDateTime()}`);
        
        // Redirect to appropriate dashboard
        window.location.href = `pages/${user.role}.html`;
    } else {
        showLoginError('Invalid username or password');
    }
}

// Show login error
function showLoginError(message) {
    if (loginError) {
        loginError.textContent = message;
        loginError.style.display = 'block';
        
        // Clear error after 3 seconds
        setTimeout(() => {
            loginError.style.display = 'none';
        }, 3000);
    }
}

// Get current logged-in user
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('currentUser'));
}

// Logout function
function logout() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        // Create logout notification
        createNotification(currentUser.id, `You logged out at ${formatDateTime()}`);
        
        // Remove user from localStorage
        localStorage.removeItem('currentUser');
    }
    
    // Redirect to home page
    window.location.href = '/';
}

// Check if user is authorized for a specific role
function checkAuthorization(allowedRoles) {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        // Not logged in, redirect to login
        window.location.href = '/';
        return false;
    }
    
    if (!allowedRoles.includes(currentUser.role)) {
        // Unauthorized role, redirect to their dashboard
        window.location.href = `${currentUser.role}.html`;
        return false;
    }
    
    return true;
}
