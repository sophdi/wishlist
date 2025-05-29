/* eslint-disable no-console */
//app.js
require('dotenv').config();

const express = require('express');
const path = require('path');
const flash = require('connect-flash');
const sessionMiddleware = require('./config/session');
const authRoutes = require('./routes/authRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const wishRoutes = require('./routes/wishRoutes');
const profileRoutes = require('./routes/profileRoutes');
const errorHandler = require('./middleware/errorHandler');
const { requireAuth, checkAuth } = require('./middleware/authMiddleware');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();

// Налаштування EJS та директорії з шаблонами
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Основні middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessionMiddleware);
app.use(flash());

// Глобальні змінні для шаблонів
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.user = req.session?.user || null;
  next();
});

// Перевірка автентифікації для захищених маршрутів
app.use(checkAuth);

// --- Маршрути ---

app.get('/', (req, res) => res.render('index')); // Головна сторінка

app.use('/auth', authRoutes); // Автентифікація

// Захищені маршрути
app.use('/wishlists', requireAuth, wishlistRoutes);
app.use('/wishlists', requireAuth, wishRoutes);
app.use('/profile', requireAuth, profileRoutes);
app.use('/', dashboardRoutes);

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущено за адресою http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('Не вдалося запустити сервер:', err);
  process.exit(1);
});

// 404 сторінка
app.use((req, res) => {
  res.status(404).render('404', {
    url: req.originalUrl,
    message: 'Сторінку не знайдено'
  });
});

// Глобальний обробник помилок
app.use(errorHandler);