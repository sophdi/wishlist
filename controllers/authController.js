const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const showRegisterForm = (req, res) => {
  res.render('auth/register', { errors: [] });
};

const registerUser = [
  body('username').isLength({ min: 2, max: 30 }).withMessage('Ім’я користувача має бути від 2 до 30 символів'),
  body('email').isEmail().withMessage('Невірний формат email'),
  body('password').isLength({ min: 6 }).withMessage('Пароль має бути щонайменше 6 символів'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/register', { errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      const existingUser = await User.findUserByEmail(email);
      if (existingUser) {
        return res.render('auth/register', { errors: [{ msg: 'Користувач із таким email вже існує' }] });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await User.createUser(username, email, hashedPassword);

      const user = await User.findUserByEmail(email);
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
          return res.render('auth/register', { errors: [{ msg: 'Не вдалося зареєструватися' }] });
        }
        req.session.user = { id: user.id, username: user.username };
        console.log('Register: Session set:', req.session.user);
        res.redirect('/dashboard');
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.render('auth/register', { errors: [{ msg: 'Не вдалося зареєструватися' }] });
    }
  }
];

const showLoginForm = (req, res) => {
  if (req.session?.user) {
    console.log('Login: User already authenticated, redirecting to /dashboard');
    return res.redirect('/dashboard');
  }
  res.render('auth/login', { errors: [] });
};

const loginUser = [
  body('email').isEmail().withMessage('Невірний формат email'),
  body('password').notEmpty().withMessage('Введіть пароль'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render('auth/login', { errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findUserByEmail(email);
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.render('auth/login', { errors: [{ msg: 'Невірний email або пароль' }] });
      }

      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
          return res.render('auth/login', { errors: [{ msg: 'Не вдалося увійти' }] });
        }
        req.session.user = { id: user.id, username: user.username };
        console.log('Login: Session set:', req.session.user);
        res.redirect('/dashboard');
      });
    } catch (error) {
      console.error('Login error:', error);
      res.render('auth/login', { errors: [{ msg: 'Не вдалося увійти' }] });
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

module.exports = { showRegisterForm, registerUser, showLoginForm, loginUser, logoutUser };