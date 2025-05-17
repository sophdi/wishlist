const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const showProfile = async (req, res) => {
  try {
    const user = await User.findUserById(req.session.user.id);
    const formDataFlash = req.flash('formData');
    // req.flash повертає масив, беремо перший елемент, якщо він є, інакше порожній об'єкт
    const formData = formDataFlash.length > 0 ? formDataFlash[0] : {}; 

    res.render('profile/index', {
      user,
      errors: req.flash('validationErrors') || [],
      success: req.flash('success'),
      error: req.flash('error'),
      formData: formData // Передаємо formData до шаблону
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).render('error', { message: 'Помилка при завантаженні профілю' });
  }
};

const updateProfile = [
  body('username')
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('Ім\'я користувача має бути від 2 до 30 символів')
    .matches(/^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\s-]+$/)
    .withMessage('Ім\'я користувача може містити тільки літери, пробіли та дефіс'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Невірний формат email')
    .normalizeEmail(),
  async (req, res) => {
    const errors = validationResult(req);
    let userForRender;
    try {
      userForRender = await User.findUserById(req.session.user.id);
    } catch (fetchError) {
      console.error('Error fetching user for profile update:', fetchError);
      req.flash('error', 'Помилка при завантаженні даних профілю.');
      return res.redirect('/profile');
    }

    if (!errors.isEmpty()) {
      req.flash('validationErrors', errors.array());
      req.flash('formData', req.body);
      return res.redirect('/profile');
    }

    try {
      const { username, email } = req.body;
      const userDataToUpdate = { username, email };

      if (req.file) {
        userDataToUpdate.profile_image_url = `/uploads/avatars/${req.file.filename}`;
      }

      await User.updateUser(req.session.user.id, userDataToUpdate);
      
      if (username && req.session.user.username !== username) {
        req.session.user.username = username;
      }
      if (userDataToUpdate.profile_image_url && req.session.user.profile_image_url !== userDataToUpdate.profile_image_url) {
        req.session.user.profile_image_url = userDataToUpdate.profile_image_url;
      }
      
      req.flash('success', 'Профіль успішно оновлено');
      res.redirect('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      req.flash('error', 'Помилка при оновленні профілю.');
      res.redirect('/profile');
    }
  }
];

module.exports = {
  showProfile,
  updateProfile
};