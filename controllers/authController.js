//controllers/authController.js
const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * Відображає форму реєстрації
 */
const showRegisterForm = (req, res) => {
  res.render('auth/register');
};

/**
 * Реєструє нового користувача
 */
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).send('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.createUser(username, email, hashedPassword);

    req.session.user = { id: newUser.insertId, username };
    res.redirect('/');
  } catch (err) {
    console.error('Помилка реєстрації:', err);
    res.redirect('/auth/register');
  }
};

/**
 * Відображає форму входу
 */
const showLoginForm = (req, res) => {
  res.render('auth/login');
};

/**
 * Авторизує користувача
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findUserByEmail(email);
    if (!user) {
      return res.redirect('/auth/login');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.redirect('/auth/login');
    }

    req.session.user = { id: user.id, username: user.username };
    res.redirect('/');
  } catch (err) {
    console.error('Помилка входу:', err);
    res.redirect('/auth/login');
  }
};

/**
 * Завершує сесію користувача
 */
const logoutUser = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};

module.exports = {
  showRegisterForm,
  registerUser,
  showLoginForm,
  loginUser,
  logoutUser,
};
