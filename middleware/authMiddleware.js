//middleware/authMiddleware.js
const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }
  next();
};

module.exports = { requireAuth };
