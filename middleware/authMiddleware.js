const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login'); // Перенаправлення на сторінку входу
    }
    next();
};

module.exports = { requireAuth };