// Функції для модальних вікон вішліста

// Редагування вішліста
function openEditWishlistModal() {
  document.getElementById('editWishlistModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeEditWishlistModal() {
  document.getElementById('editWishlistModal').classList.add('hidden');
  document.body.style.overflow = 'auto';
}

// Видалення вішліста
function openDeleteConfirmModal() {
  closeEditWishlistModal();
  document
    .getElementById('deleteWishlistConfirmModal')
    .classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeDeleteConfirmModal() {
  document.getElementById('deleteWishlistConfirmModal').classList.add('hidden');
  document.body.style.overflow = 'auto';
}

// Створення бажання
function openCreateWishModal() {
  document.getElementById('createWishModal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeCreateWishModal() {
  document.getElementById('createWishModal').classList.add('hidden');
  document.body.style.overflow = 'auto';
}

// Видалення бажання
function openDeleteWishModal(deleteUrl) {
  const deleteModal = document.getElementById('deleteWishModal');
  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

  confirmDeleteBtn.href = deleteUrl;
  deleteModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeDeleteWishModal() {
  const deleteModal = document.getElementById('deleteWishModal');
  deleteModal.classList.add('hidden');
  document.body.style.overflow = 'auto';
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

// Закриття модальних вікон при кліці
document.addEventListener('DOMContentLoaded', function () {
  // Масив усіх модальних вікон
  const modals = [
    'editWishlistModal',
    'deleteWishlistConfirmModal',
    'createWishModal',
    'deleteWishModal',
  ];

  modals.forEach((modalId) => {
    const modal = document.getElementById(modalId);

    // Закриття при кліці поза модальним вікном
    modal.addEventListener('click', function (e) {
      if (e.target === this) {
        this.classList.add('hidden');
        document.body.style.overflow = 'auto';
      }
    });
  });

  // Закриття по клавіші Escape
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      modals.forEach((modalId) => {
        const modal = document.getElementById(modalId);
        if (!modal.classList.contains('hidden')) {
          modal.classList.add('hidden');
          document.body.style.overflow = 'auto';
        }
      });
    }
  });
});

// Додаємо функцію для видалення бажання з підтвердженням
function openConfirmDeleteWishModal(deleteUrl) {
  const confirmModal = document.getElementById('confirmDeleteWishModal');
  const confirmDeleteBtn = document.getElementById('confirmDeleteWishBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteWishBtn');

  confirmDeleteBtn.href = deleteUrl;

  confirmModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  cancelDeleteBtn.onclick = function () {
    confirmModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  };
}

// Закриття модального вікна видалення бажання
function closeConfirmDeleteWishModal() {
  const confirmModal = document.getElementById('confirmDeleteWishModal');
  confirmModal.classList.add('hidden');
  document.body.style.overflow = 'auto';
}

// Розширена логіка закриття модальних вікон
document.addEventListener('DOMContentLoaded', function () {
  const modals = [
    'editWishlistModal',
    'deleteWishlistConfirmModal',
    'createWishModal',
    'confirmDeleteWishModal',
  ];

  modals.forEach((modalId) => {
    const modal = document.getElementById(modalId);

    modal.addEventListener('click', function (e) {
      if (e.target === this) {
        this.classList.add('hidden');
        document.body.style.overflow = 'auto';
      }
    });
  });

  // Закриття по клавіші Escape
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      modals.forEach((modalId) => {
        const modal = document.getElementById(modalId);
        if (!modal.classList.contains('hidden')) {
          modal.classList.add('hidden');
          document.body.style.overflow = 'auto';
        }
      });
    }
  });

  // Перехоплення посилань видалення
  const deleteLinks = document.querySelectorAll('a[href*="/wishes/delete/"]');
  deleteLinks.forEach((link) => {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      openConfirmDeleteWishModal(this.href);
    });
  });
});
