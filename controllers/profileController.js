//controllers/profileController.js
// Контролер профілю користувача
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const sharp = require('sharp');
const bcrypt = require('bcryptjs');

/**
 * Відображення сторінки профілю користувача.
 * Витягує дані користувача з БД та flash-дані для форми.
 */
const showProfile = async (req, res) => {
  try {
    const user = await User.findUserById(req.session.user.id);
    const formDataFlash = req.flash('formData');
    const formData = formDataFlash.length > 0 ? formDataFlash[0] : {};

    res.render('profile/index', {
      user,
      errors: req.flash('validationErrors') || [],
      formData: formData
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).render('error', { message: 'Помилка при завантаженні профілю' });
  }
};
/**
 * Оновлення профілю користувача.
 * Включає валідацію, зміну пароля, обробку аватара, оновлення БД та сесії.
 */
const updateProfile = [
    // Валідація полів профілю
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
  body('about_me')
    .trim()
    .isLength({ max: 1000 }).withMessage('Розповідь про себе не повинна перевищувати 1000 символів.')
    .escape(),
  body('birthday')
    .optional({ checkFalsy: true })
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('Невірний формат дати народження (очікується YYYY-MM-DD).'),

  // Валідація пароля (тільки якщо змінюється)
  body('currentPassword')
    .if(body('newPassword').notEmpty())
    .notEmpty().withMessage('Поточний пароль є обов\'язковим для зміни пароля.'),
  body('newPassword')
    .if(body('newPassword').notEmpty())
    .isLength({ min: 6 }).withMessage('Новий пароль має містити щонайменше 6 символів.'),
  body('confirmNewPassword')
    .if(body('newPassword').notEmpty())
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Нові паролі не співпадають.');
      }
      return true;
    }),

  async (req, res) => {
    const errors = validationResult(req);
    let userForRender;
    // 1. Витягуємо користувача для оновлення
    try {
      userForRender = await User.findUserById(req.session.user.id);
      if (!userForRender) {
        req.flash('error', 'Користувача не знайдено.');
        return res.redirect('/auth/login'); 
      }
    } catch (fetchError) {
      console.error('Error fetching user for profile update:', fetchError);
      req.flash('error', 'Помилка при завантаженні даних профілю.');
      return res.redirect('/profile');
    }

    // 2. Не передаємо паролі назад у formData (безпека)
    const { currentPassword, newPassword, confirmNewPassword, ...otherFormData } = req.body;
    // 3. Якщо є помилки валідації — повертаємо форму з помилками
    if (!errors.isEmpty()) {
      req.flash('validationErrors', errors.array());
      req.flash('formData', otherFormData);
      return res.redirect('/profile');
    }

    let newAvatarFileToDeleteOnError = null;

    try {
      const { username, email, about_me } = req.body;
      let birthdayValue = req.body.birthday;

      if (birthdayValue === undefined || birthdayValue === '') {
        birthdayValue = null;
      }

      const userDataToUpdate = { username, email, about_me, birthday: birthdayValue };
      const oldAvatarPathFromDB = userForRender.profile_image_url;

      // 4. Логіка зміни пароля (тільки якщо користувач хоче змінити)
      if (newPassword && newPassword.trim() !== '') {
        const isMatch = await bcrypt.compare(currentPassword, userForRender.password);
        if (!isMatch) {
          req.flash('error', 'Невірний поточний пароль.');
          req.flash('formData', otherFormData);
          return res.redirect('/profile');
        }
        // Хешуємо новий пароль
        const salt = await bcrypt.genSalt(10);
        userDataToUpdate.password = await bcrypt.hash(newPassword, salt);
      }
      // 5. Обробка аватара (збереження, конвертація, видалення старого)
      if (req.file) {
        const originalPath = req.file.path;
        const fileName = req.file.filename;
        const outputFileName = fileName.replace(/\.[^/.]+$/, '') + '.webp';

        await sharp(originalPath)
          .resize(200, 200, { 
            fit: 'cover',
            position: sharp.strategy.entropy
          })
          .webp({ quality: 90 })
          .toFile(path.join(path.dirname(originalPath), outputFileName));

        userDataToUpdate.profile_image_url = `/uploads/avatars/${outputFileName}`;
        newAvatarFileToDeleteOnError = path.join(path.dirname(originalPath), outputFileName);
        // Видаляємо оригінал після успішної конвертації
        try {
          await fsp.unlink(originalPath);
        } catch (unlinkErr) {
          console.error('Failed to delete original uploaded avatar after WebP conversion:', unlinkErr);
        }
      }
      // 6. Оновлення користувача в БД (тільки якщо є зміни)
      if (Object.keys(userDataToUpdate).length > 0 || userDataToUpdate.password) {
        await User.updateUser(req.session.user.id, userDataToUpdate);
      }
      // 7. Видалення старого аватара (якщо змінився)
      if (userDataToUpdate.profile_image_url && 
          oldAvatarPathFromDB && 
          oldAvatarPathFromDB !== userDataToUpdate.profile_image_url && 
          oldAvatarPathFromDB !== '/images/default-avatar.png') {
        const fullOldPath = path.join(__dirname, '..', 'public', oldAvatarPathFromDB);
        // FIX Не використовуйте fs.existsSync у продакшені — краще fsp.access
        if (fs.existsSync(fullOldPath)) {
          try {
            await fsp.unlink(fullOldPath);
          } catch (err) {
            console.error('Failed to delete old avatar after successful update:', err);
          }
        }
      }
      // 8. Оновлення сесії (щоб зміни відобразились одразу)
      if (username && req.session.user.username !== username) {
        req.session.user.username = username;
      }
      if (userDataToUpdate.profile_image_url && req.session.user.profile_image_url !== userDataToUpdate.profile_image_url) {
        req.session.user.profile_image_url = userDataToUpdate.profile_image_url;
      }
      
      req.flash('success', 'Профіль успішно оновлено' + (userDataToUpdate.password ? ', пароль змінено.' : '.'));
      res.redirect('/profile');

    } catch (error) {
      // 9. Якщо сталася помилка — видаляємо новий аватар, якщо він був створений
      console.error('Error updating profile in controller:', error);
      
      if (newAvatarFileToDeleteOnError && fs.existsSync(newAvatarFileToDeleteOnError)) {
        try {
          await fsp.unlink(newAvatarFileToDeleteOnError);
        } catch (unlinkErr) {
          console.error('Failed to delete new avatar file on profile update error:', unlinkErr);
        }
      }
      
      req.flash('error', 'Помилка при оновленні профілю.');
      req.flash('formData', otherFormData);
      res.redirect('/profile');
    }
  }
];

module.exports = {
  showProfile,
  updateProfile
};