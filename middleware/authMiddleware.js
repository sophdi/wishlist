//middleware/authMiddleware.js
const csrf = require('csurf');
const csrfProtection = csrf();

const requireAuth = (req, res, next) => {
  console.log(`Checking authentication for route: ${req.path}`);
  const publicRoutes = ['/auth/login', '/auth/register'];
  if (publicRoutes.includes(req.path)) {
    return next();
  }

  if (!req.session || !req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
};

const attachCsrfToken = (req, res, next) => {
  try {
    res.locals.csrfToken = req.csrfToken ? req.csrfToken() : null;
    next();
  } catch (err) {
    console.error('Помилка CSRF:', err);
    next(err);
  }
};

module.exports = { requireAuth, csrfProtection, attachCsrfToken };
