// public/js/mobile-menu.js

document.addEventListener('DOMContentLoaded', function () {
  // Елементи мобільного меню
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const mobileMenu = document.getElementById('mobile-menu');

  // Відкрити мобільне меню
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileMenu.classList.remove('translate-x-full');
      document.body.style.overflow = 'hidden';
      mobileMenuToggle.setAttribute('aria-expanded', 'true');
    });
  }

  // Закрити мобільне меню
  function closeMobileMenu() {
    mobileMenu.classList.add('translate-x-full');
    document.body.style.overflow = '';
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
  }

  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMobileMenu);
  }

  // Додаємо закриття по кліку поза меню (якщо потрібно)
  document.addEventListener('click', (event) => {
    if (
      mobileMenu &&
      !mobileMenu.classList.contains('translate-x-full') &&
      !mobileMenu.contains(event.target) &&
      event.target !== mobileMenuToggle
    ) {
      closeMobileMenu();
    }
  });

  // Випадаюче меню користувача
  const userMenuToggle = document.getElementById('user-menu-toggle');
  const userDropdown = document.getElementById('user-dropdown');

  if (userMenuToggle && userDropdown) {
    userMenuToggle.addEventListener('click', () => {
      const expanded = userMenuToggle.getAttribute('aria-expanded') === 'true';
      userMenuToggle.setAttribute('aria-expanded', !expanded);
      userDropdown.classList.toggle('opacity-0');
      userDropdown.classList.toggle('invisible');
    });

    // Закрити меню при кліку поза ним
    document.addEventListener('click', (event) => {
      if (!userMenuToggle.contains(event.target) && !userDropdown.contains(event.target)) {
        userMenuToggle.setAttribute('aria-expanded', 'false');
        userDropdown.classList.add('opacity-0');
        userDropdown.classList.add('invisible');
      }
    });
  }
});