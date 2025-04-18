// Initialize projects array from localStorage
let projects = JSON.parse(localStorage.getItem('projects')) || [];

function submitProject(event) {
    event.preventDefault();

    const project = {
        id: Date.now(),
        studentName: document.getElementById('studentName').value,
        studentId: document.getElementById('studentId').value,
        projectTitle: document.getElementById('projectTitle').value,
        projectDescription: document.getElementById('projectDescription').value,
        supervisor: document.getElementById('supervisor').value,
        branch: document.getElementById('branch').value,
        status: 'pending',
        submissionDate: new Date().toLocaleDateString()
    };

    projects.push(project);
    localStorage.setItem('projects', JSON.stringify(projects));
    
    // Show success message
    const successMessage = document.getElementById('successMessage');
    successMessage.textContent = 'Project submitted successfully!';
    successMessage.classList.remove('hidden');
    
    // Reset form
    event.target.reset();

    // Hide success message after 3 seconds
    setTimeout(() => {
        successMessage.classList.add('hidden');
    }, 3000);
}