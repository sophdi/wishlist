// public/js/wishlist-view.js
// TODO: Я ЦЕ ПРИБРАЛА З КОДУ ПОКИ 
document.addEventListener('DOMContentLoaded', function () {
    // Елементи для перемикання виду
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    const wishlistContainer = document.getElementById('wishlistContainer');

    // Вихід, якщо елементи не знайдені
    if (!gridViewBtn || !listViewBtn || !wishlistContainer) {
        return; 
    }
    // Перемикає вигляд списку
    function updateView(view) {
        if (view === 'grid') {
            wishlistContainer.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
            gridViewBtn.classList.add('bg-gray-200');
            gridViewBtn.classList.remove('hover:bg-gray-100');
            listViewBtn.classList.remove('bg-gray-200');
            listViewBtn.classList.add('hover:bg-gray-100');
        } else {
            wishlistContainer.className = 'space-y-4';
            listViewBtn.classList.add('bg-gray-200');
            listViewBtn.classList.remove('hover:bg-gray-100');
            gridViewBtn.classList.remove('bg-gray-200');
            gridViewBtn.classList.add('hover:bg-gray-100');
        }
        localStorage.setItem('wishlistView', view);
    }

    // Встановити обробники подій
    gridViewBtn.addEventListener('click', () => updateView('grid'));
    listViewBtn.addEventListener('click', () => updateView('list'));

    // Відновлення попереднього вибору
    const savedView = localStorage.getItem('wishlistView') || 'grid';
    updateView(savedView);
});