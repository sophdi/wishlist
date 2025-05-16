const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const showRegisterForm = (req, res) => {
  res.render('auth/register', { errors: [] });
};

const registerUser = [
  body('username')
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage("Ім'я користувача має бути від 2 до 30 символів")
    .matches(/^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\s-]+$/)
    .withMessage("Ім'я користувача може містити тільки літери, пробіли та дефіс"),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Невірний формат email')
    .normalizeEmail(),
  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Пароль має бути щонайменше 6 символів'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/register', { 
        errors: errors.array(),
        username: req.body.username,
        email: req.body.email
      });
    }

    const { username, email, password } = req.body;

    try {
      const existingUser = await User.findUserByEmail(email);
      if (existingUser) {
        return res.render('auth/register', { 
          errors: [{ msg: 'Користувач із таким email вже існує' }],
          username: username,
          email: email
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await User.createUser(username, email, hashedPassword);

      const user = await User.findUserByEmail(email);
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
          return res.render('auth/register', { 
            errors: [{ msg: 'Не вдалося зареєструватися. Спробуйте ще раз' }],
            username: username,
            email: email
          });
        }
        req.session.user = { id: user.id, username: user.username };
        res.redirect('/dashboard');
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.render('auth/register', { 
        errors: [{ msg: 'Не вдалося зареєструватися. Спробуйте ще раз' }],
        username: username,
        email: email
      });
    }
  }
];

const showLoginForm = (req, res) => {
  res.render('auth/login', { errors: [] });
};

const loginUser = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Невірний формат email')
    .normalizeEmail(),
  body('password')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Пароль має бути щонайменше 6 символів'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/login', { errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findUserByEmail(email);
      if (!user) {
        return res.render('auth/login', { 
          errors: [{ msg: 'Користувача з таким email не знайдено' }],
          email: email // Preserve email for better UX
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.render('auth/login', { 
          errors: [{ msg: 'Невірний пароль' }],
          email: email // Preserve email for better UX
        });
      }

      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
          return res.render('auth/login', { 
            errors: [{ msg: 'Не вдалося увійти. Спробуйте ще раз' }],
            email: email
          });
        }
        req.session.user = { id: user.id, username: user.username };
        res.redirect('/dashboard');
      });
    } catch (error) {
      console.error('Login error:', error);
      res.render('auth/login', { 
        errors: [{ msg: 'Не вдалося увійти. Спробуйте ще раз' }],
        email: email
      });
    }
  }
];

const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destruction error:', err);
    }
    res.redirect('/');
  });
};

module.exports = {
  showRegisterForm,
  registerUser,
  showLoginForm,
  loginUser,
  logoutUser
};