//middleware/authMiddleware.js

/**
 * Middleware для захисту маршрутів — допускає лише авторизованих користувачів.
 */
const requireAuth = (req, res, next) => {
  if (!req.session?.user) {
    req.flash('error', 'Будь ласка, увійдіть');
    return res.redirect('/auth/login');
  }
  next();
};

/**
 * Middleware для гостьових маршрутів — якщо користувач вже авторизований, перенаправляє на дашборд.
 */
const requireGuest = (req, res, next) => {
  if (req.session?.user) {
    return res.redirect('/dashboard');
  }
  next();
};

const checkAuth = (req, res, next) => {
  const path = req.path;

  // Дозволяємо доступ до статичних файлів
  if (
    path.startsWith('/css/') ||
    path.startsWith('/js/') ||
    path.startsWith('/images/') ||
    path.startsWith('/uploads/')
  ) {
    return next();
  }

  // Root
  if (path === '/') {
    return next();
  }

  // Дозволяємо доступ до маршрутів автентифікації
  if (path.startsWith('/auth/')) {
    return next();
  }

  // Для інших маршрутів перевіряємо автентифікацію
  if (!req.session?.user) {
    if (typeof req.flash === 'function') {
      req.flash('error', 'Будь ласка, увійдіть');
    }
    return res.redirect('/auth/login');
  }

  next();
};


module.exports = {
  requireAuth,
  requireGuest,
  checkAuth
};