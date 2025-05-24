//public/js/validation.js

// ===== Функції валідації =====

/**
 * Перевіряє коректність імені користувача.
 * Вимоги:
 * - Не порожнє
 * - Довжина від 3 до 30 символів
 * - Дозволені лише латинські літери, цифри, крапки, дефіси та підкреслення
 */
export const validateUsername = (username) => {
  // Перевірка на порожнє значення
  if (!username || username.trim() === '') {
    return { isValid: false, message: 'Введіть ім\'я користувача' };
  }
  // Мінімальна довжина
  if (username.length < 3) {
    return { isValid: false, message: 'Ім\'я користувача має бути не менше 3 символів' };
  }
  // Максимальна довжина
  if (username.length > 30) {
    return { isValid: false, message: 'Ім\'я користувача має бути не більше 30 символів' };
  }

  // Дозволені символи: латинські літери, цифри, крапки, дефіси, підкреслення
  const usernameRegex = /^[a-zA-Z0-9._-]+$/;
  if (!usernameRegex.test(username)) {
    return {
      isValid: false,
      message: 'Дозволені символи: літери, цифри, крапки та дефіси'
    };
  }
  return { isValid: true, message: '' };
};

/**
 * Перевіряє коректність email.
 * Вимоги:
 * - Не порожній
 * - Відповідає стандартному формату email
*/
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { isValid: false, message: 'Введіть email' };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Невірний формат email' };
  }

  return { isValid: true, message: '' };
};

/**
 * Перевіряє коректність пароля.
 * Вимоги:
 * - Не порожній
 * - Довжина від 6 до 128 символів
 */
export const validatePassword = (password) => {
  if (!password || password.trim() === '') {
    return { isValid: false, message: 'Введіть пароль' };
  }

  if (password.length < 6) {
    return { isValid: false, message: 'Пароль має бути не менше 6 символів' };
  }

  if (password.length > 128) {
    return { isValid: false, message: 'Пароль занадто довгий' };
  }

  return { isValid: true, message: '' };
};

// ===== Функції для відображення помилок у формі =====

/**
 * Відображає повідомлення про помилку для конкретного поля форми.
 * Додає червону рамку до поля та показує текст помилки.
 */
export const showFieldError = (field, message) => {
  const input = document.getElementById(field);
  const errorDiv = document.getElementById(`${field}Error`);

  if (input && errorDiv) {
    input.classList.remove('border-gray-200');
    input.classList.add('border-red-500');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
  }
};

/**
 * Очищає повідомлення про помилку для конкретного поля форми.
 * Повертає стандартний стиль рамки та приховує текст помилки.
 */
export const clearFieldError = (field) => {
  const input = document.getElementById(field);
  const errorDiv = document.getElementById(`${field}Error`);

  if (input && errorDiv) {
    input.classList.remove('border-red-500');
    input.classList.add('border-gray-200');
    errorDiv.classList.add('hidden');
    errorDiv.textContent = '';
  }
};