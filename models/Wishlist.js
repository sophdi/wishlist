//models/Wishlist.js
const pool = require('../config/db');

class Wishlist {
  // Повертає всі вішлісти користувача
  static async findAll(userId) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          w.*,
          COUNT(DISTINCT wi.id) as wishes_count,
          SUM(CASE WHEN wi.priority = 'high' THEN 1 ELSE 0 END) as high_priority_count
        FROM wishlists w
        LEFT JOIN wishes wi ON w.id = wi.wishlist_id
        WHERE w.user_id = ?
        GROUP BY w.id
        ORDER BY w.created_at DESC
      `, [userId]);

      return rows;
    } catch (error) {
      console.error('Error finding all wishlists:', error);
      throw error;
    }
  }

  // Повертає вішліст за id та userId з кількістю бажань, або null якщо не знайдено
  static async findById(wishlistId, userId) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          w.*,
          COUNT(DISTINCT wi.id) as wishes_count
        FROM wishlists w
        LEFT JOIN wishes wi ON w.id = wi.wishlist_id
        WHERE w.id = ? AND w.user_id = ?
        GROUP BY w.id
      `, [wishlistId, userId]);

      return rows[0] || null;
    } catch (error) {
      console.error('Error finding wishlist:', error);
      throw error;
    }
  }

  // Створює новий вішліст для користувача, повертає id нового запису
  static async create(userId, { title, description }) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO wishlists (user_id, title, description) VALUES (?, ?, ?)',
        [userId, title, description || null]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error creating wishlist:', error);
      throw error;
    }
  }

  // Оновлює вішліст за id та userId
  static async update(wishlistId, userId, { title, description }) {
    try {
      const [result] = await pool.execute(
        'UPDATE wishlists SET title = ?, description = ? WHERE id = ? AND user_id = ?',
        [title, description, wishlistId, userId]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating wishlist:', error);
      throw error;
    }
  }

  // Видаляє вішліст та всі його бажання у транзакції, повертає true якщо видалено
  static async delete(wishlistId, userId) {
    let connection;
    try {
      connection = await pool.getConnection();
      await connection.beginTransaction();

      // Видаляє всі бажання вішліста
      await connection.execute(
        'DELETE FROM wishes WHERE wishlist_id = ?',
        [wishlistId]
      );

      // Видаляє сам вішліст
      const [result] = await connection.execute(
        'DELETE FROM wishlists WHERE id = ? AND user_id = ?',
        [wishlistId, userId]
      );

      await connection.commit();
      return result.affectedRows > 0;
    } catch (error) {
      if (connection) await connection.rollback();
      console.error('Error deleting wishlist:', error);
      throw error;
    } finally {
      if (connection) connection.release();
    }
  }

  // Пошук по вішлістах
  static async search(userId, searchTerm) {
    try {
      const [rows] = await pool.execute(`
        SELECT 
          w.*,
          COUNT(DISTINCT wi.id) as wishes_count
        FROM wishlists w
        LEFT JOIN wishes wi ON w.id = wi.wishlist_id
        WHERE w.user_id = ? 
        AND (
          w.title LIKE ? 
          OR w.description LIKE ?
        )
        GROUP BY w.id
        ORDER BY w.created_at DESC
      `, [userId, `%${searchTerm}%`, `%${searchTerm}%`]);
      
      return rows;
    } catch (error) {
      console.error('Error searching wishlists:', error);
      throw error;
    }
  }
}

module.exports = Wishlist;