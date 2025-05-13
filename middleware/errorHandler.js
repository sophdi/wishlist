// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  if (res.headersSent) return next(err);
  req.flash('error', 'Щось пішло не так');
  res.redirect(req.path || '/auth/login');
};

module.exports = errorHandler;