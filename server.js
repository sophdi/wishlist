const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware для обробки даних форм
app.use(bodyParser.urlencoded({ extended: true }));

// Налаштування сесій
app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: true,
}));

// Налаштування EJS
app.set('view engine', 'ejs');

// Головна
app.get('/', (req, res) => {
    res.render('index', { user: req.session.user });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});

const db = require('./config/db');

// Тестовий запит до бази даних
db.query('SELECT 1 + 1 AS solution', (err, results) => {
    if (err) {
        console.error('Помилка в SQL-запиті:', err);
        return;
    }
    console.log('Результат тестового запиту:', results[0].solution);
});