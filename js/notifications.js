// Notifications functionality

// Load notifications for current user
function loadNotifications() {
    if (!notificationsContainer) return;
    
    const currentUser = getCurrentUser();
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    
    // Filter notifications for current user
    const userNotifications = notifications.filter(n => n.userId === currentUser.id)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Build notifications HTML
    let notificationsHTML = '';
    
    if (userNotifications.length === 0) {
        notificationsHTML = '<p class="text-center">No notifications</p>';
    } else {
        userNotifications.forEach(notification => {
            notificationsHTML += `
                <div class="notification ${!notification.read ? 'notification-unread' : ''}" data-id="${notification.id}">
                    <div class="notification-content">
                        <p>${notification.message}</p>
                        <div class="notification-time">${formatDateTime(notification.timestamp)}</div>
                    </div>
                    ${!notification.read ? '<button class="mark-read-btn">Mark as Read</button>' : ''}
                </div>
            `;
        });
    }
    
    notificationsContainer.innerHTML = notificationsHTML;
    
    // Add event listeners for mark as read buttons
    const markReadButtons = document.querySelectorAll('.mark-read-btn');
    markReadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const notificationId = e.target.closest('.notification').getAttribute('data-id');
            markNotificationAsRead(notificationId);
            
            // Remove the button and update notification styling
            e.target.remove();
            e.target.closest('.notification').classList.remove('notification-unread');
            
            // Update unread count in stats
            loadDashboardStats(currentUser.role);
        });
    });
    
    // Add event listeners for clickable notifications with related content
    const notificationElements = document.querySelectorAll('.notification');
    notificationElements.forEach(element => {
        element.addEventListener('click', function(e) {
            // Only handle clicks on the notification content, not the mark read button
            if (!e.target.classList.contains('mark-read-btn')) {
                const notificationId = element.getAttribute('data-id');
                const notification = userNotifications.find(n => n.id == notificationId);
                
                if (notification && notification.relatedTo) {
                    // Handle navigation based on related content
                    if (notification.relatedTo.type === 'project') {
                        viewProjectDetails(notification.relatedTo.id, currentUser.role);
                    }
                    
                    // Mark as read if clicked
                    if (!notification.read) {
                        markNotificationAsRead(notificationId);
                        element.classList.remove('notification-unread');
                        const markReadBtn = element.querySelector('.mark-read-btn');
                        if (markReadBtn) markReadBtn.remove();
                        
                        // Update unread count in stats
                        loadDashboardStats(currentUser.role);
                    }
                }
            }
        });
    });
}

// Mark notification as read
function markNotificationAsRead(notificationId) {
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    const notificationIndex = notifications.findIndex(n => n.id == notificationId);
    
    if (notificationIndex !== -1) {
        notifications[notificationIndex].read = true;
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }
}

// Mark all notifications as read
function markAllNotificationsAsRead() {
    const currentUser = getCurrentUser();
    const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
    
    // Mark all user's notifications as read
    notifications.forEach(notification => {
        if (notification.userId === currentUser.id) {
            notification.read = true;
        }
    });
    
    localStorage.setItem('notifications', JSON.stringify(notifications));
    
    // Reload notifications
    loadNotifications();
    
    // Update stats to show 0 unread
    loadDashboardStats(currentUser.role);
}
