//public/js/main.js
// Функціонал мобільного меню
document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuButton = document.getElementById('mobileMenuButton');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (mobileMenuButton && mobileMenu) {
    window.toggleMobileMenu = function() {
      mobileMenu.classList.toggle('hidden');
      document.body.classList.toggle('overflow-hidden');
    };
    
    mobileMenuButton.addEventListener('click', toggleMobileMenu);
  }
  
  // Тут можна ініціалізувати інші UI-компоненти
});