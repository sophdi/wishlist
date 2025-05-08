const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { requireAuth } = require('../middleware/authMiddleware');

// Перегляд списків бажань (з перевіркою авторизації)
router.get('/', requireAuth, wishlistController.showWishlists);

// Створення нового списку бажань
router.post('/create', requireAuth, wishlistController.createWishlist);

// Видалення списку бажань
router.get('/delete/:id', requireAuth, wishlistController.deleteWishlist);

module.exports = router;