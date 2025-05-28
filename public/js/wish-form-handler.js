// public/js/wish-form-handler.js

document.addEventListener('DOMContentLoaded', function () {
    // ===== Обробка форми створення бажання =====
    const createWishForm = document.getElementById('createWishForm');
    if (createWishForm) {
        // --- Елементи для попереднього перегляду зображення ---
        const imageInput = document.getElementById('wishImage');
        const imagePreviewContainer = document.getElementById('imagePreviewContainer');
        const imagePreview = document.getElementById('imagePreview');
        const uploadPlaceholder = document.getElementById('uploadPlaceholder');

        // --- Обробник вибору зображення ---
        imageInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            if (file) {
                // Перевірка розміру файлу (максимум 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    alert('Розмір файлу не повинен перевищувати 5MB');
                    imageInput.value = '';
                    return;
                }

                // Перевірка типу файлу (тільки зображення)
                if (!file.type.startsWith('image/')) {
                    alert('Будь ласка, виберіть зображення');
                    imageInput.value = '';
                    return;
                }

                // Показати попередній перегляд зображення
                const reader = new FileReader();
                reader.onload = function (e) {
                    imagePreview.src = e.target.result;
                    imagePreviewContainer.classList.remove('hidden');
                    uploadPlaceholder.classList.add('hidden');
                };
                reader.readAsDataURL(file);
            }
        });

        // --- Лічильник символів для поля опису ---
        const descriptionTextarea = document.getElementById('createWishDescription');
        const charCount = document.getElementById('charCount');

        descriptionTextarea.addEventListener('input', function () {
            charCount.textContent = this.value.length;
        });

        // --- Валідація поля ціни (дозволяє лише числа та крапку) ---
        const priceInput = document.getElementById('createWishPrice');
        priceInput.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9.]/g, '');
        });

        // --- Обробка відправки форми створення бажання ---
        createWishForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // --- Клієнтська валідація назви бажання ---
            const title = document.getElementById('createWishTitle').value.trim();
            if (!title) {
                alert('Будь ласка, введіть назву бажання');
                return;
            }

            // --- Показати індикатор завантаження на кнопці ---
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Додавання...';

            try {
                // --- Формуємо FormData для відправки файлів та інших даних ---
                const formData = new FormData(this);

                // --- Отримуємо wishlistId з URL форми ---
                const wishlistId = this.action.match(/\/wishlists\/(\d+)\/wishes/)[1];

                // --- Відправляємо POST-запит на сервер ---
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                const result = await response.json();

                if (result.success) {
                    // --- Успішне створення бажання ---
                    showNotification('success', result.message || 'Бажання успішно додано');

                    // --- Закриваємо модальне вікно (глобальна функція) ---
                    window.closeCreateWishModal();

                    // --- Оновлюємо сторінку через 0.5 секунди ---
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                    // Альтернатива: можна викликати addWishToDOM(result.wish) для динамічного додавання

                } else {
                    // --- Відображаємо помилки, якщо вони є ---
                    if (result.errors && result.errors.length > 0) {
                        const errorMessages = result.errors.map(err => err.msg).join('\n');
                        alert(errorMessages);
                    } else {
                        alert('Помилка при додаванні бажання');
                    }
                }
            } catch (error) {
                // --- Обробка неочікуваних помилок ---

                console.error('Error:', error);
                alert('Помилка при додаванні бажання. Спробуйте ще раз.');
            } finally {
                // --- Відновлюємо стан кнопки ---
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });

        // --- Очищення форми при закритті модального вікна ---
        window.addEventListener('closeCreateWishModal', function () {
            createWishForm.reset();
            imagePreview.src = '';
            imagePreviewContainer.classList.add('hidden');
            uploadPlaceholder.classList.remove('hidden');
            charCount.textContent = '0';
        });
    }

    // ===== Обробка форми редагування бажання =====
    const editWishForm = document.getElementById('editWishForm');
    if (editWishForm) {
        editWishForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // --- Клієнтська валідація назви бажання ---
            const title = document.getElementById('editWishTitle').value.trim();
            if (!title) {
                alert('Будь ласка, введіть назву бажання');
                return;
            }

            // --- Показати індикатор завантаження на кнопці ---
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Збереження...';

            try {
                // --- Формуємо FormData для відправки файлів та інших даних ---
                const formData = new FormData(this);

                // --- Відправляємо POST-запит на сервер ---
                const response = await fetch(this.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                const result = await response.json();

                if (result.success) {
                    // --- Успішне редагування бажання ---
                    showNotification('success', result.message || 'Бажання успішно оновлено');

                    // --- Закриваємо модальне вікно (глобальна функція) ---
                    window.closeEditWishModal();

                    // --- Оновлюємо сторінку через 0.5 секунди ---
                    setTimeout(() => {
                        window.location.reload();
                    }, 500);
                } else {
                    // --- Відображаємо помилки, якщо вони є ---
                    if (result.errors && result.errors.length > 0) {
                        const errorMessages = result.errors.map(err => err.msg).join('\n');
                        alert(errorMessages);
                    } else {
                        alert('Помилка при оновленні бажання');
                    }
                }
            } catch (error) {
                // --- Обробка неочікуваних помилок ---
                console.error('Error:', error);
                alert('Помилка при оновленні бажання. Спробуйте ще раз.');
            } finally {
                // --- Відновлюємо стан кнопки ---
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
    }
});

// ===== Функція для показу сповіщень користувачу =====

// Відображає сповіщення у верхньому правому куті сторінки
function showNotification(type, message) {
    // Створюємо елемент сповіщення
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`;
    notification.innerHTML = `
    <div class="flex items-center">
      <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
        ${type === 'success'
            ? '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>'
            : '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>'
        }
      </svg>
      <span>${message}</span>
    </div>
  `;
    // Додаємо сповіщення до DOM
    document.body.appendChild(notification);

    // Анімація появи
    setTimeout(() => {
        notification.classList.add('opacity-100', 'translate-x-0');
    }, 10);

    // Автоматичне видалення через 3 секунди
    setTimeout(() => {
        notification.classList.add('opacity-0', 'translate-x-full');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ===== Динамічне додавання бажання до DOM (альтернатива reload) =====

//Додає нову картку бажання до сітки без перезавантаження сторінки.
function addWishToDOM(wish) {
    const wishesGrid = document.querySelector('.grid');
    const addButton = wishesGrid.querySelector('button[onclick="openCreateWishModal()"]').parentElement;

    const wishCard = document.createElement('div');
    wishCard.className = 'bg-white rounded-xl border border-gray-100 hover:shadow-lg hover:border-gray-200 transition-all duration-200 h-80 relative group';
    wishCard.innerHTML = `
    <!-- Вміст картки бажання -->
    <div class="absolute top-4 right-4 z-10">
      <button onclick="toggleWishMenu('${wish.id}')" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
        </svg>
      </button>
      <!-- Dropdown menu -->
      <div id="wishMenu${wish.id}" class="hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100">
        <!-- Меню опцій -->
      </div>
    </div>
    
    <div class="p-6 h-full flex flex-col">
      <!-- Зображення -->
      <div class="w-full h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
        ${wish.image_url
            ? `<img src="${wish.image_url}" alt="${wish.title}" class="w-full h-full object-cover rounded-lg">`
            : `<svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>`
        }
      </div>
      
      <!-- Назва -->
      <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 flex-shrink-0">${wish.title}</h3>
      
      <!-- Опис -->
      ${wish.description ? `<p class="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">${wish.description}</p>` : ''}
      
      <!-- Ціна та дата -->
      <div class="mt-auto pt-3 border-t border-gray-100">
        <div class="flex items-center justify-between">
          ${wish.price ? `
            <div class="font-semibold text-purple-600">
              ${wish.price} <span class="text-sm">${wish.currency || 'UAH'}</span>
            </div>
          ` : ''}
          <div class="text-xs text-gray-500">
            Додано щойно
          </div>
        </div>
      </div>
    </div>
  `;

    // Вставляємо картку перед кнопкою "Додати бажання"
    wishesGrid.insertBefore(wishCard, addButton);
}

// ===== Drag & Drop функціональність для завантаження зображення =====

/**
 * Додає підтримку drag & drop для завантаження зображення у форму.
 */
const dropZone = document.querySelector('label[for="wishImage"]');
if (dropZone) {
    // --- Запобігаємо стандартній поведінці браузера для drag & drop подій ---
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // --- Підсвічування drop-зони при перетягуванні файлу ---
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, unhighlight, false);
    });

    function highlight(e) {
        dropZone.classList.add('border-purple-500', 'bg-purple-50');
    }

    function unhighlight(e) {
        dropZone.classList.remove('border-purple-500', 'bg-purple-50');
    }

    // --- Обробка події "drop" (скидання файлу у зону) ---
    dropZone.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            const file = files[0];

            // Перевірка типу файлу
            if (!file.type.startsWith('image/')) {
                alert('Будь ласка, перетягніть зображення');
                return;
            }

            // Перевірка розміру
            if (file.size > 5 * 1024 * 1024) {
                alert('Розмір файлу не повинен перевищувати 5MB');
                return;
            }

            // Встановлюємо файл у input type="file"
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            // Знаходимо input для зображення
            const imageInput = document.getElementById('wishImage');
            imageInput.files = dataTransfer.files;


            // Викликаємо обробник зміни для попереднього перегляду
            imageInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
    }
}