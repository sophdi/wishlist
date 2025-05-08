const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser'); 
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes'); 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware 
app.use(bodyParser.urlencoded({ extended: true }));

// Налаштування сесій
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: true,
}));

// Налаштування EJS як шаблонізатора
app.set('view engine', 'ejs');

// Налаштування статичних файлів
app.use(express.static('public'));

// Використання маршрутів для авторизації
app.use('/auth', authRoutes);

// Головна сторінка (без middleware для захисту)
app.get('/', (req, res) => {
    res.render('index', { user: req.session.user });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});