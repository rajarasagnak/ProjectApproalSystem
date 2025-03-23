// File upload functionality

// Initialize file upload
function initializeFileUpload() {
    const fileUploadContainer = document.getElementById('file-upload-container');
    if (!fileUploadContainer) return;
    
    // Create initial file input
    addFileInput();
    
    // Add button to add more file inputs
    const addFileBtn = document.getElementById('add-file-btn');
    if (addFileBtn) {
        addFileBtn.addEventListener('click', function() {
            addFileInput();
        });
    }
}

// Add a new file input
function addFileInput() {
    const fileUploadContainer = document.getElementById('file-upload-container');
    if (!fileUploadContainer) return;
    
    // Create unique ID for the file input
    const fileInputId = 'file-input-' + Date.now();
    
    // Create file input HTML
    const fileInputHTML = `
        <div class="file-input-group">
            <input type="file" id="${fileInputId}" class="file-input" accept=".pdf,.doc,.docx,.txt,.zip">
            <label for="${fileInputId}" class="file-label">Choose file</label>
            <span class="file-name">No file chosen</span>
            <button type="button" class="remove-file-btn"><i class="fas fa-times"></i></button>
        </div>
    `;
    
    // Add to container
    fileUploadContainer.insertAdjacentHTML('beforeend', fileInputHTML);
    
    // Add event listeners for the new file input
    const fileInput = document.getElementById(fileInputId);
    const fileNameDisplay = fileInput.nextElementSibling.nextElementSibling;
    const removeBtn = fileInput.parentElement.querySelector('.remove-file-btn');
    
    // Update file name when file is selected
    fileInput.addEventListener('change', function() {
        if (fileInput.files && fileInput.files[0]) {
            fileNameDisplay.textContent = fileInput.files[0].name;
        } else {
            fileNameDisplay.textContent = 'No file chosen';
        }
    });
    
    // Remove file input when remove button is clicked
    removeBtn.addEventListener('click', function() {
        fileInput.parentElement.remove();
    });
}

// Clear all file inputs
function clearFileInputs() {
    const fileUploadContainer = document.getElementById('file-upload-container');
    if (!fileUploadContainer) return;
    
    // Remove all file inputs
    fileUploadContainer.innerHTML = '';
    
    // Add one empty input
    addFileInput();
}
