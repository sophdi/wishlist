const mysql = require('mysql2/promise');
require('dotenv').config();

// Створюємо пул підключень до бази даних MySQL
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  
  // Форматування дат та часовий пояс
  dateStrings: false,
  timezone: '+00:00',
  
  // Параметри для стабільності з'єднання
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  
  // SSL-налаштування для захищеного підключення (активується у production)
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : undefined
});

// Логування кожного нового підключення до бази даних
pool.on('connection', (connection) => {
  console.log('New connection established with threadId:', connection.threadId);
});

// Обробка неочікуваних помилок пулу підключень
pool.on('error', (err) => {
  console.error('Unexpected error on idle connection', err);
  process.exit(-1);
});

// Функція для перевірки з'єднання
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Підключення до бази даних успішне');
    connection.release();
  } catch (err) {
    console.error('Помилка підключення до бази даних:', err.message);
    process.exit(-1);
  }
};

// Виконуємо перевірку при старті
testConnection();

module.exports = pool;