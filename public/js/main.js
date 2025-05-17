// Mobile menu functionality
document.addEventListener('DOMContentLoaded', () => {
  // Mobile menu toggle
  const mobileMenuButton = document.getElementById('mobileMenuButton');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (mobileMenuButton && mobileMenu) {
    window.toggleMobileMenu = function() {
      mobileMenu.classList.toggle('hidden');
      document.body.classList.toggle('overflow-hidden');
    };
    
    mobileMenuButton.addEventListener('click', toggleMobileMenu);
  }
  
  // Initialize any other UI components
});