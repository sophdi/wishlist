// config/db.js

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  //connectionLimit: 10,
  queueLimit: 0,

   // === Рекомендовані налаштування для дат ===
  dateStrings: false, // Повертати JS Date об'єкти (це значення за замовчуванням)
  timezone: '+00:00'  // Всі операції з датами в UTC
  // =========================================
});



// test
pool.getConnection()
  .then(connection => {
    console.log('Database connected successfully');
    connection.release();
  })
  .catch(err => {
    console.error('Error connecting to the database:', err.message);
  });

module.exports = pool;
