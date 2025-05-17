// models/User.js
const pool = require('../config/db');

class User {
  static async createUser(username, email, password) {
    await pool.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, password]
    );
  }

  static async findUserByEmail(email) {
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  static async findUserById(id) {
    const [rows] = await pool.execute('SELECT id, username, email, created_at, profile_image_url, about_me, birthday FROM users WHERE id = ?', [id]); // Додано profile_image_url та інші поля
    return rows[0];
  }

  static async updateUser(id, userData) {
    const fields = [];
    const values = [];

    // Динамічно формуємо запит на оновлення
    // на основі переданих даних в userData
    if (userData.username !== undefined) {
      fields.push('username = ?');
      values.push(userData.username);
    }
    if (userData.email !== undefined) {
      fields.push('email = ?');
      values.push(userData.email);
    }
    if (userData.profile_image_url !== undefined) {
      fields.push('profile_image_url = ?');
      values.push(userData.profile_image_url);
    }
    // Тут можна додати оновлення інших полів, якщо вони будуть у userData
    // наприклад, about_me, birthday

    if (fields.length === 0) {
      // Немає полів для оновлення
      return;
    }

    values.push(id); // Додаємо id для умови WHERE

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    await pool.execute(sql, values);
  }
}

module.exports = User;