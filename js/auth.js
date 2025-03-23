// Authentication related functions

// DOM Elements
const loginBtn = document.getElementById('login-btn');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');

// Forgot password elements
const forgotPasswordLink = document.getElementById('forgot-password-link');
const backToLoginBtn = document.getElementById('back-to-login-btn');
const resetPasswordBtn = document.getElementById('reset-password-btn');
const resetEmailInput = document.getElementById('reset-email');
const resetMessage = document.getElementById('reset-message');
const forgotPasswordForm = document.getElementById('forgot-password-form');

// New account elements
const newAccountLink = document.getElementById('new-account-link');
const backToLoginFromSignupBtn = document.getElementById('back-to-login-from-signup-btn');
const createAccountBtn = document.getElementById('create-account-btn');
const newUsernameInput = document.getElementById('new-username');
const newEmailInput = document.getElementById('new-email');
const newPasswordInput = document.getElementById('new-password');
const confirmPasswordInput = document.getElementById('confirm-password');
const signupMessage = document.getElementById('signup-message');
const newAccountForm = document.getElementById('new-account-form');

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

// Forgot password link
if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.login-panel').style.display = 'none';
        forgotPasswordForm.style.display = 'block';
        newAccountForm.style.display = 'none';
    });
}

// Back to login button from forgot password
if (backToLoginBtn) {
    backToLoginBtn.addEventListener('click', function() {
        forgotPasswordForm.style.display = 'none';
        document.querySelector('.login-panel').style.display = 'block';
        resetMessage.textContent = '';
    });
}

// Reset password button
if (resetPasswordBtn) {
    resetPasswordBtn.addEventListener('click', function() {
        handlePasswordReset();
    });
}

// New account link
if (newAccountLink) {
    newAccountLink.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector('.login-panel').style.display = 'none';
        forgotPasswordForm.style.display = 'none';
        newAccountForm.style.display = 'block';
    });
}

// Back to login button from signup
if (backToLoginFromSignupBtn) {
    backToLoginFromSignupBtn.addEventListener('click', function() {
        newAccountForm.style.display = 'none';
        document.querySelector('.login-panel').style.display = 'block';
        signupMessage.textContent = '';
        signupMessage.className = 'message';
    });
}

// Create account button
if (createAccountBtn) {
    createAccountBtn.addEventListener('click', function() {
        handleCreateAccount();
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

// Handle password reset
function handlePasswordReset() {
    const email = resetEmailInput.value.trim();
    
    if (!email) {
        resetMessage.textContent = 'Please enter your email address';
        resetMessage.className = 'error-message';
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email);
    
    if (user) {
        // In a real application, this would send an email with a reset link
        // For demo purposes, we'll just display a success message
        resetMessage.textContent = 'Password reset link has been sent to your email';
        resetMessage.className = 'success-message';
        
        // Create a notification for the user
        createNotification(user.id, `Password reset requested at ${formatDateTime()}`);
        
        // Clear input field
        resetEmailInput.value = '';
        
        // Automatically return to login after 3 seconds
        setTimeout(() => {
            forgotPasswordForm.style.display = 'none';
            document.querySelector('.login-panel').style.display = 'block';
            resetMessage.textContent = '';
        }, 3000);
    } else {
        resetMessage.textContent = 'Email not found in our records';
        resetMessage.className = 'error-message';
    }
}

// Handle create account
function handleCreateAccount() {
    const username = newUsernameInput.value.trim();
    const email = newEmailInput.value.trim();
    const password = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    
    // Basic validation
    if (!username || !email || !password || !confirmPassword) {
        signupMessage.textContent = 'Please fill in all fields';
        signupMessage.className = 'error-message';
        return;
    }
    
    if (password !== confirmPassword) {
        signupMessage.textContent = 'Passwords do not match';
        signupMessage.className = 'error-message';
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        signupMessage.textContent = 'Please enter a valid email address';
        signupMessage.className = 'error-message';
        return;
    }
    
    // Password strength
    if (password.length < 6) {
        signupMessage.textContent = 'Password must be at least 6 characters long';
        signupMessage.className = 'error-message';
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if username or email already exists
    if (users.some(u => u.username === username)) {
        signupMessage.textContent = 'Username already exists';
        signupMessage.className = 'error-message';
        return;
    }
    
    if (users.some(u => u.email === email)) {
        signupMessage.textContent = 'Email already registered';
        signupMessage.className = 'error-message';
        return;
    }
    
    // Create new user (default role: student)
    const newUser = {
        id: users.length + 1,
        username: username,
        email: email,
        password: password,
        role: 'student',
        name: username,
        createdAt: new Date().toISOString()
    };
    
    // Add user to users array
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Show success message
    signupMessage.textContent = 'Account created successfully! You can now login.';
    signupMessage.className = 'success-message';
    
    // Clear input fields
    newUsernameInput.value = '';
    newEmailInput.value = '';
    newPasswordInput.value = '';
    confirmPasswordInput.value = '';
    
    // Automatically return to login after 3 seconds
    setTimeout(() => {
        newAccountForm.style.display = 'none';
        document.querySelector('.login-panel').style.display = 'block';
        signupMessage.textContent = '';
    }, 3000);
}
