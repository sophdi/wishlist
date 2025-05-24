const db = require('../config/db');

// Створення бажання
const createWish = ({ wishlistId, title, description, price, currency, priority, link, photoUrl }) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO wishes (wishlist_id, title, description, price, currency, priority, link, photo_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(sql, [wishlistId, title, description, price || null, currency, priority, link, photoUrl], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return reject(err);
      }
      resolve(result);
    });
  });
};

module.exports = { createWish };