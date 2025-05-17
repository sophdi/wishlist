require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const profileRoutes = require('./routes/profileRoutes');
const errorHandler = require('./middleware/errorHandler');
const { requireAuth, requireGuest, checkAuth } = require('./middleware/authMiddleware');

const app = express();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Basic middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session and flash setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  },
  name: 'sessionId'
}));
app.use(flash());

// Global variables
app.use((req, res, next) => {
  const successMessages = req.flash('success');
  const errorMessages = req.flash('error');
  //console.log('FLASH SUCCESS (global middleware):', successMessages); // Додай це
  //console.log('FLASH ERROR (global middleware):', errorMessages);   // Додай це
  res.locals.success = successMessages;
  res.locals.error = errorMessages;
  res.locals.user = req.session?.user || null;
  next();
});

// Routes
app.use(checkAuth); // Apply authentication check to all routes

// Public routes
app.get('/', (req, res) => res.render('index'));
app.get('/dashboard', requireAuth, (req, res) => res.render('dashboard'));

// Auth routes
app.use('/auth', authRoutes);

// Protected routes
app.use('/wishlists', requireAuth, wishlistRoutes);
app.use('/', requireAuth, profileRoutes);

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});