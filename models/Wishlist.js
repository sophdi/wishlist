const pool = require('../config/db');

class Wishlist {
  static async getWishlistsByUserId(userId) {
    try {
      const [rows] = await pool.execute(
        `SELECT w.id, w.title, w.description, w.created_at, COUNT(wi.id) as items_count
         FROM wishlists w
         LEFT JOIN wishes wi ON w.id = wi.wishlist_id
         WHERE w.user_id = ?
         GROUP BY w.id, w.title, w.description, w.created_at`,
        [userId]
      );
      return rows;
    } catch (error) {
      console.error('Error in getWishlistsByUserId:', error);
      throw error;
    }
  }

  static async getWishlistById(id, userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM wishlists WHERE id = ? AND user_id = ?',
        [id, userId]
      );
      return rows[0];
    } catch (error) {
      console.error(
        `Error in getWishlistById (id: ${id}, userId: ${userId}):`,
        error
      );
      throw error;
    }
  }

  static async createWishlist(userId, title, description) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO wishlists (user_id, title, description) VALUES (?, ?, ?)',
        [userId, title, description || null]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error in createWishlist:', error);
      throw error;
    }
  }

  static async updateWishlist(id, userId, title, description) {
    try {
      await pool.execute(
        'UPDATE wishlists SET title = ?, description = ? WHERE id = ? AND user_id = ?',
        [title, description || null, id, userId]
      );
    } catch (error) {
      console.error(`Error in updateWishlist (id: ${id}):`, error);
      throw error;
    }
  }

  static async deleteWishlist(id, userId) {
    try {
      await pool.execute('DELETE FROM wishlists WHERE id = ? AND user_id = ?', [
        id,
        userId,
      ]);
    } catch (error) {
      console.error(`Error in deleteWishlist (id: ${id}):`, error);
      throw error;
    }
  }

  static async addWish(wishlistId, userId, title, description) {
    try {
      await pool.execute(
        'INSERT INTO wishes (wishlist_id, title, description) VALUES (?, ?, ?)',
        [wishlistId, title, description || null]
      );
    } catch (error) {
      console.error(`Error in addWish (wishlistId: ${wishlistId}):`, error);
      throw error;
    }
  }

  static async editWish(wishId, wishlistId, userId, title, description) {
    try {
      await pool.execute(
        'UPDATE wishes SET title = ?, description = ? WHERE id = ? AND wishlist_id = ?',
        [title, description || null, wishId, wishlistId]
      );
    } catch (error) {
      console.error(`Error in editWish (wishId: ${wishId}):`, error);
      throw error;
    }
  }

  static async deleteWish(wishId, wishlistId, userId) {
    try {
      await pool.execute(
        'DELETE FROM wishes WHERE id = ? AND wishlist_id = ?',
        [wishId, wishlistId]
      );
    } catch (error) {
      console.error(`Error in deleteWish (wishId: ${wishId}):`, error);
      throw error;
    }
  }

  static async getWishesByWishlistId(wishlistId, userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM wishes WHERE wishlist_id = ?',
        [wishlistId]
      );
      return rows;
    } catch (error) {
      console.error(
        `Error in getWishesByWishlistId (wishlistId: ${wishlistId}):`,
        error
      );
      throw error;
    }
  }
}

module.exports = Wishlist;
