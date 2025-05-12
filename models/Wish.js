// models/Wish.js
// модель для роботи з таблицею "wishes" у бд

const db = require('../config/db');

// Додавання нового бажання до списку бажань
const createWish = (
  wishlistId,
  title,
  description,
  price,
  currency,
  priority,
  link
) => {
  return new Promise((resolve, reject) => {
    const sql = `
            INSERT INTO wishes (wishlist_id, title, description, price, currency, priority, link)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
    db.query(
      sql,
      [wishlistId, title, description, price || null, currency, priority, link], // price може бути null
      (err, result) => {
        if (err) reject(err); 
        resolve(result); 
      }
    );
  });
};

// Отримання всіх бажань за ідентифікатором списку бажань
const getWishesByWishlistId = (wishlistId) => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT * FROM wishes WHERE wishlist_id = ?';
    db.query(sql, [wishlistId], (err, results) => {
      if (err) reject(err); 
      resolve(results); 
    });
  });
};

// Оновлення існуючого бажання
const updateWish = (
  wishId,
  title,
  description,
  price,
  currency,
  priority,
  link
) => {
  return new Promise((resolve, reject) => {
    const numericPrice = price ? parseFloat(price) : null; // Конвертуємо price у число або null

    const sql = `
            UPDATE wishes 
            SET title = ?, description = ?, price = ?, currency = ?, priority = ?, link = ?
            WHERE id = ?
        `;
    db.query(
      sql,
      [title, description, numericPrice, currency, priority, link, wishId], // Передаємо параметри для оновлення
      (err, result) => {
        if (err) reject(err); 
        resolve(result); 
      }
    );
  });
};

// Видалення бажання за його ідентифікатором
const deleteWish = (wishId) => {
  return new Promise((resolve, reject) => {
    const sql = 'DELETE FROM wishes WHERE id = ?';
    db.query(sql, [wishId], (err, result) => {
      if (err) reject(err); 
      resolve(result); 
    });
  });
};

module.exports = {
  createWish,
  updateWish,
  getWishesByWishlistId,
  deleteWish,
};
