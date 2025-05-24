// routes/wishRoutes.js

const express = require('express');
const router = express.Router();
const WishController = require('../controllers/wishController');
const { requireAuth } = require('../middleware/authMiddleware');
const { uploadWishPhoto } = require('../middleware/uploadMiddleware');
const { body } = require('express-validator');

// Валідація бажання
const validateWish = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Назва має бути від 1 до 255 символів'),
  body('description')
    .optional({ nullable: true })
    .trim(),
  body('price')
    .optional({ nullable: true })
    .isFloat({ min: 0 })
    .withMessage('Ціна має бути додатним числом'),
  body('currency')
    .optional({ nullable: true })
    .isLength({ min: 3, max: 3 })
    .withMessage('Неправильний формат валюти'),
  body('priority')
    .optional({ nullable: true })
    .isIn(['low', 'medium', 'high'])
    .withMessage('Неправильний пріоритет'),
  body('status')
    .optional({ nullable: true })
    .isIn(['active', 'completed', 'archived'])
    .withMessage('Неправильний статус'),
  body('link')
    .optional({ nullable: true })
    .isURL()
    .withMessage('Неправильний формат посилання')
];

// CRUD для бажань
router.post(
  '/:wishlistId/wishes',
  requireAuth,
  uploadWishPhoto.single('image'),
  validateWish,
  WishController.createWish
);

router.put(
  '/:wishlistId/wishes/:wishId',
  requireAuth,
  uploadWishPhoto.single('image'),
  validateWish,
  WishController.updateWish
);

router.patch(
  '/:wishlistId/wishes/:wishId/status',
  requireAuth,
  WishController.updateWishStatus
);

router.delete(
  '/:wishlistId/wishes/:wishId',
  requireAuth,
  WishController.deleteWish
);

module.exports = router;