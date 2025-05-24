//public/js/login.js
import { validateEmail, validatePassword, clearFieldError, showFieldError } from './validation.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  // Очищає всі повідомлення про помилки у формі
  const clearAllErrors = () => {
    clearFieldError('email');
    clearFieldError('password');
  };

  // Валідує email при втраті фокусу
  emailInput.addEventListener('blur', () => {
    const result = validateEmail(emailInput.value);
    if (!result.isValid) {
      showFieldError('email', result.message);
    }
  });
  // При фокусі або зміні поля email прибирає помилку
  emailInput.addEventListener('focus', () => {
    clearFieldError('email');
  });

  emailInput.addEventListener('input', () => {
    clearFieldError('email');
  });

  // Валідує пароль при втраті фокусу
  passwordInput.addEventListener('blur', () => {
    const result = validatePassword(passwordInput.value);
    if (!result.isValid) {
      showFieldError('password', result.message);
    }
  });
  // При фокусі або зміні поля пароля прибирає помилку
  passwordInput.addEventListener('focus', () => {
    clearFieldError('password');
  });

  passwordInput.addEventListener('input', () => {
    clearFieldError('password');
  });

  // Обробляє відправку форми: валідує, надсилає запит, показує помилки або редіректить
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAllErrors();

    const email = emailInput.value;
    const password = passwordInput.value;

    // Перевіряє email та пароль перед відправкою
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    if (!emailValidation.isValid) {
      showFieldError('email', emailValidation.message);
      return;
    }

    if (!passwordValidation.isValid) {
      showFieldError('password', passwordValidation.message);
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      // Надсилає дані форми через fetch
      const response = await fetch(form.action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ email, password })
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        showFieldError('email', 'Сталася помилка. Спробуйте ще раз.');
        showFieldError('password', 'Сталася помилка. Спробуйте ще раз.');
        return;
      }

      // Відображає помилки з бекенду або виконує редірект
      if (!response.ok) {
        if (data.errors) {
          data.errors.forEach(error => {
            switch (error.param) {
              case 'email':
                showFieldError('email', error.msg);
                break;
              case 'password':
                showFieldError('password', error.msg);
                break;
              case 'system':
                showFieldError('email', error.msg);
                break;
            }
          });
        }
      } else if (data.redirect) {
        window.location.href = data.redirect;
      }
    } catch (err) {
      // Відображає загальну помилку при збої запиту
      console.error('Login error:', err);
      showFieldError('email', 'Сталася помилка. Спробуйте ще раз.');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
});