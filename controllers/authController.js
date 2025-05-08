const bcrypt = require('bcryptjs');
const User = require('../models/User');

// рендер форми реєстрації
const showRegisterForm = (req, res) => {
    res.render('auth/register');
};

const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // хешуємо пароль
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.createUser(username, email, hashedPassword);

        res.redirect('/auth/login');
    } catch (err) {
        console.error('Помилка при реєстрації:', err);
        res.redirect('/auth/register');
    }
};

const showLoginForm = (req, res) => {
    res.render('auth/login');
};

// Контролер для обробки входу
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Знайти користувача за email
        const user = await User.findUserByEmail(email);
        if (!user) {
            return res.redirect('/auth/login'); 
        }

        // Перевірка пароля
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.redirect('/auth/login');
        }

        // Збереження даних у сесії
        req.session.user = { id: user.id, username: user.username };
        res.redirect('/');
    } catch (err) {
        console.error('Помилка входу користувача:', err);
        res.redirect('/auth/login');
    }
};

// Контролер для виходу із системи
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