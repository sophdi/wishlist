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
    const [rows] = await pool.execute(
      'SELECT id, username, email, password, profile_image_url, about_me, birthday, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0]; // Повертає об'єкт користувача або undefined, якщо не знайдено
  }

  static async updateUser(id, userData) {
    const fields = [];
    const values = [];

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
    if (userData.about_me !== undefined) {
      fields.push('about_me = ?');
      values.push(userData.about_me);
    }
    if (userData.birthday !== undefined) {
      fields.push('birthday = ?');
      values.push(userData.birthday); 
    }
    // Додаємо обробку для поля password
    if (userData.password !== undefined) {
      fields.push('password = ?');
      values.push(userData.password); // Це буде новий захешований пароль
    }

    if (fields.length === 0) {
      return; // Немає полів для оновлення
    }

    values.push(id);

    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    await pool.execute(sql, values);
  }
}

module.exports = User;