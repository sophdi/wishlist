const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// роути авторизації
router.get('/register', authController.showRegisterForm);
router.post('/register', authController.registerUser);

router.get('/login', authController.showLoginForm);
router.post('/login', authController.loginUser);

router.get('/logout', authController.logoutUser);

module.exports = router;