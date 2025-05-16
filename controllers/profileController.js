const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const showProfile = async (req, res) => {
  try {
    const user = await User.findUserById(req.session.user.id);
    res.render('profile/index', {
      user,
      errors: [],
      success: req.flash('success')
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
    .withMessage("Ім'я користувача має бути від 2 до 30 символів")
    .matches(/^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\s-]+$/)
    .withMessage("Ім'я користувача може містити тільки літери, пробіли та дефіс"),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Невірний формат email')
    .normalizeEmail(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const user = await User.findUserById(req.session.user.id);
      return res.render('profile/index', {
        user,
        errors: errors.array()
      });
    }

    try {
      const { username, email } = req.body;
      await User.updateUser(req.session.user.id, { username, email });
      req.flash('success', 'Профіль успішно оновлено');
      res.redirect('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      const user = await User.findUserById(req.session.user.id);
      res.render('profile/index', {
        user,
        errors: [{ msg: 'Помилка при оновленні профілю' }]
      });
    }
  }
];

module.exports = {
  showProfile,
  updateProfile
}; 