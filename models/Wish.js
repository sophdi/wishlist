// models/Wish.js
const pool = require('../config/db');

class Wish {
  // Константи для валідації та дефолтних значень полів бажання
  static get CONSTANTS() {
    return {
      PRIORITIES: ['low', 'medium', 'high'],
      STATUSES: ['active', 'completed', 'archived'],
      DEFAULT_CURRENCY: 'UAH',
      MAX_TITLE_LENGTH: 255,
      MAX_LINK_LENGTH: 1024
    };
  }

  // Повертає всі бажання для заданого wishlistId, відсортовані за датою створення (новіші першими)
  static async findByWishlistId(wishlistId, orderBy = 'created_at DESC') {
    // Захист від SQL-інʼєкцій: приймайте orderBy тільки з білого списку у контролері!
    try {
      const [rows] = await pool.execute(`
        SELECT 
          id,
          title,
          description,
          price,
          currency,
          priority,
          status,
          link,
          image_url,
          created_at,
          updated_at
        FROM wishes 
        WHERE wishlist_id = ?
        ORDER BY ${orderBy}
      `, [wishlistId]);
      return rows;
    } catch (error) {
      console.error('Error finding wishes:', error);
      throw error;
    }
  }

  // Повертає бажання за id та wishlistId, або null якщо не знайдено
  static async findById(id, wishlistId) {
    try {
      const [rows] = await pool.execute(`
        SELECT * FROM wishes 
        WHERE id = ? AND wishlist_id = ?
      `, [id, wishlistId]);

      return rows[0] || null;
    } catch (error) {
      console.error('Error finding wish:', error);
      throw error;
    }
  }

  // Створює нове бажання у вказаному вішлісті, повертає id нового запису
  static async create(wishlistId, wishData) {
    try {
      const [result] = await pool.execute(`
      INSERT INTO wishes (wishlist_id, title, description, price, currency, priority, link, image_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        wishlistId,
        wishData.title,
        wishData.description || null,
        wishData.price || null,
        wishData.currency || 'UAH',
        wishData.priority || 'medium',
        wishData.link || null,
        wishData.image_url || null
      ]);
      return result.insertId;
    } catch (error) {
      console.error('Error creating wish:', error);
      throw error;
    }
  }

  // Оновлює дані бажання за id та wishlistId, повертає true якщо оновлено
  static async update(id, wishlistId, wishData) {
    try {
      const [result] = await pool.execute(`
        UPDATE wishes 
        SET 
          title = ?,
          description = ?,
          price = ?,
          currency = ?,
          priority = ?,
          status = ?,
          link = ?,
          image_url = ?
        WHERE id = ? AND wishlist_id = ?
      `, [
        wishData.title,
        wishData.description || null,
        wishData.price || null,
        wishData.currency || this.CONSTANTS.DEFAULT_CURRENCY,
        wishData.priority || 'medium',
        wishData.status || 'active',
        wishData.link || null,
        wishData.image_url || null,
        id,
        wishlistId
      ]);

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating wish:', error);
      throw error;
    }
  }

  // Видаляє бажання за id та wishlistId, повертає true якщо видалено
  static async delete(id, wishlistId) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM wishes WHERE id = ? AND wishlist_id = ?',
        [id, wishlistId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting wish:', error);
      throw error;
    }
  }

  // Оновлює статус бажання за id та wishlistId, повертає true якщо оновлено
  static async updateStatus(id, wishlistId, status) {
    try {
      const [result] = await pool.execute(
        'UPDATE wishes SET status = ? WHERE id = ? AND wishlist_id = ?',
        [status, id, wishlistId]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error updating wish status:', error);
      throw error;
    }
  }

  // Пошук по бажаннях
  static async search(wishlistId, searchTerm) {
    try {
      const [rows] = await pool.execute(`
        SELECT * FROM wishes 
        WHERE wishlist_id = ? 
        AND (
          title LIKE ? 
          OR description LIKE ?
        )
        ORDER BY created_at DESC
      `, [wishlistId, `%${searchTerm}%`, `%${searchTerm}%`]);
      
      return rows;
    } catch (error) {
      console.error('Error searching wishes:', error);
      throw error;
    }
  }

  // Пошук по бажаннях з розширеними опціями
  static async search(wishlistId, searchTerm, options = {}) {
    try {
      const allowedSortFields = ['created_at', 'price', 'priority', 'title'];
      const sortField = allowedSortFields.includes(options.sortBy) ? options.sortBy : 'created_at';
      const sortOrder = options.sortOrder === 'DESC' ? 'DESC' : 'ASC';

      const sql = `
        SELECT * FROM wishes
        WHERE wishlist_id = ?
          AND (
            LOWER(title) LIKE LOWER(?)
            OR LOWER(description) LIKE LOWER(?)
          )
        ORDER BY ${sortField} ${sortOrder}
      `;

      const searchPattern = `%${searchTerm}%`;
      const queryParams = [wishlistId, searchPattern, searchPattern];

      const [rows] = await pool.execute(sql, queryParams);
      return rows;
    } catch (error) {
      console.error('Error searching wishes:', error);
      throw error;
    }
  }

  // Підрахунок кількості бажань для користувача за його id
  static async countByUserId(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as total FROM wishes WHERE wishlist_id IN (SELECT id FROM wishlists WHERE user_id = ?)',
        [userId]
      );
      return rows[0]?.total || 0;
    } catch (error) {
      console.error('Error counting wishes:', error);
      throw error;
    }
  }
}

module.exports = Wish;