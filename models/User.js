const db = require('../config/db');

// Функція для створення нового користувача
const createUser = (username, email, hashedPassword) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(sql, [username, email, hashedPassword], (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
};

// Функція для пошуку користувача за email
const findUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE email = ?';
        db.query(sql, [email], (err, result) => {
            if (err) reject(err);
            resolve(result[0]);
        });
    });
};

module.exports = {
    createUser,
    findUserByEmail,
};