const express = require('express');
const { showProfile, updateProfile } = require('../controllers/profileController');
const { uploadAvatar } = require('../middleware/uploadMiddleware');
const multer = require('multer');

const router = express.Router();

router.get('/', showProfile);

router.post('/', (req, res, next) => {
  uploadAvatar.single('avatar')(req, res, function (err) {
    // Обробка помилок завантаження файлу
    if (err instanceof multer.MulterError || err) {
      req.flash('error', err.message);
      return res.redirect('/profile');
    }
    next();
  });
}, updateProfile);

module.exports = router;
