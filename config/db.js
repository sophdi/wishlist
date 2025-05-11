//config/db.js
const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) {
    // eslint-disable-next-line no-console
    console.error('Помилка підключення до бази:', err);
    return;
  }
  // eslint-disable-next-line no-console
  console.log('База даних підключена');
});

module.exports = db;
