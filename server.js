//server.js
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Налаштування сесій
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true, // захищає від доступу через javascript
      secure: process.env.NODE_ENV === 'production', // HTTPS
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24, //cookie живуть день (не знаю чи мені це треба зараз)
    },
  })
);

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.render('index', { user: req.session.user });
});

app.use('/wishlists', wishlistRoutes);

// Запуск сервера
app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Сервер запущено на http://localhost:${PORT}`);
});
