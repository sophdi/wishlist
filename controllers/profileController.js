const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const sharp = require('sharp');
const bcrypt = require('bcryptjs'); // Додаємо bcrypt

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
  body('about_me')
    .trim()
    .isLength({ max: 1000 }).withMessage('Розповідь про себе не повинна перевищувати 1000 символів.')
    .escape(),
  body('birthday')
    .optional({ checkFalsy: true })
    .isISO8601({ strict: true, strictSeparator: true })
    .withMessage('Невірний формат дати народження (очікується YYYY-MM-DD).'),

  // Валідатори для пароля (спрацьовують, тільки якщо поля заповнені)
  body('currentPassword')
    .if(body('newPassword').notEmpty()) // Якщо введено новий пароль, поточний є обов'язковим
    .notEmpty().withMessage('Поточний пароль є обов\'язковим для зміни пароля.'),
  body('newPassword')
    .if(body('newPassword').notEmpty()) // Якщо поле нового пароля не порожнє
    .isLength({ min: 6 }).withMessage('Новий пароль має містити щонайменше 6 символів.'),
  body('confirmNewPassword')
    .if(body('newPassword').notEmpty()) // Якщо введено новий пароль, підтвердження є обов'язковим
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Нові паролі не співпадають.');
      }
      return true;
    }),

  async (req, res) => {
    const errors = validationResult(req);
    let userForRender;
    
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

    // Не передаємо значення полів пароля назад у formData для безпеки
    const { currentPassword, newPassword, confirmNewPassword, ...otherFormData } = req.body;

    if (!errors.isEmpty()) {
      req.flash('validationErrors', errors.array());
      req.flash('formData', otherFormData); // otherFormData НЕ містить паролів
      return res.redirect('/profile');
    }

    let newAvatarFileToDeleteOnError = null;

    try {
      const { username, email, about_me } = req.body; // currentPassword, newPassword, confirmNewPassword вже витягнуті
      let birthdayValue = req.body.birthday;

      if (birthdayValue === undefined || birthdayValue === '') {
        birthdayValue = null;
      }

      const userDataToUpdate = { username, email, about_me, birthday: birthdayValue };
      const oldAvatarPathFromDB = userForRender.profile_image_url;

      // Логіка зміни пароля
      if (newPassword && newPassword.trim() !== '') {
        // логування для діагностики
        // console.log('--- Debugging password change ---');
        // console.log('Value of currentPassword:', currentPassword);
        // console.log('Type of currentPassword:', typeof currentPassword);
        // console.log('Value of userForRender.password:', userForRender.password);
        // console.log('Type of userForRender.password:', typeof userForRender.password);
        // console.log('--- End of debugging ---');

        const isMatch = await bcrypt.compare(currentPassword, userForRender.password);
        if (!isMatch) {
          req.flash('error', 'Невірний поточний пароль.');
          req.flash('formData', otherFormData);
          return res.redirect('/profile');
        }
        // Новий пароль та підтвердження вже перевірені валідатором на співпадіння
        const salt = await bcrypt.genSalt(10);
        userDataToUpdate.password = await bcrypt.hash(newPassword, salt);
      }

      if (req.file) {
        const originalUploadedPath = req.file.path;
        const originalUploadedFilename = req.file.filename;
        
        const webpFilename = originalUploadedFilename.replace(/\.[^/.]+$/, '') + '.webp';
        const webpPath = path.join(path.dirname(originalUploadedPath), webpFilename);

        try {
          await sharp(originalUploadedPath)
            .resize(200, 200, { 
              fit: 'cover',
              position: sharp.strategy.entropy
            })
            .webp({ quality: 90 }) // Або інше значення якості
            .toFile(webpPath);

          userDataToUpdate.profile_image_url = `/uploads/avatars/${webpFilename}`;
          newAvatarFileToDeleteOnError = webpPath;

          try {
            await fsp.unlink(originalUploadedPath);
          } catch (unlinkErr) {
            console.error('Failed to delete original uploaded avatar after WebP conversion:', unlinkErr);
          }

        } catch (processingError) {
          console.error('Error processing image to WebP:', processingError);
          userDataToUpdate.profile_image_url = `/uploads/avatars/${originalUploadedFilename}`;
          newAvatarFileToDeleteOnError = originalUploadedPath;
          req.flash('info', 'Не вдалося оптимізувати зображення, використано оригінал.');
        }
      }
      // Кінець логіки обробки аватара

      // Перевіряємо, чи є що оновлювати (включаючи пароль)
      if (Object.keys(userDataToUpdate).length > 0 || userDataToUpdate.password) { // Додано userDataToUpdate.password для випадку, коли змінюється тільки пароль
        await User.updateUser(req.session.user.id, userDataToUpdate);
      }
      
      if (userDataToUpdate.profile_image_url && 
          oldAvatarPathFromDB && 
          oldAvatarPathFromDB !== userDataToUpdate.profile_image_url && 
          oldAvatarPathFromDB !== '/images/default-avatar.png') {
        const fullOldPath = path.join(__dirname, '..', 'public', oldAvatarPathFromDB);
        if (fs.existsSync(fullOldPath)) {
          try {
            await fsp.unlink(fullOldPath);
          } catch (err) {
            console.error('Failed to delete old avatar after successful update:', err);
          }
        }
      }
      
      if (username && req.session.user.username !== username) {
        req.session.user.username = username;
      }
      if (userDataToUpdate.profile_image_url && req.session.user.profile_image_url !== userDataToUpdate.profile_image_url) {
        req.session.user.profile_image_url = userDataToUpdate.profile_image_url;
      }
      
      req.flash('success', 'Профіль успішно оновлено' + (userDataToUpdate.password ? ', пароль змінено.' : '.'));
      res.redirect('/profile');

    } catch (error) {
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