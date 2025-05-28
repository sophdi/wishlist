// routes/wishlistRoutes.js

const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { requireAuth } = require('../middleware/authMiddleware');
const { body } = require('express-validator');

// Валідація для вішліста
const validateWishlist = [
  body('title')
    .trim()
    .notEmpty().withMessage('Назва обовʼязкова')
    .isLength({ min: 1, max: 100 })
    .withMessage('Назва має бути від 1 до 100 символів'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Опис не може перевищувати 500 символів')
];

// CRUD для вішлістів
router.get('/', requireAuth, wishlistController.showWishlists);
router.get('/search', requireAuth, wishlistController.searchWishlists);
router.get('/:id', requireAuth, wishlistController.getWishlistDetail);
router.get('/:id/wishes/search', requireAuth, wishlistController.searchWishes);
router.get('/:id/wishes/json', requireAuth, wishlistController.getWishesJson);
router.post('/create', requireAuth, validateWishlist, wishlistController.create);
router.post('/:id/edit', requireAuth, validateWishlist, wishlistController.update);
router.post('/:id/delete', requireAuth, wishlistController.delete); 

module.exports = router;