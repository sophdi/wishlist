// routes/wishRoutes.js

const express = require('express');
const router = express.Router();
const WishController = require('../controllers/wishController');
const { requireAuth } = require('../middleware/authMiddleware');
const { uploadWishPhoto } = require('../middleware/uploadMiddleware');
const { body } = require('express-validator');

const validateWish = [
  body('title')
    .trim()
    .notEmpty().withMessage('Назва обовʼязкова')
    .isLength({ min: 1, max: 255 }).withMessage('Назва має бути від 1 до 255 символів'),
  body('description')
    .optional({ checkFalsy: true })
    .isLength({ max: 1000 }).withMessage('Опис не може перевищувати 1000 символів'),
  body('price')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 }).withMessage('Ціна має бути додатнім числом'),
  body('currency')
    .optional({ checkFalsy: true })
    .isIn(['UAH', 'USD', 'EUR']).withMessage('Невірна валюта'),
  body('priority')
    .optional({ checkFalsy: true })
    .isIn(['low', 'medium', 'high']).withMessage('Невірний пріоритет'),
  body('link')
    .optional({ checkFalsy: true })
    .isLength({ max: 1024 }).withMessage('Посилання занадто довге')
    .isURL().withMessage('Невірний формат посилання'),
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

router.post(
  '/:wishlistId/wishes/:wishId/delete',
  requireAuth,
  WishController.deleteWish
);

router.get(
  '/:wishlistId/wishes/:wishId',
  requireAuth,
  WishController.showWishDetail
);

module.exports = router;