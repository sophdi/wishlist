document.addEventListener('DOMContentLoaded', () => {
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const deleteAccountBtn = document.getElementById('delete-account');

  const openMobileMenu = (event) => {
    event.stopPropagation();
    mobileMenu.classList.remove('translate-x-full'); // Відкриває меню
    document.body.style.overflow = 'hidden'; // Забороняє скрол
    mobileMenuToggle.setAttribute('aria-expanded', 'true');
  };

  const closeMobileMenu = (event) => {
    if (event) event.stopPropagation();
    mobileMenu.classList.add('translate-x-full'); // Закриває меню
    document.body.style.overflow = '';
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
  };

  if (mobileMenuToggle && mobileMenuClose && mobileMenu) {
    mobileMenuToggle.addEventListener('click', openMobileMenu);
    mobileMenuClose.addEventListener('click', closeMobileMenu);

    mobileMenu.addEventListener('click', (event) => event.stopPropagation());

    document.addEventListener('click', (event) => {
      if (!mobileMenu.classList.contains('translate-x-full') &&
          !mobileMenu.contains(event.target) &&
          event.target !== mobileMenuToggle) {
        closeMobileMenu();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !mobileMenu.classList.contains('translate-x-full')) {
        closeMobileMenu();
      }
    });
  }

  if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', (event) => {
      event.preventDefault();
      alert('Функція видалення акаунту буде реалізована пізніше');
    });
  }
});
