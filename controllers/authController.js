const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const authService = require('../services/authService');
const { ERROR_MESSAGES } = require('../utils/errors');


// Відображає сторінку форми входу користувача
const showLoginForm = (req, res) => {
  res.render('auth/login', { errors: [] });
};

// Відображає сторінку форми реєстрації
const showRegisterForm = (req, res) => {
  res.render('auth/register', { errors: [] });
};

// Обробляє вхід користувача: перевіряє валідацію, існування email та правильність паролю
const loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.xhr) {
        return res.status(400).json({ errors: errors.array() });
      }
      return res.render('auth/login', { errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Пошук користувача за email
      const user = await User.findUserByEmail(email);
      if (!user) {
        const errorMsg = 'Користувача з таким email не знайдено';
        if (req.xhr) {
          return res.status(404).json({
            errors: [{ param: 'email', msg: errorMsg }]
          });
        }
        return res.render('auth/login', {
          errors: [{ msg: errorMsg }],
          email
        });
      }
      // Перевіряємо правильність паролю
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        const errorMsg = 'Невірний пароль';
        if (req.xhr) {
          return res.status(401).json({
            errors: [{ param: 'password', msg: errorMsg }]
          });
        }
        return res.render('auth/login', {
          errors: [{ msg: errorMsg }],
          email
        });
      }

      // Створюємо сесію для користувача після успішного входу
      await authService.createUserSession(req, user);

      if (req.xhr) {
        return res.status(200).json({ redirect: '/dashboard' });
      }
      return res.redirect('/dashboard');

    } catch (error) {
      console.error('Login validation error:', error);
      const errorMsg = 'Сталася помилка. Спробуйте ще раз.';
      if (req.xhr) {
        return res.status(500).json({
          errors: [{ param: 'system', msg: errorMsg }]
        });
      }
      return res.render('auth/login', {
        errors: [{ msg: errorMsg }],
        email
      });
    }
  } catch (error) {
    // Обробка неочікуваних помилок під час логіну
    console.error('Login error:', error);
    const errorMsg = 'Сталася помилка. Спробуйте ще раз.';
    if (req.xhr) {
      return res.status(500).json({
        errors: [{ param: 'system', msg: errorMsg }]
      });
    }
    res.render('auth/login', {
      errors: [{ msg: errorMsg }],
      email: req.body.email
    });
  }
};

/**
 * Перевіряє, чи вже зареєстровано користувача з вказаним email.
 * Повертає JSON-відповідь для AJAX-запитів.
 * POST /auth/check-email
 */
const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    const exists = await User.checkEmailExists(email);

    if (exists) {
      return res.status(400).json({
        error: 'Цей email вже зареєстрований'
      });
    }

    return res.status(200).json({
      available: true
    });

  } catch (error) {
    console.error('Error checking email:', error);
    return res.status(500).json({
      error: 'Помилка перевірки email. Спробуйте ще раз.'
    });
  }
};

// Обробляє реєстрацію користувача
const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.xhr) {
        return res.status(400).json({ errors: errors.array() });
      }
      return res.render('auth/register', {
        errors: errors.array(),
        username: req.body.username,
        email: req.body.email
      });
    }

    const { username, email, password } = req.body;

    try {
      await authService.checkEmailAvailability(email);
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.createUser(username, email, hashedPassword);
      await authService.createUserSession(req, user);

      if (req.xhr) {
        return res.status(200).json({ redirect: '/dashboard' });
      }
      return res.redirect('/dashboard');
    } catch (error) {
      if (req.xhr) {
        return res.status(409).json({
          errors: [{ msg: error.message }]
        });
      }
      return res.render('auth/register', {
        errors: [{ msg: error.message }],
        username,
        email
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    const errorMessage = ERROR_MESSAGES.SERVER_ERROR;

    if (req.xhr) {
      return res.status(500).json({
        errors: [{ msg: errorMessage }]
      });
    }

    res.render('auth/register', {
      errors: [{ msg: errorMessage }],
      username: req.body.username,
      email: req.body.email
    });
  }
};

// Завершує сесію користувача та перенаправляє на головну сторінку
const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    res.redirect('/');
  });
};

module.exports = {
  showLoginForm,
  showRegisterForm,
  loginUser,
  checkEmail,
  registerUser,
  logoutUser
};
