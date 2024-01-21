// Function to show the selected section and hide others
function showSection(sectionId, tabId) {
    // Hide all sections
    document.getElementById('analytics-section').style.display = 'none';
    document.getElementById('user-section').style.display = 'none';
    document.getElementById('feedback-section').style.display = 'none';

    // Remove "active" class from all tabs and reset styles
    resetStyles('analytics-tab');
    resetStyles('user-tab');
    resetStyles('feedback-tab');

    // Show the selected section
    document.getElementById(sectionId).style.display = 'block';

    // Set styles for the clicked tab
    var selectedTab = document.getElementById(tabId);
    selectedTab.classList.add('active');
    selectedTab.style.color = 'green'; // Set text color (change to your preferred color)
    selectedTab.style.backgroundColor = '#f5f5f5'; 
}

// Function to reset styles for a tab
function resetStyles(tabId) {
    var tab = document.getElementById(tabId);
    tab.classList.remove('active');
    tab.style.color = ''; // Reset text color
    tab.style.backgroundColor = ''; // Reset background color
}

// Add click event listeners to the navigation tabs
document.getElementById('analytics-tab').addEventListener('click', function () {
    showSection('analytics-section', 'analytics-tab');
});

document.getElementById('user-tab').addEventListener('click', function () {
    showSection('user-section', 'user-tab');
});

document.getElementById('feedback-tab').addEventListener('click', function () {
    showSection('feedback-section', 'feedback-tab');
});

// Show the Analytics section by default when the page loads
showSection('analytics-section', 'analytics-tab');
