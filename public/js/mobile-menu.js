// public/js/mobile-menu.js
document.addEventListener('DOMContentLoaded', function () {
  // Отримуємо елементи для мобільного меню
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const mobileMenu = document.getElementById('mobile-menu');

  // Відкриття мобільного меню
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenu.classList.remove('translate-x-full');
      document.body.style.overflow = 'hidden'; // Блокуємо прокрутку сторінки
      mobileMenuToggle.setAttribute('aria-expanded', 'true');
    });
  }

  // Закриття мобільного меню
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', () => {
      mobileMenu.classList.add('translate-x-full');
      document.body.style.overflow = ''; // Відновлюємо прокрутку сторінки
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
    });
  }

  // Функціональність випадаючого меню користувача
  const userMenuToggle = document.getElementById('user-menu-toggle');
  const userDropdown = document.getElementById('user-dropdown');

  if (userMenuToggle && userDropdown) {
    userMenuToggle.addEventListener('click', () => {
      const expanded = userMenuToggle.getAttribute('aria-expanded') === 'true';
      userMenuToggle.setAttribute('aria-expanded', !expanded);
      userDropdown.classList.toggle('opacity-0');
      userDropdown.classList.toggle('invisible');
    });

    // Закриття меню по кліку поза ним
    document.addEventListener('click', (event) => {
      if (!userMenuToggle.contains(event.target) && !userDropdown.contains(event.target)) {
        userMenuToggle.setAttribute('aria-expanded', 'false');
        userDropdown.classList.add('opacity-0');
        userDropdown.classList.add('invisible');
      }
    });
  }
});