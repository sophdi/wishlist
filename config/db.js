const mysql = require('mysql2');
const dotenv = require('dotenv');

dotenv.config();

// конфіг для бази даних
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

db.connect((err) => {
    if (err) {
        console.error('Помилка підключення до бази:', err);
        return;
    }
    console.log('База даних підключена');
});

module.exports = db;