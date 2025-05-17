const requireAuth = (req, res, next) => {
  if (!req.session?.user) {
    req.flash('error', 'Будь ласка, увійдіть');
    return res.redirect('/auth/login');
  }
  next();
};

const requireGuest = (req, res, next) => {
  if (req.session?.user) {
    return res.redirect('/dashboard');
  }
  next();
};

const publicRoutes = ['/', '/auth/login', '/auth/register', '/auth/logout'];

const checkAuth = (req, res, next) => {
  // Skip auth check for static files
  if (req.path.startsWith('/css/') || req.path.startsWith('/js/') || req.path.startsWith('/images/')) {
    return next();
  }

  // Allow access to public routes
  if (publicRoutes.includes(req.path)) {
    return next();
  }

  // Check if user is authenticated
  if (!req.session?.user) {
    req.flash('error', 'Будь ласка, увійдіть');
    return res.redirect('/auth/login');
  }

  // If user is authenticated and tries to access login/register, redirect to dashboard
  if (req.session.user && (req.path === '/auth/login' || req.path === '/auth/register')) {
    return res.redirect('/dashboard');
  }

  next();
};

function isAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
}

module.exports = { 
  requireAuth,
  requireGuest,
  checkAuth,
  isAuthenticated
};