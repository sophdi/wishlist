// routes/wishlistRoutes.js

const express = require('express');
const router = express.Router();

const wishlistController = require('../controllers/wishlistController');
const { requireAuth } = require('../middleware/authMiddleware');

// Списки бажань
router.get('/', requireAuth, wishlistController.showWishlists);
router.get('/:id', requireAuth, wishlistController.showWishlistWithWishes);
router.post('/create', requireAuth, wishlistController.createWishlist);
router.post('/:id/edit', requireAuth, wishlistController.updateWishlist);
router.get('/delete/:id', requireAuth, wishlistController.deleteWishlist);

// Бажання
router.post('/:id/wishes/create', requireAuth, wishlistController.addWish);
router.post(
  '/:wishlistId/wishes/edit/:wishId',
  requireAuth,
  wishlistController.editWish
);
router.get(
  '/:wishlistId/wishes/delete/:wishId',
  requireAuth,
  wishlistController.deleteWish
);

module.exports = router;
