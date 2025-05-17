// public/js/wishlist-modals.js
document.addEventListener('DOMContentLoaded', function () {
  // Modal functionality
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.classList.add('overflow-hidden');
    }
  }

  function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.classList.remove('overflow-hidden');
    }
  }

  // Глобальна функція відкриття модального вікна
  window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.style.overflow = 'hidden';
    }
  };

  // Глобальна функція закриття модального вікна
  window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = 'auto';
    }
  };

  // Функції для роботи з вішлістами
  window.openEditWishlistModal = function() {
    openModal('editWishlistModal');
  };

  window.closeEditWishlistModal = function() {
    closeModal('editWishlistModal');
  };

  window.openDeleteConfirmModal = function() {
    closeEditWishlistModal();
    openModal('deleteWishlistConfirmModal');
  };

  window.closeDeleteConfirmModal = function() {
    closeModal('deleteWishlistConfirmModal');
  };

  // Функції для роботи з бажаннями
  window.openCreateWishModal = function() {
    openModal('createWishModal');
  };

  window.closeCreateWishModal = function() {
    closeModal('createWishModal');
  };

  window.openDeleteWishModal = function(deleteUrl) {
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) confirmDeleteBtn.href = deleteUrl;
    openModal('deleteWishModal');
  };

  window.closeDeleteWishModal = function() {
    closeModal('deleteWishModal');
  };

  window.openEditWishModal = function(id, title, description, priority, targetDate, link) {
    const editForm = document.getElementById('editWishForm');
    if (editForm) {
      // Оновлення action форми з правильним ID
      const currentAction = editForm.action;
      const newAction = currentAction.replace(/\/edit\/\d+/, `/edit/${id}`);
      editForm.action = newAction;
      
      // Заповнення полів форми
      document.getElementById('wishTitle').value = title || '';
      document.getElementById('wishDescription').value = description || '';
      
      // Додаткові поля, якщо вони існують
      const priorityField = document.getElementById('wishPriority');
      const dateField = document.getElementById('wishTargetDate');
      const linkField = document.getElementById('wishLink');
      
      if (priorityField && priority) priorityField.value = priority;
      if (dateField && targetDate) dateField.value = targetDate;
      if (linkField && link) linkField.value = link;
    }
    
    openModal('editWishModal');
  };

  window.openConfirmDeleteWishModal = function(deleteUrl) {
    const confirmBtn = document.getElementById('confirmDeleteWishBtn');
    if (confirmBtn) confirmBtn.href = deleteUrl;
    openModal('confirmDeleteWishModal');
  };

  window.closeConfirmDeleteWishModal = function() {
    closeModal('confirmDeleteWishModal');
  };

  // Функції для створення списку бажань
  window.openCreateModal = function() {
    openModal('createModal');
  };

  window.closeCreateModal = function() {
    closeModal('createModal');
  };

  // Функції для модального вікна виходу
  window.openLogoutConfirmModal = function() {
    // Close mobile menu if it's open
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
      // Use the global toggle function
      if (typeof window.toggleMobileMenu === 'function') {
        window.toggleMobileMenu();
      }
    }
    
    openModal('logoutConfirmModal');
  };

  window.closeLogoutConfirmModal = function() {
    closeModal('logoutConfirmModal');
  };

  // Ініціалізація обробників подій для всіх модальних вікон
  const modals = document.querySelectorAll('.fixed.inset-0');
  modals.forEach(modal => {
    const modalId = modal.id;
    
    // Закриття при кліку на затемнений фон
    modal.addEventListener('click', function(e) {
      if (e.target === this || e.target.classList.contains('absolute') && e.target.classList.contains('inset-0')) {
        window.closeModal(modalId);
      }
    });
    
    // Знаходимо кнопку закриття у цьому модальному вікні
    const closeButton = modal.querySelector('button[class*="text-gray-500"]');
    if (closeButton) {
      closeButton.addEventListener('click', function() {
        window.closeModal(modalId);
      });
    }
  });

  // Закриття по клавіші Escape
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      const openModal = document.querySelector('.fixed.inset-0:not(.hidden)');
      if (openModal) {
        window.closeModal(openModal.id);
      }
    }
  });

  // Перехоплення посилань видалення
  const deleteLinks = document.querySelectorAll('a[href*="/wishes/delete/"]');
  deleteLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      window.openConfirmDeleteWishModal(this.href);
    });
  });
});