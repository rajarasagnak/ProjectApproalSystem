// Projects functionality

// Load projects based on role
function loadProjects(role) {
    if (!projectsTable) return;
    
    const currentUser = getCurrentUser();
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    let filteredProjects = [];
    
    // Filter projects based on role
    switch(role) {
        case 'admin':
            // Admin sees all projects
            filteredProjects = projects;
            break;
            
        case 'student':
            // Student sees only their projects
            filteredProjects = projects.filter(p => p.studentId === currentUser.id);
            break;
            
        case 'guide':
            // Guide sees projects where they are assigned as guide or current reviewer
            filteredProjects = projects.filter(p => 
                p.guideId === currentUser.id || 
                (p.currentReviewer === 'guide' && p.status !== 'Approved' && p.status !== 'Rejected')
            );
            break;
            
        case 'incharge':
            // Incharge sees projects waiting for their review or already reviewed
            filteredProjects = projects.filter(p => 
                p.currentReviewer === 'incharge' || 
                p.status === 'Approved by Incharge' ||
                p.status === 'Rejected by Incharge'
            );
            break;
            
        case 'hod':
            // HOD sees projects waiting for their review or already reviewed
            filteredProjects = projects.filter(p => 
                p.currentReviewer === 'hod' || 
                p.status === 'Approved' ||
                p.status === 'Rejected by HOD'
            );
            break;
    }
    
    // Build projects table
    let projectsHTML = `
        <table class="projects-table">
            <tr>
                <th>Title</th>
                <th>Submitted By</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
    `;
    
    if (filteredProjects.length === 0) {
        projectsHTML += `
            <tr>
                <td colspan="5" class="text-center">No projects found</td>
            </tr>
        `;
    } else {
        filteredProjects.forEach(project => {
            const submittedDate = formatDateTime(project.submittedDate);
            const user = getUserById(project.studentId);
            const studentName = user ? user.name : 'Unknown';
            
            projectsHTML += `
                <tr>
                    <td>${project.title}</td>
                    <td>${studentName}</td>
                    <td>${submittedDate}</td>
                    <td>${buildStatusBadge(project.status)}</td>
                    <td class="action-btns">
                        <button class="action-btn view-btn view-project-btn" data-id="${project.id}">View</button>
                        ${role !== 'student' && project.currentReviewer === role && project.status !== 'Approved' && project.status !== 'Rejected' ? 
                            `<button class="action-btn approve-btn" data-id="${project.id}">Approve</button>
                             <button class="action-btn reject-btn" data-id="${project.id}">Reject</button>` 
                            : ''}
                    </td>
                </tr>
            `;
        });
    }
    
    projectsHTML += `</table>`;
    projectsTable.innerHTML = projectsHTML;
}

// Get user by ID
function getUserById(userId) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users.find(u => u.id === userId);
}

// Submit a new project (for students)
function submitNewProject() {
    const currentUser = getCurrentUser();
    
    // Get form values
    const title = document.getElementById('project-title-input').value.trim();
    const abstract = document.getElementById('project-abstract-input').value.trim();
    const fileInputs = document.querySelectorAll('.file-input');
    
    // Validate inputs
    if (!title) {
        showFormError('Please enter a project title');
        return;
    }
    
    if (!abstract) {
        showFormError('Please enter a project abstract');
        return;
    }
    
    // Create project object
    const newProject = {
        id: Date.now(),
        title: title,
        abstract: abstract,
        studentId: currentUser.id,
        submittedDate: new Date().toISOString(),
        status: 'Pending Guide Approval',
        currentReviewer: 'guide',
        files: [],
        comments: []
    };
    
    // Process files
    Array.from(fileInputs).forEach(input => {
        if (input.files && input.files[0]) {
            const file = input.files[0];
            
            // Store file metadata (we can't actually store the files in localStorage)
            newProject.files.push({
                name: file.name,
                type: file.type,
                size: file.size,
                lastModified: file.lastModified
            });
        }
    });
    
    // Save project
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    projects.push(newProject);
    localStorage.setItem('projects', JSON.stringify(projects));
    
    // Create notification for the student
    createNotification(
        currentUser.id,
        `Your project "${title}" has been submitted for approval`,
        {type: 'project', id: newProject.id}
    );
    
    // Create notification for the guides
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const guides = users.filter(u => u.role === 'guide');
    guides.forEach(guide => {
        createNotification(
            guide.id,
            `New project "${title}" submitted by ${currentUser.name} requires your review`,
            {type: 'project', id: newProject.id}
        );
    });
    
    // Hide form and show success message
    const projectFormSection = document.getElementById('project-form-section');
    if (projectFormSection) {
        projectFormSection.style.display = 'none';
    }
    
    const successMessage = document.getElementById('success-message');
    if (successMessage) {
        successMessage.textContent = 'Project submitted successfully!';
        successMessage.style.display = 'block';
        
        // Hide success message after 3 seconds
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 3000);
    }
    
    // Reload projects
    loadProjects('student');
    loadDashboardStats('student');
}

// Approve a project
function approveProject(projectId, role) {
    const currentUser = getCurrentUser();
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const projectIndex = projects.findIndex(p => p.id == projectId);
    
    if (projectIndex === -1) return;
    
    // Update project status and reviewer based on current role
    switch(role) {
        case 'guide':
            projects[projectIndex].status = 'Approved by Guide';
            projects[projectIndex].currentReviewer = 'incharge';
            // Notify project incharge
            notifyReviewers('incharge', projects[projectIndex]);
            break;
            
        case 'incharge':
            projects[projectIndex].status = 'Approved by Incharge';
            projects[projectIndex].currentReviewer = 'hod';
            // Notify HOD
            notifyReviewers('hod', projects[projectIndex]);
            break;
            
        case 'hod':
            projects[projectIndex].status = 'Approved';
            projects[projectIndex].currentReviewer = null;
            break;
    }
    
    // Add approval comment
    if (!projects[projectIndex].comments) {
        projects[projectIndex].comments = [];
    }
    
    projects[projectIndex].comments.push({
        id: Date.now(),
        author: currentUser.name,
        authorId: currentUser.id,
        text: `Project ${projects[projectIndex].status === 'Approved' ? 'approved' : 'approved and sent for next level review'}.`,
        timestamp: new Date().toISOString()
    });
    
    // Save updated projects
    localStorage.setItem('projects', JSON.stringify(projects));
    
    // Create notification for the student
    createNotification(
        projects[projectIndex].studentId,
        `Your project "${projects[projectIndex].title}" has been ${projects[projectIndex].status}`,
        {type: 'project', id: projectId}
    );
    
    // Refresh project details
    viewProjectDetails(projectId, role);
    
    // Reload projects table and stats
    loadProjects(role);
    loadDashboardStats(role);
}

// Reject a project
function rejectProject(projectId, role) {
    const currentUser = getCurrentUser();
    const projects = JSON.parse(localStorage.getItem('projects')) || [];
    const projectIndex = projects.findIndex(p => p.id == projectId);
    
    if (projectIndex === -1) return;
    
    // Update project status
    projects[projectIndex].status = `Rejected by ${role.charAt(0).toUpperCase() + role.slice(1)}`;
    projects[projectIndex].currentReviewer = null;
    
    // Add rejection comment
    if (!projects[projectIndex].comments) {
        projects[projectIndex].comments = [];
    }
    
    projects[projectIndex].comments.push({
        id: Date.now(),
        author: currentUser.name,
        authorId: currentUser.id,
        text: `Project rejected. Please review comments and resubmit.`,
        timestamp: new Date().toISOString()
    });
    
    // Save updated projects
    localStorage.setItem('projects', JSON.stringify(projects));
    
    // Create notification for the student
    createNotification(
        projects[projectIndex].studentId,
        `Your project "${projects[projectIndex].title}" has been rejected by ${currentUser.name}`,
        {type: 'project', id: projectId}
    );
    
    // Refresh project details
    viewProjectDetails(projectId, role);
    
    // Reload projects table and stats
    loadProjects(role);
    loadDashboardStats(role);
}

// Notify reviewers about a project that needs their attention
function notifyReviewers(role, project) {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const reviewers = users.filter(u => u.role === role);
    
    reviewers.forEach(reviewer => {
        createNotification(
            reviewer.id,
            `Project "${project.title}" requires your review`,
            {type: 'project', id: project.id}
        );
    });
}

// Show form error message
function showFormError(message) {
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        
        // Clear error after 3 seconds
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }
}
