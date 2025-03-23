// Dashboard functionality for all roles

// DOM Elements (will be populated in role-specific pages)
let dashboardStats;
let projectsTable;
let notificationsContainer;

// Initialize dashboard
function initializeDashboard(role) {
    // Get current user
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        window.location.href = '/';
        return;
    }
    
    // Update greeting with user name
    const userGreeting = document.getElementById('user-greeting');
    if (userGreeting) {
        userGreeting.textContent = `Welcome, ${currentUser.name}`;
    }
    
    // Find dashboard elements
    dashboardStats = document.getElementById('dashboard-stats');
    projectsTable = document.getElementById('projects-table');
    notificationsContainer = document.getElementById('notifications-container');
    
    // Load and display stats based on role
    loadDashboardStats(role);
    
    // Load relevant projects
    loadProjects(role);
    
    // Load notifications
    loadNotifications();
    
    // Initialize logout button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logout();
        });
    }
    
    // Role-specific initializations
    switch(role) {
        case 'admin':
            initializeAdminDashboard();
            break;
        case 'student':
            initializeStudentDashboard();
            break;
        case 'hod':
        case 'incharge':
        case 'guide':
            initializeReviewerDashboard(role);
            break;
    }
}

// Load dashboard statistics
function loadDashboardStats(role) {
    if (!dashboardStats) return;
    
    const currentUser = getCurrentUser();
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    let stats = [];
    
    // Common stats for all roles
    stats.push({
        label: 'Notifications',
        value: getUnreadNotificationsCount(currentUser.id)
    });
    
    // Role-specific stats
    switch(role) {
        case 'admin':
            const users = JSON.parse(localStorage.getItem('users')) || [];
            stats.push(
                { label: 'Total Users', value: users.length },
                { label: 'Total Projects', value: projects.length }
            );
            break;
            
        case 'student':
            // Student sees their own projects
            const studentProjects = projects.filter(p => p.studentId === currentUser.id);
            const approvedProjects = studentProjects.filter(p => p.status === 'Approved');
            
            stats.push(
                { label: 'My Projects', value: studentProjects.length },
                { label: 'Approved', value: approvedProjects.length },
                { label: 'Pending', value: studentProjects.length - approvedProjects.length }
            );
            break;
            
        case 'hod':
        case 'incharge':
        case 'guide':
            // Reviewers see projects they need to review
            const pendingReview = projects.filter(p => 
                p.status !== 'Approved' && 
                p.status !== 'Rejected' &&
                ((role === 'guide' && p.currentReviewer === 'guide') ||
                 (role === 'incharge' && p.currentReviewer === 'incharge') ||
                 (role === 'hod' && p.currentReviewer === 'hod'))
            );
            
            stats.push(
                { label: 'Pending Review', value: pendingReview.length },
                { label: 'Total Projects', value: projects.length }
            );
            break;
    }
    
    // Build stat cards HTML
    let statsHTML = '';
    stats.forEach(stat => {
        statsHTML += `
            <div class="stat-card">
                <h3>${stat.label}</h3>
                <p>${stat.value}</p>
            </div>
        `;
    });
    
    dashboardStats.innerHTML = statsHTML;
}

// Initialize the admin dashboard
function initializeAdminDashboard() {
    // Add user management functionality
    const userManagementBtn = document.getElementById('user-management-btn');
    if (userManagementBtn) {
        userManagementBtn.addEventListener('click', function() {
            const userManagementSection = document.getElementById('user-management-section');
            if (userManagementSection) {
                userManagementSection.style.display = 'block';
                loadUserManagement();
            }
        });
    }
}

// Initialize student dashboard
function initializeStudentDashboard() {
    // Add project submission functionality
    const newProjectBtn = document.getElementById('new-project-btn');
    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', function() {
            const projectForm = document.getElementById('project-form-section');
            if (projectForm) {
                projectForm.style.display = 'block';
                
                // Initialize file upload
                initializeFileUpload();
            }
        });
    }
    
    // Add project form submission handler
    const submitProjectBtn = document.getElementById('submit-project-btn');
    if (submitProjectBtn) {
        submitProjectBtn.addEventListener('click', function() {
            submitNewProject();
        });
    }
}

// Initialize reviewer dashboard (HOD, Incharge, Guide)
function initializeReviewerDashboard(role) {
    // Add project review functionality
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('view-project-btn')) {
            const projectId = e.target.getAttribute('data-id');
            viewProjectDetails(projectId, role);
        }
        
        if (e.target && e.target.classList.contains('approve-btn')) {
            const projectId = e.target.getAttribute('data-id');
            approveProject(projectId, role);
        }
        
        if (e.target && e.target.classList.contains('reject-btn')) {
            const projectId = e.target.getAttribute('data-id');
            rejectProject(projectId, role);
        }
    });
    
    // Add comment submission handler
    const submitCommentBtn = document.getElementById('submit-comment-btn');
    if (submitCommentBtn) {
        submitCommentBtn.addEventListener('click', function() {
            const projectId = submitCommentBtn.getAttribute('data-id');
            const commentText = document.getElementById('comment-text').value;
            
            if (commentText.trim() !== '') {
                addComment(projectId, commentText);
            }
        });
    }
}

// View project details
function viewProjectDetails(projectId, role) {
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const project = projects.find(p => p.id == projectId);
    
    if (!project) return;
    
    const projectDetailsSection = document.getElementById('project-details-section');
    if (!projectDetailsSection) return;
    
    // Show project details section
    projectDetailsSection.style.display = 'block';
    
    // Populate project details
    const projectTitle = document.getElementById('project-title');
    const projectAbstract = document.getElementById('project-abstract');
    const projectStatus = document.getElementById('project-status');
    const projectFiles = document.getElementById('project-files');
    const commentsSection = document.getElementById('comments-section');
    const submitCommentBtn = document.getElementById('submit-comment-btn');
    
    if (projectTitle) projectTitle.textContent = project.title;
    if (projectAbstract) projectAbstract.textContent = project.abstract;
    if (projectStatus) projectStatus.innerHTML = buildStatusBadge(project.status);
    
    // Display files
    if (projectFiles && project.files) {
        let filesHTML = '';
        project.files.forEach(file => {
            filesHTML += `
                <div class="uploaded-file">
                    <i class="fas fa-file-alt"></i>
                    <span>${file.name}</span>
                    <div class="file-actions">
                        <button class="action-btn view-btn">View</button>
                    </div>
                </div>
            `;
        });
        projectFiles.innerHTML = filesHTML;
    }
    
    // Show approval/rejection buttons for the correct reviewer
    const approvalActions = document.getElementById('approval-actions');
    if (approvalActions) {
        // Show approval buttons only if this role is the current reviewer
        if (project.currentReviewer === role && project.status !== 'Approved' && project.status !== 'Rejected') {
            approvalActions.innerHTML = `
                <button class="primary-btn approve-btn" data-id="${project.id}">Approve Project</button>
                <button class="danger-btn reject-btn" data-id="${project.id}">Reject Project</button>
            `;
        } else {
            approvalActions.innerHTML = '';
        }
    }
    
    // Display comments
    if (commentsSection && project.comments) {
        let commentsHTML = '';
        project.comments.forEach(comment => {
            commentsHTML += `
                <div class="comment">
                    <div class="comment-header">
                        <span class="comment-author">${comment.author}</span>
                        <span class="comment-time">${formatDateTime(comment.timestamp)}</span>
                    </div>
                    <div class="comment-body">
                        <p>${comment.text}</p>
                    </div>
                </div>
            `;
        });
        commentsSection.innerHTML = commentsHTML;
    }
    
    // Set project ID for comment submission
    if (submitCommentBtn) {
        submitCommentBtn.setAttribute('data-id', project.id);
    }
}

// Add a comment to a project
function addComment(projectId, commentText) {
    const currentUser = getCurrentUser();
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const projectIndex = projects.findIndex(p => p.id == projectId);
    
    if (projectIndex === -1) return;
    
    // Add comment to project
    if (!projects[projectIndex].comments) {
        projects[projectIndex].comments = [];
    }
    
    const comment = {
        id: Date.now(),
        author: currentUser.name,
        authorId: currentUser.id,
        text: commentText,
        timestamp: new Date().toISOString()
    };
    
    projects[projectIndex].comments.push(comment);
    
    // Save updated projects
    localStorage.setItem('projects', JSON.stringify(projects));
    
    // Create notification for the student
    createNotification(
        projects[projectIndex].studentId,
        `New comment on your project "${projects[projectIndex].title}" from ${currentUser.name}`,
        {type: 'project', id: projectId}
    );
    
    // Refresh comments section
    viewProjectDetails(projectId, currentUser.role);
    
    // Clear comment text area
    const commentTextArea = document.getElementById('comment-text');
    if (commentTextArea) {
        commentTextArea.value = '';
    }
}
