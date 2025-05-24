document.addEventListener('DOMContentLoaded', function () {
  // ID модального вікна підтвердження виходу
  const logoutModalId = 'logoutConfirmModal';

  // Функція для відкриття модального вікна виходу
  window.openLogoutConfirmModal = function () {
    const modal = document.getElementById(logoutModalId);
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      document.body.classList.add('overflow-hidden');
    }
  };

  // Функція для закриття модального вікна виходу
  window.closeLogoutConfirmModal = function () {
    const modal = document.getElementById(logoutModalId);
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
      document.body.classList.remove('overflow-hidden');
    }
  };

  // Додаємо обробник події для закриття модального вікна при кліку на фон
  const modal = document.getElementById(logoutModalId);
  if (modal) {
    modal.addEventListener('click', function (e) {
      // Якщо клік був саме по фону модального вікна, а не по його вмісту
      if (e.target === modal) {
        window.closeLogoutConfirmModal();
      }
    });
  }
});