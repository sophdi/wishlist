const express = require('express');
const { showProfile, updateProfile } = require('../controllers/profileController');
const { requireAuth } = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../middleware/uploadMiddleware'); // Імпортуємо наш middleware
const multer = require('multer'); // Потрібно для instanceof MulterError

const router = express.Router();

// Profile routes - protected by authentication
router.get('/profile', requireAuth, showProfile);

router.post('/profile', requireAuth, (req, res, next) => {
  uploadAvatar.single('avatar')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // Помилка Multer (наприклад, розмір файлу завеликий)
      req.flash('error', err.message);
      return res.redirect('/profile');
    } else if (err) {
      // Інша помилка (наприклад, наш фільтр типів файлів спрацював)
      req.flash('error', err.message);
      return res.redirect('/profile');
    }
    // Якщо помилок немає, передаємо управління далі
    next();
  });
}, updateProfile);

module.exports = router;