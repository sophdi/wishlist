const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const {
  csrfProtection,
  attachCsrfToken,
} = require('./middleware/authMiddleware');
const authRoutes = require('./routes/authRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

const app = express();

// Налаштування шаблонізатора
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware для обробки запитів
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Підключення сесій
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(flash());

// CSRF-захист
app.use(csrfProtection);
app.use(attachCsrfToken);

// Логування сесій
app.use((req, res, next) => {
  // eslint-disable-next-line no-console
  console.log('Session:', req.session);
  next();
});

// Логування CSRF токенів
app.use((req, res, next) => {
  // eslint-disable-next-line no-console
  console.log(
    'CSRF Token:',
    req.csrfToken ? req.csrfToken() : 'Не згенеровано'
  );
  next();
});

// Маршрути
app.use('/auth', authRoutes);
app.use('/wishlists', wishlistRoutes);

// Головна сторінка
app.get('/', (req, res) => {
  res.render('index', { user: req.session?.user || null });
});

// Обробка помилок
app.use((err, req, res) => {
  // TODO: Replace with proper logging
  process.stderr.write(`Error: ${err}\n`);
  res.status(500).send('Внутрішня помилка сервера');
});

module.exports = app;
