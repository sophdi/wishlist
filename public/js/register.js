//public/js/register.js
import {
  validateUsername,
  validateEmail,
  validatePassword,
  showFieldError,
  clearFieldError
} from './validation.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const usernameInput = document.getElementById('username');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  // Очищення всіх полів від помилок
  const clearAllErrors = () => {
    clearFieldError('username');
    clearFieldError('email');
    clearFieldError('password');
  };

  // Асинхронна перевірка, чи email вже зайнятий
  const checkEmailAvailability = async (email) => {
    try {
      const response = await fetch('/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          isAvailable: false,
          message: data.error || 'Email вже використовується'
        };
      }

      return {
        isAvailable: true
      };

    } catch (err) {
      console.error('Error checking email:', err);
      return {
        isAvailable: false,
        message: 'Помилка перевірки email. Спробуйте ще раз.'
      };
    }
  };

  // Валідація username при втраті фокусу
  usernameInput.addEventListener('blur', () => {
    const result = validateUsername(usernameInput.value);
    if (!result.isValid) {
      showFieldError('username', result.message);
    }
  });
  // Очищення помилки при фокусі або зміні поля
  usernameInput.addEventListener('focus', () => {
    clearFieldError('username');
  });
  usernameInput.addEventListener('input', () => {
    clearFieldError('username');
  });

  // Валідація email та перевірка на унікальність
  emailInput.addEventListener('blur', async () => {
    const result = validateEmail(emailInput.value);
    if (!result.isValid) {
      showFieldError('email', result.message);
      return;
    }

    emailInput.classList.add('opacity-50'); // Візуальний індикатор перевірки

    const availability = await checkEmailAvailability(emailInput.value);

    emailInput.classList.remove('opacity-50');

    if (!availability.isAvailable) {
      showFieldError('email', availability.message);
    }
  });

  emailInput.addEventListener('focus', () => {
    clearFieldError('email');
  });

  emailInput.addEventListener('input', () => {
    clearFieldError('email');
  });

  // Валідація пароля при втраті фокусу
  passwordInput.addEventListener('blur', () => {
    const result = validatePassword(passwordInput.value);
    if (!result.isValid) {
      showFieldError('password', result.message);
    }
  });

  passwordInput.addEventListener('focus', () => {
    clearFieldError('password');
  });

  passwordInput.addEventListener('input', () => {
    clearFieldError('password');
  });

  // Відправка форми з попередньою валідацією
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAllErrors();

    const username = usernameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;

    // Перевіряємо всі поля перед відправкою
    const usernameValidation = validateUsername(username);
    const emailValidation = validateEmail(email);
    const passwordValidation = validatePassword(password);

    let isValid = true;

    if (!usernameValidation.isValid) {
      showFieldError('username', usernameValidation.message);
      isValid = false;
    }

    if (!emailValidation.isValid) {
      showFieldError('email', emailValidation.message);
      isValid = false;
    }

    if (!passwordValidation.isValid) {
      showFieldError('password', passwordValidation.message);
      isValid = false;
    }

    if (!isValid) return;

    // Додаткова перевірка email на унікальність
    const emailAvailability = await checkEmailAvailability(email);
    if (!emailAvailability.isAvailable) {
      showFieldError('email', emailAvailability.message);
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Реєстрація...';
    }

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        // Відображаємо помилки з бекенду по відповідних полях
        if (data.errors) {
          data.errors.forEach(error => {
            switch (error.param) {
              case 'username':
                showFieldError('username', error.msg);
                break;
              case 'email':
                showFieldError('email', error.msg);
                break;
              case 'password':
                showFieldError('password', error.msg);
                break;
              case 'system':
                showFieldError('username', error.msg);
                showFieldError('email', error.msg);
                showFieldError('password', error.msg);
                break;
              default:
                showFieldError('system', error.msg);
                break;
            }
          });
        }
      } else if (data.redirect) {
        // Успішна реєстрація — редірект
        window.location.href = data.redirect;
      }
    } catch (err) {
      console.error('Registration error:', err);
      showFieldError('system', 'Сталася помилка. Спробуйте ще раз.');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Зареєструватися';
    }
  });
});