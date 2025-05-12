// routes/authRoutes.js
const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

// Форма реєстрації
router.get('/register', authController.showRegisterForm);

// Обробка реєстрації
router.post('/register', authController.registerUser);

// Форма входу
router.get('/login', authController.showLoginForm);

// Обробка входу
router.post('/login', authController.loginUser);

// Вихід із системи
router.get('/logout', authController.logoutUser);

module.exports = router;
