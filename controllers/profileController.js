const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const fs = require('fs'); // Додаємо модуль fs
const path = require('path'); // Додаємо модуль path

const showProfile = async (req, res) => {
  try {
    const user = await User.findUserById(req.session.user.id);
    const formDataFlash = req.flash('formData');
    const formData = formDataFlash.length > 0 ? formDataFlash[0] : {}; 

    // console.log('RES.LOCALS.SUCCESS (in showProfile):', res.locals.success); 
    // console.log('RES.LOCALS.ERROR (in showProfile):', res.locals.error);  

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
  async (req, res) => {
    const errors = validationResult(req);
    let userForRender; // Зберігатиме поточні дані користувача для рендерингу
    
    try {
      // Завжди отримуємо поточні дані користувача для можливого рендерингу
      // або для отримання старого шляху до аватарки
      userForRender = await User.findUserById(req.session.user.id);
      if (!userForRender) {
        // Малоймовірно, якщо користувач автентифікований, але для безпеки
        req.flash('error', 'Користувача не знайдено.');
        return res.redirect('/auth/login'); 
      }
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
      const oldAvatarPath = userForRender.profile_image_url; // Зберігаємо старий шлях

      if (req.file) {
        userDataToUpdate.profile_image_url = `/uploads/avatars/${req.file.filename}`;
      }

      await User.updateUser(req.session.user.id, userDataToUpdate);
      
      // Тепер, після успішного оновлення БД, видаляємо стару аватарку, якщо була завантажена нова
      if (req.file && oldAvatarPath && oldAvatarPath !== '/images/default-avatar.png') {
        const fullOldPath = path.join(__dirname, '..', 'public', oldAvatarPath);
        if (fs.existsSync(fullOldPath)) {
          fs.unlink(fullOldPath, (err) => {
            if (err) {
              console.error('Failed to delete old avatar after successful update:', err);
              // Не перериваємо процес, оновлення профілю важливіше, але логуємо помилку
            }
          });
        }
      }
      
      // Оновлюємо дані користувача в сесії
      if (username && req.session.user.username !== username) {
        req.session.user.username = username;
      }
      
      // Оновлюємо аватарку в сесії, якщо вона дійсно змінилася
      // userDataToUpdate.profile_image_url встановлюється, тільки якщо req.file існує
      if (userDataToUpdate.profile_image_url && req.session.user.profile_image_url !== userDataToUpdate.profile_image_url) {
        req.session.user.profile_image_url = userDataToUpdate.profile_image_url;
      }
      
      req.flash('success', 'Профіль успішно оновлено');
      res.redirect('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      // Якщо сталася помилка під час оновлення, і новий файл вже був завантажений,
      // його варто було б видалити, щоб не залишати "сирітські" файли.
      // Це більш складна логіка, яку можна додати пізніше.
      if (req.file) {
        const newFilePath = path.join(__dirname, '..', 'public', 'uploads', 'avatars', req.file.filename);
        if (fs.existsSync(newFilePath)) {
          fs.unlink(newFilePath, (unlinkErr) => {
            if (unlinkErr) console.error('Failed to delete uploaded avatar on profile update error:', unlinkErr);
          });
        }
      }
      req.flash('error', 'Помилка при оновленні профілю.');
      res.redirect('/profile');
    }
  }
];

module.exports = {
  showProfile,
  updateProfile
};