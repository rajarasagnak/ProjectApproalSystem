// User management functionality for admin

// Load user management section
function loadUserManagement() {
    const usersTableContainer = document.getElementById('users-table-container');
    if (!usersTableContainer) return;
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Build users table
    let usersHTML = `
        <table class="projects-table">
            <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Actions</th>
            </tr>
    `;
    
    users.forEach(user => {
        usersHTML += `
            <tr>
                <td>${user.username}</td>
                <td>${user.name}</td>
                <td>${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</td>
                <td>${user.email}</td>
                <td class="action-btns">
                    <button class="action-btn edit-btn" data-id="${user.id}">Edit</button>
                    <button class="action-btn reset-btn" data-id="${user.id}">Reset Password</button>
                </td>
            </tr>
        `;
    });
    
    usersHTML += `</table>`;
    usersTableContainer.innerHTML = usersHTML;
    
    // Add event listeners for edit and reset buttons
    const editButtons = document.querySelectorAll('.edit-btn');
    const resetButtons = document.querySelectorAll('.reset-btn');
    
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = button.getAttribute('data-id');
            editUser(userId);
        });
    });
    
    resetButtons.forEach(button => {
        button.addEventListener('click', function() {
            const userId = button.getAttribute('data-id');
            resetUserPassword(userId);
        });
    });
    
    // Add new user button functionality
    const newUserBtn = document.getElementById('new-user-btn');
    if (newUserBtn) {
        newUserBtn.addEventListener('click', function() {
            showUserForm();
        });
    }
}

// Show user form for adding/editing users
function showUserForm(user = null) {
    const userFormSection = document.getElementById('user-form-section');
    if (!userFormSection) return;
    
    // Update form title based on whether we're adding or editing
    const formTitle = document.getElementById('user-form-title');
    if (formTitle) {
        formTitle.textContent = user ? 'Edit User' : 'Add New User';
    }
    
    // Populate form fields if editing
    const userIdInput = document.getElementById('user-id');
    const usernameInput = document.getElementById('username-input');
    const nameInput = document.getElementById('name-input');
    const emailInput = document.getElementById('email-input');
    const roleSelect = document.getElementById('role-select');
    const passwordInput = document.getElementById('password-input');
    const passwordLabel = document.getElementById('password-label');
    
    if (userIdInput) userIdInput.value = user ? user.id : '';
    if (usernameInput) usernameInput.value = user ? user.username : '';
    if (nameInput) nameInput.value = user ? user.name : '';
    if (emailInput) emailInput.value = user ? user.email : '';
    if (roleSelect) roleSelect.value = user ? user.role : 'student';
    
    // For editing, make password optional
    if (passwordInput && passwordLabel) {
        if (user) {
            passwordInput.required = false;
            passwordLabel.textContent = 'Password (leave blank to keep current)';
        } else {
            passwordInput.required = true;
            passwordLabel.textContent = 'Password';
        }
        passwordInput.value = '';
    }
    
    // Show form
    userFormSection.style.display = 'block';
    
    // Set up form submission
    const userForm = document.getElementById('user-form');
    if (userForm) {
        userForm.onsubmit = function(e) {
            e.preventDefault();
            saveUser();
        };
    }
}

// Edit a user
function editUser(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.id == userId);
    
    if (user) {
        showUserForm(user);
    }
}

// Reset user password
function resetUserPassword(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const userIndex = users.findIndex(u => u.id == userId);
    
    if (userIndex !== -1) {
        // Generate temporary password
        const tempPassword = 'reset' + Math.floor(1000 + Math.random() * 9000);
        
        // Update password
        users[userIndex].password = tempPassword;
        
        // Save users
        localStorage.setItem('users', JSON.stringify(users));
        
        // Show confirmation with new password
        alert(`Password for ${users[userIndex].username} has been reset to: ${tempPassword}`);
        
        // Create notification for the user
        createNotification(
            users[userIndex].id,
            `Your password has been reset by the administrator. Temporary password: ${tempPassword}`,
            {type: 'password', id: users[userIndex].id}
        );
    }
}

// Save user (add or update)
function saveUser() {
    const userIdInput = document.getElementById('user-id');
    const usernameInput = document.getElementById('username-input');
    const nameInput = document.getElementById('name-input');
    const emailInput = document.getElementById('email-input');
    const roleSelect = document.getElementById('role-select');
    const passwordInput = document.getElementById('password-input');
    
    // Get form values
    const userId = userIdInput.value;
    const username = usernameInput.value.trim();
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const role = roleSelect.value;
    const password = passwordInput.value.trim();
    
    // Validate inputs
    if (!username || !name || !email || !role) {
        alert('Please fill in all required fields');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if username is already taken
    if (!userId && users.some(u => u.username === username)) {
        alert('Username already exists');
        return;
    }
    
    if (userId) {
        // Update existing user
        const userIndex = users.findIndex(u => u.id == userId);
        
        if (userIndex !== -1) {
            users[userIndex].username = username;
            users[userIndex].name = name;
            users[userIndex].email = email;
            users[userIndex].role = role;
            
            // Update password only if provided
            if (password) {
                users[userIndex].password = password;
            }
            
            // Create notification for the user
            createNotification(
                users[userIndex].id,
                `Your account information has been updated by the administrator`,
                {type: 'account', id: users[userIndex].id}
            );
        }
    } else {
        // Add new user
        if (!password) {
            alert('Password is required for new users');
            return;
        }
        
        const newUser = {
            id: Date.now(),
            username: username,
            password: password,
            name: name,
            email: email,
            role: role
        };
        
        users.push(newUser);
    }
    
    // Save users
    localStorage.setItem('users', JSON.stringify(users));
    
    // Hide form and reload user management
    const userFormSection = document.getElementById('user-form-section');
    if (userFormSection) {
        userFormSection.style.display = 'none';
    }
    
    // Show success message
    const successMessage = document.getElementById('user-success-message');
    if (successMessage) {
        successMessage.textContent = `User ${userId ? 'updated' : 'added'} successfully!`;
        successMessage.style.display = 'block';
        
        // Hide success message after 3 seconds
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 3000);
    }
    
    // Reload users table
    loadUserManagement();
}
