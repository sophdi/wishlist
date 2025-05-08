const Wishlist = require('../models/Wishlist');

// Відображає всі списки бажань поточного користувача
const showWishlists = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login'); // Перенаправлення на сторінку входу
    }
    try {
        const wishlists = await Wishlist.getUserWishlists(req.session.user.id);
        res.render('wishlists/index', { wishlists, user: req.session.user });
    } catch (err) {
        console.error('Помилка отримання списків бажань:', err);
        res.redirect('/');
    }
};

// Створює новий список бажань для користувача
const createWishlist = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login'); // Перенаправлення на сторінку входу
    }

    const { title } = req.body;
    try {
        await Wishlist.createWishlist(req.session.user.id, title);
        res.redirect('/wishlists');
    } catch (err) {
        console.error('Помилка створення списку бажань:', err);
        res.redirect('/wishlists');
    }
};

// Видаляє вказаний список бажань користувача
const deleteWishlist = async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login'); // Перенаправлення на сторінку входу
    }

    const { id } = req.params;
    
    try {
        await Wishlist.deleteWishlist(id, req.session.user.id);
        res.redirect('/wishlists');
    } catch (err) {
        console.error('Помилка видалення списку бажань:', err);
        res.redirect('/wishlists');
    }
};

module.exports = {
    showWishlists,
    createWishlist,
    deleteWishlist,
};