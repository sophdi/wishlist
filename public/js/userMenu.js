document.addEventListener('DOMContentLoaded', function() {
  const userMenuButton = document.getElementById('user-menu-button');
  const userDropdown = document.getElementById('user-dropdown');

  // Перемикає видимість випадаючого меню користувача та оновлює aria-атрибут для доступності
  const toggleMenu = () => {
    const isExpanded = userMenuButton.getAttribute('aria-expanded') === 'true';
    userMenuButton.setAttribute('aria-expanded', !isExpanded);
    userDropdown.classList.toggle('hidden');
  };

  // Закриває меню користувача
  const closeMenu = () => {
    userDropdown.classList.add('hidden');
    userMenuButton.setAttribute('aria-expanded', 'false');
  };

  // Відкриває або закриває меню при натисканні на кнопку користувача
  userMenuButton.addEventListener('click', toggleMenu);

  // Закриває меню, якщо користувач клікнув поза межами меню або кнопки
  document.addEventListener('click', function(event) {
    if (!userMenuButton.contains(event.target) && !userDropdown.contains(event.target)) {
      closeMenu();
    }
  });
});