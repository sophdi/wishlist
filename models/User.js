// models/User.js
const pool = require('../config/db');
const { AuthError, ERROR_MESSAGES } = require('../utils/errors');

class User {
  // Додамо константи для валідації
  static get VALIDATION_RULES() {
    return {
      USERNAME_MIN_LENGTH: 3,
      USERNAME_MAX_LENGTH: 30,
      PASSWORD_MIN_LENGTH: 6
    };
  }

  // Виконує SQL-запит з обробкою помилок БД
  static async executeQuery(sql, params = []) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw new AuthError(ERROR_MESSAGES.SERVER_ERROR, 500);
    }
  
  }
// Створює нового користувача
  static async createUser(username, email, password) {
    const sql = `
      INSERT INTO users (username, email, password) 
      VALUES (?, ?, ?)
    `;

    try {
      const result = await this.executeQuery(sql, [username, email, password]);
      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('email')) {
          throw new AuthError(ERROR_MESSAGES.EMAIL_EXISTS, 400);
        }
        if (error.message.includes('username')) {
          throw new AuthError(ERROR_MESSAGES.USERNAME_EXISTS, 400);
        }
      }
      throw error;
    }
  }

  static async findUserByEmail(email) {
    const sql = 'SELECT * FROM users WHERE email = ?';
    const rows = await this.executeQuery(sql, [email]);
    return rows[0] || null;
  }

  static async findUserById(id) {
    const sql = 'SELECT id, username, email, birthday, about_me, profile_image_url FROM users WHERE id = ?';
    const rows = await this.executeQuery(sql, [id]);
    return rows[0] || null;
  }

  static async updateUser(id, userData) {
    const allowedFields = [
      'username', 'email', 'profile_image_url',
      'about_me', 'birthday', 'password'
    ];

    const fields = [];
    const values = [];

    // Фільтруємо і валідуємо поля
    for (const [key, value] of Object.entries(userData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return null;

    values.push(id);
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;

    try {
      const result = await this.executeQuery(sql, values);
      return result.affectedRows > 0;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new AuthError(ERROR_MESSAGES.EMAIL_EXISTS, 400);
      }
      throw error;
    }
  }

  // Перевіряє, чи існує користувач з таким email.
  static async checkEmailExists(email) {
    const sql = 'SELECT COUNT(*) as count FROM users WHERE email = ?';
    const [result] = await this.executeQuery(sql, [email]);
    return result.count > 0;
  }
}

module.exports = User;