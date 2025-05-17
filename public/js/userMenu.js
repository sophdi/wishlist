document.addEventListener('DOMContentLoaded', function() {
    const userMenuButton = document.getElementById('user-menu-button');
    const userDropdown = document.getElementById('user-dropdown');

    // Функція для відкриття/закриття меню
    const toggleMenu = () => {
        const isExpanded = userMenuButton.getAttribute('aria-expanded') === 'true';
        userMenuButton.setAttribute('aria-expanded', !isExpanded);
        userDropdown.classList.toggle('hidden');
    };

    // Функція для закриття меню
    const closeMenu = () => {
        userDropdown.classList.add('hidden');
        userMenuButton.setAttribute('aria-expanded', 'false');
    };

    // Обробник кліку по кнопці меню
    userMenuButton.addEventListener('click', toggleMenu);

    // Закриваємо меню при кліку поза ним
    document.addEventListener('click', function(event) {
        if (!userMenuButton.contains(event.target) && !userDropdown.contains(event.target)) {
            closeMenu();
        }
    });
});