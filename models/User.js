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
    const [rows] = await pool.execute('SELECT id, username, email, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  static async updateUser(id, { username, email }) {
    await pool.execute(
      'UPDATE users SET username = ?, email = ? WHERE id = ?',
      [username, email, id]
    );
  }
}

module.exports = User;