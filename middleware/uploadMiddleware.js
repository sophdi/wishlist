const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Перевірка та створення директорії, якщо вона не існує
const avatarUploadPath = path.join(__dirname, '..', 'public', 'uploads', 'avatars');
if (!fs.existsSync(avatarUploadPath)) {
  fs.mkdirSync(avatarUploadPath, { recursive: true });
}

// Налаштування сховища для файлів
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarUploadPath); // Шлях для збереження аватарок
  },
  filename: function (req, file, cb) {
    // Генерація унікального імені файлу
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Фільтр для типів файлів (дозволяємо тільки зображення)
const avatarFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Дозволено завантажувати лише зображення!'), false);
  }
};

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5, // Обмеження розміру файлу 5MB
  },
});

module.exports = { uploadAvatar };