//public/js/wishlist-modals.js
// Функції для модальних вікон вішліста
// Функція для відкриття модального вікна
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }
}

// Функція для закриття модального вікна
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';
  }
}

// Редагування вішліста
function openEditWishlistModal() {
  openModal('editWishlistModal');
}

function closeEditWishlistModal() {
  closeModal('editWishlistModal');
}

// Видалення вішліста
function openDeleteConfirmModal() {
  closeEditWishlistModal();
  openModal('deleteWishlistConfirmModal');
}

function closeDeleteConfirmModal() {
  closeModal('deleteWishlistConfirmModal');
}

// Створення бажання
function openCreateWishModal() {
  openModal('createWishModal');
}

function closeCreateWishModal() {
  closeModal('createWishModal');
}

// Видалення бажання
function openDeleteWishModal(deleteUrl) {
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  confirmDeleteBtn.href = deleteUrl;
  openModal('deleteWishModal');
}

function closeDeleteWishModal() {
  closeModal('deleteWishModal');
}

// Редагування бажання
function openEditWishModal(id, title, description, priority, targetDate, link) {
  // Відкриття модального вікна редагування бажання
  // TODO: доробить
  console.log('Editing wish:', {
    id,
    title,
    description,
    priority,
    targetDate,
    link,
  });
}

// Додаємо функцію для видалення бажання з підтвердженням
function openConfirmDeleteWishModal(deleteUrl) {
  const confirmDeleteBtn = document.getElementById('confirmDeleteWishBtn');
  confirmDeleteBtn.href = deleteUrl;
  openModal('confirmDeleteWishModal');
}

// Закриття модального вікна видалення бажання
function closeConfirmDeleteWishModal() {
  closeModal('confirmDeleteWishModal');
}

// Ініціалізація при завантаженні сторінки
document.addEventListener('DOMContentLoaded', function () {
  // Масив усіх модальних вікон
  const modals = [
    'editWishlistModal',
    'deleteWishlistConfirmModal',
    'createWishModal',
    'deleteWishModal',
    'confirmDeleteWishModal'
  ];

  // Налаштовуємо обробники для всіх модальних вікон
  modals.forEach((modalId) => {
    const modal = document.getElementById(modalId);
    if (!modal) return; // Пропускаємо, якщо елемент не існує

    // Закриття при кліці на затемнений фон
    modal.addEventListener('click', function (e) {
      // Перевіряємо, що клік був саме на фоні або на самому модальному вікні,
      // а не на його вмісті
      if (e.target === this || e.target === this.querySelector('.absolute.inset-0')) {
        closeModal(modalId);
      }
    });
  });

  // Закриття по клавіші Escape
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      modals.forEach((modalId) => {
        const modal = document.getElementById(modalId);
        if (modal && !modal.classList.contains('hidden')) {
          closeModal(modalId);
        }
      });
    }
  });

  // Налаштовуємо кнопку скасування у модальному вікні підтвердження видалення
  const cancelDeleteBtn = document.getElementById('cancelDeleteWishBtn');
  if (cancelDeleteBtn) {
    cancelDeleteBtn.onclick = function () {
      closeConfirmDeleteWishModal();
    };
  }

  // Перехоплення посилань видалення
  const deleteLinks = document.querySelectorAll('a[href*="/wishes/delete/"]');
  deleteLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      openConfirmDeleteWishModal(this.href);
    });
  });
});