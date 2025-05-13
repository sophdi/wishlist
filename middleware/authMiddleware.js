const requireAuth = (req, res, next) => {
  console.log(`requireAuth: Session User: ${JSON.stringify(req.session?.user)}`);
  if (!req.session?.user) {
    req.flash('error', 'Будь ласка, увійдіть');
    return res.redirect('/auth/login');
  }
  next();
};

module.exports = { requireAuth };