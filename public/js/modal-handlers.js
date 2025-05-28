// public/js/wishlist-modals.js
document.addEventListener('DOMContentLoaded', function () {
  // Базові функції для відкриття/закриття модальних вікон
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

  // Глобальні функції для доступу з HTML
  window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.style.overflow = 'hidden';
    }
  };

  window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.style.overflow = 'auto';
    }
  };

  // Модальні вікна для списків бажань
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

  // Модальні вікна для бажань
  window.openCreateWishModal = function() {
    openModal('createWishModal');
  };

  window.closeCreateWishModal = function() {
    closeModal('createWishModal');
  };

  window.openDeleteWishModal = function(deleteUrl) {
    const confirmDeleteForm = document.getElementById('confirmDeleteWishForm');
    if (confirmDeleteForm) {
      // Очікуємо deleteUrl типу /wishlists/:wishlistId/wishes/:wishId
      confirmDeleteForm.action = deleteUrl;
    }
    openModal('confirmDeleteWishModal');
  };

  window.closeDeleteWishModal = function() {
    closeModal('deleteWishModal');
  };

  window.openEditWishModal = function(
    id,
    title,
    description,
    price,
    currency,
    priority,
    link
  ) {
    const editForm = document.getElementById('editWishForm');
    if (editForm) {
      // Оновлюємо action форми на актуальний id
      const actionRegex = /\/wishes\/edit\/\d+/;
      editForm.action = editForm.action.replace(actionRegex, `/wishes/edit/${id}`);

      // Безпечне заповнення полів
      const setValue = (selector, value) => {
        const el = document.getElementById(selector);
        if (el) el.value = value || '';
      };
      setValue('editWishTitle', title);
      setValue('editWishDescription', description);
      setValue('editWishPrice', price);
      setValue('editWishCurrency', currency || 'UAH');
      setValue('editWishPriority', priority || 'medium');
      setValue('editWishLink', link);
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

// Модальні вікна для створення списку бажань
  window.openCreateModal = function() {
    openModal('createModal');
  };

  window.closeCreateModal = function() {
    closeModal('createModal');
  };

  // Модальне вікно підтвердження виходу
  window.openLogoutConfirmModal = function() {
    // Якщо відкрите мобільне меню — спочатку закриваємо його
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
      if (typeof window.toggleMobileMenu === 'function') {
        window.toggleMobileMenu();
      }
    }
    
    openModal('logoutConfirmModal');
  };

  window.closeLogoutConfirmModal = function() {
    closeModal('logoutConfirmModal');
  };

  // Додаємо обробники для всіх модальних вікон
  const modals = document.querySelectorAll('.fixed.inset-0');
  modals.forEach(modal => {
    const modalId = modal.id;
    
    // Закриття при кліку на фон
    modal.addEventListener('click', function(e) {
      if (e.target === this || e.target.classList.contains('absolute') && e.target.classList.contains('inset-0')) {
        window.closeModal(modalId);
      }
    });
    
    // Кнопка закриття (іконка хрестика)
    const closeButton = modal.querySelector('button[class*="text-gray-500"]');
    if (closeButton) {
      closeButton.addEventListener('click', function() {
        window.closeModal(modalId);
      });
    }
  });

  // Закриття модального вікна по Escape
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      const openModal = document.querySelector('.fixed.inset-0:not(.hidden)');
      if (openModal) {
        window.closeModal(openModal.id);
      }
    }
  });

  // Перехоплення кліків по посиланнях видалення бажання
  const deleteLinks = document.querySelectorAll('a[href*="/wishes/delete/"]');
  deleteLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      window.openConfirmDeleteWishModal(this.href);
    });
  });
});