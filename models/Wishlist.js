// models/Wishlist.js

const db = require('../config/db');

// Створення нового списку бажань
const createWishlist = (userId, title, description = null) => {
  return new Promise((resolve, reject) => {
    const sql =
      'INSERT INTO wishlists (user_id, title, description) VALUES (?, ?, ?)';
    db.query(sql, [userId, title, description], (err, result) => {
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

// Оновлення списку бажань
const updateWishlist = (wishlistId, userId, title, description) => {
  return new Promise((resolve, reject) => {
    const sql = `
            UPDATE wishlists 
            SET title = ?, description = ? 
            WHERE id = ? AND user_id = ?
        `;
    db.query(sql, [title, description, wishlistId, userId], (err, result) => {
      if (err) reject(err);
      resolve(result);
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

// Отримання списків бажань з підрахунком елементів
const getUserWishlistsWithCount = (userId) => {
  return new Promise((resolve, reject) => {
    const sql = `
            SELECT 
                w.id, 
                w.title, 
                w.description, 
                w.user_id, 
                w.created_at,
                COUNT(wi.id) AS items_count
            FROM wishlists w
            LEFT JOIN wishes wi ON w.id = wi.wishlist_id
            WHERE w.user_id = ?
            GROUP BY w.id, w.title, w.description, w.user_id, w.created_at
        `;
    db.query(sql, [userId], (err, results) => {
      if (err) reject(err);
      resolve(results);
    });
  });
};

// Отримання списку бажань за його ID
const getWishlistById = (wishlistId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM wishlists WHERE id = ?';
    db.query(sql, [wishlistId], (err, results) => {
      if (err) reject(err);
      resolve(results[0]);
    });
  });
};

module.exports = {
  createWishlist,
  getUserWishlists,
  deleteWishlist,
  updateWishlist,
  getUserWishlistsWithCount,
  getWishlistById,
};
