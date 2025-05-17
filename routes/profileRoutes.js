const express = require('express');
const { showProfile, updateProfile } = require('../controllers/profileController');
const { requireAuth } = require('../middleware/authMiddleware');
const { uploadAvatar } = require('../middleware/uploadMiddleware'); // Імпортуємо наш middleware для завантаження аватарок

const router = express.Router();

// Profile routes - protected by authentication
router.get('/profile', requireAuth, showProfile);
// Додаємо uploadAvatar.single('avatar') перед updateProfile
// 'avatar' - це ім'я поля <input type="file" name="avatar"> у формі
router.post('/profile', requireAuth, uploadAvatar.single('avatar'), updateProfile);

module.exports = router;