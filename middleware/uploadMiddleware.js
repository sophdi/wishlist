//middleware/uploadMiddleware.js

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Шляхи для збереження файлів
const avatarUploadPath = path.join(__dirname, '..', 'public', 'uploads', 'avatars');
const wishPhotoUploadPath = path.join(__dirname, '..', 'public', 'uploads', 'wishes');

// Створюємо директорії для збереження файлів
[avatarUploadPath, wishPhotoUploadPath].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Генерує унікальне ім'я файлу для аватарки
const generateAvatarFilename = (file) => {
  const uuid = uuidv4();
  const timestamp = Date.now();
  const ext = path.extname(file.originalname).toLowerCase();
  return `${timestamp}-${uuid}${ext}`;
};

// Оптимізована функція генерації імені файлу
const generateUniqueFilename = (file) => {
  const uuid = uuidv4();
  const ext = path.extname(file.originalname).toLowerCase();
  return `${uuid}${ext}`;
};

// Генерує унікальні імена файлів для фото бажань
const generateWishPhotoFilenames = (file) => {
  const uuid = uuidv4();
  const ext = path.extname(file.originalname).toLowerCase();
  return {
    temp: `${uuid}_temp${ext}`,
    final: `${uuid}${ext}`
  };
};

// Фільтр для зображень
const imageFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Дозволено завантажувати лише зображення!'), false);
  }
};

// Налаштування для збереження аватарок
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarUploadPath),
  filename: (req, file, cb) => cb(null, generateUniqueFilename(file))
});

// Налаштування для збереження фото бажань
const wishPhotoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, wishPhotoUploadPath),
  filename: (req, file, cb) => {
    const fileNames = generateWishPhotoFilenames(file);
    req.generatedFileNames = fileNames;
    cb(null, fileNames.temp);
  }
});

// Middleware для завантаження аватарок (до 5MB, лише зображення)
const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 1024 * 1024 * 5 },
});

// Middleware для завантаження фото бажань (до 5MB, лише зображення)
const uploadWishPhoto = multer({
  storage: wishPhotoStorage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 1024 * 1024 * 5 },
});

module.exports = { uploadAvatar, uploadWishPhoto };
