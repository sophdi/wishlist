const db = require('../config/db');

// Створення нового списку бажань
const createWishlist = (userId, title) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO wishlists (user_id, title) VALUES (?, ?)';
        db.query(sql, [userId, title], (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
};

// Отримання всіх списків бажань користувача
const getUserWishlists = (userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM wishlists WHERE user_id = ?';
        db.query(sql, [userId], (err, results) => {
            if (err) reject(err);
            resolve(results);
        });
    });
};

// Видалення списку бажань
const deleteWishlist = (wishlistId, userId) => {
    return new Promise((resolve, reject) => {
        const sql = 'DELETE FROM wishlists WHERE id = ? AND user_id = ?';
        db.query(sql, [wishlistId, userId], (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
};

module.exports = {
    createWishlist,
    getUserWishlists,
    deleteWishlist,
};