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
      req.flash('error', 'Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.createUser(username, email, hashedPassword);

    // Збереження користувача в сесії
    req.session.user = { id: newUser.insertId, username };
    res.redirect('/');
  } catch (err) {
    console.error('Помилка реєстрації:', err);
    req.flash('error', 'Registration failed');
    res.redirect('/auth/register');
  }
};

/**
 * Відображає форму входу
 */
const showLoginForm = (req, res) => {
  const errorMessage = req.flash('error'); // Отримуємо flash-повідомлення
  res.render('auth/login', { errorMessage }); // Передаємо його у шаблон
};

/**
 * Авторизує користувача
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findUserByEmail(email);
    if (!user) {
      req.flash('error', 'Користувача не знайдено'); // Додаємо повідомлення
      return res.redirect('/auth/login');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      req.flash('error', 'Неправильний пароль'); // Додаємо повідомлення
      return res.redirect('/auth/login');
    }

    req.session.user = { id: user.id, username: user.username };
    res.redirect('/');
  } catch (err) {
    console.error('Помилка входу:', err);
    req.flash('error', 'Сталася помилка. Спробуйте ще раз.');
    res.redirect('/auth/login');
  }
};

/**
 * Завершує сесію користувача
 */
const logoutUser = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/');
    }
    res.redirect('/auth/login');
  });
};

module.exports = {
  showRegisterForm,
  registerUser,
  showLoginForm,
  loginUser,
  logoutUser,
};
