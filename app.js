const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const csurf = require('csurf');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const errorHandler = require('./middleware/errorHandler');
const { requireAuth } = require('./middleware/authMiddleware');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000
    },
    name: 'sessionId'
  })
);
app.use(flash());
app.use(csurf());
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.user = req.session?.user || null;
  next();
});

// Apply requireAuth only to protected routes
app.use((req, res, next) => {
  const publicRoutes = ['/', '/auth/login', '/auth/register'];
  if (publicRoutes.includes(req.path)) {
    return next();
  }
  if (req.session?.user) {
    if (req.path === '/') {
      return res.redirect('/dashboard');
    }
    return next();
  }
  return res.redirect('/auth/login');
});

app.get('/', (req, res) => {
  res.render('index', { user: null });
});
app.get('/dashboard', requireAuth, (req, res) => {
  res.render('dashboard', { user: req.session.user });
});
app.use('/auth', authRoutes);
app.use('/wishlists', wishlistRoutes);

app.use(errorHandler);

module.exports = app;