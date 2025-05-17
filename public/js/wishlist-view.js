document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const container = document.getElementById('wishlistsContainer');
    const gridButton = document.querySelector('[data-view="grid"]');
    const listButton = document.querySelector('[data-view="list"]');

    // Initialize view from localStorage or default to grid
    const savedView = localStorage.getItem('wishlistView') || 'grid';
    updateView(savedView);

    // Add click handlers
    gridButton.addEventListener('click', () => updateView('grid'));
    listButton.addEventListener('click', () => updateView('list'));

    function updateView(view) {
        // Update container class
        container.className = view === 'grid' ? 'grid-mode' : 'list-mode';

        // Update wishlist items
        document.querySelectorAll('.wishlist-item').forEach(item => {
            item.className = `wishlist-item ${view}-view`;
        });

        // Update button states
        gridButton.classList.toggle('active', view === 'grid');
        gridButton.classList.toggle('bg-gray-200', view === 'grid');
        listButton.classList.toggle('active', view === 'list');
        listButton.classList.toggle('bg-gray-200', view === 'list');

        // Save preference
        localStorage.setItem('wishlistView', view);
    }
});