// controllers/wishController.js
const Wish = require('../models/Wish');
const Wishlist = require('../models/Wishlist'); // Додано для роботи з моделлю Wishlist
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { validationResult } = require('express-validator');

class WishController {
  // Створення нового бажання
  static async createWish(req, res) {
    try {
      // Валідація вхідних даних
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          success: false
        });
      }

      const wishlistId = parseInt(req.params.wishlistId, 10);
      let imageUrl = null;
      if (req.file && req.generatedFileNames) {
        const tempPath = req.file.path;
        const finalPath = path.join(path.dirname(tempPath), req.generatedFileNames.final);

        // Обробка зображення
        await sharp(tempPath)
          .resize(800, 800, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: 80 })
          .toFile(finalPath);

        // Видаляємо тимчасовий файл
        await fs.unlink(tempPath);

        // Формуємо URL для збереження в БД
        imageUrl = `/uploads/wishes/${req.generatedFileNames.final}`;
      }
      // Формуємо дані для збереження
      const wishData = {
        title: req.body.title,
        description: req.body.description,
        price: req.body.price ? parseFloat(req.body.price) : null,
        currency: req.body.currency,
        priority: req.body.priority,
        link: req.body.link,
        image_url: imageUrl
      };

      const wishId = await Wish.create(wishlistId, wishData);
      const newWish = await Wish.findById(wishId, wishlistId);

      // Відповідь у форматі JSON для AJAX або редірект
      if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
        return res.json({
          success: true,
          wish: newWish,
          message: 'Бажання успішно створено'
        });
      }

      req.flash('success', 'Бажання успішно створено');
      res.redirect(`/wishlists/${wishlistId}`);

    } catch (error) {
      console.error('Error creating wish:', error);

      // Якщо сталася помилка і файл був завантажений — видаляємо його
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }

      if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
        return res.status(500).json({
          success: false,
          errors: [{ msg: 'Помилка при створенні бажання' }]
        });
      }

      req.flash('error', 'Помилка при створенні бажання');
      res.redirect(`/wishlists/${wishlistId}`);
    }
  }


  // Оновлення бажання
  static async updateWish(req, res) {
    try {
      // Валідація вхідних даних
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          success: false
        });
      }
      // Отримуємо поточне бажання для перевірки зображення
      const wishlistId = parseInt(req.params.wishlistId, 10);
      const wishId = parseInt(req.params.wishId, 10);

      // Отримуємо поточне бажання для перевірки зображення
      const currentWish = await Wish.findById(wishId, wishlistId);
      if (!currentWish) {
        throw new Error('Wish not found');
      }

      let imageUrl = currentWish.image_url;
      if (req.file && req.generatedFileNames) {
        const tempPath = req.file.path;
        const finalPath = path.join(path.dirname(tempPath), req.generatedFileNames.final);

        // Обробка нового зображення
        await sharp(tempPath)
          .resize(800, 800, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .jpeg({ quality: 80 })
          .toFile(finalPath);

        // Видаляємо тимчасовий файл
        await fs.unlink(tempPath);

        // Видаляємо старе зображення
        if (currentWish.image_url) {
          const oldImagePath = path.join(__dirname, '..', 'public', currentWish.image_url);
          try {
            await fs.access(oldImagePath);
            await fs.unlink(oldImagePath);
          } catch (error) {
            console.error('Error removing old image:', error);
          }
        }

        imageUrl = `/uploads/wishes/${req.generatedFileNames.final}`;
      }
      // Формуємо дані для оновлення
      const wishData = {
        title: req.body.title,
        description: req.body.description,
        price: req.body.price ? parseFloat(req.body.price) : null,
        currency: req.body.currency,
        priority: req.body.priority,
        status: req.body.status,
        link: req.body.link,
        image_url: imageUrl
      };
      // Оновлюємо бажання в БД
      const updated = await Wish.update(wishId, wishlistId, wishData);
      if (!updated) {
        throw new Error('Failed to update wish');
      }

      const updatedWish = await Wish.findById(wishId, wishlistId);
      // Відповідь у форматі JSON для AJAX або редірект
      if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
        return res.json({
          success: true,
          wish: updatedWish,
          message: 'Бажання успішно оновлено'
        });
      }

      req.flash('success', 'Бажання успішно оновлено');
      res.redirect(`/wishlists/${wishlistId}`);

    } catch (error) {
      console.error('Error updating wish:', error);

      // Видаляємо завантажений файл у разі помилки
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }

      if (req.xhr || (req.headers.accept && req.headers.accept.includes('application/json'))) {
        return res.status(500).json({
          success: false,
          errors: [{ msg: 'Помилка при оновленні бажання' }]
        });
      }

      req.flash('error', 'Помилка при оновленні бажання');
      res.redirect(`/wishlists/${wishlistId}`);
    }
  }

  // Зміна статусу бажання
  static async updateWishStatus(req, res) {
    try {
      const wishlistId = parseInt(req.params.wishlistId, 10);
      const wishId = parseInt(req.params.wishId, 10);
      const { status } = req.body;

      // Перевірка валідності статусу через константи моделі
      if (!Wish.CONSTANTS.STATUSES.includes(status)) {
        throw new Error('Invalid status');
      }

      const updated = await Wish.updateStatus(wishId, wishlistId, status);

      if (!updated) {
        throw new Error('Wish not found or unauthorized');
      }

      if (req.xhr) {
        return res.json({
          success: true,
          message: 'Статус успішно оновлено'
        });
      }

      req.flash('success', 'Статус успішно оновлено');
      res.redirect(`/wishlists/${wishlistId}`);

    } catch (error) {
      console.error('Error updating wish status:', error);
      if (req.xhr) {
        return res.status(500).json({
          success: false,
          errors: [{ msg: 'Помилка при оновленні статусу' }]
        });
      }
      req.flash('error', 'Помилка при оновленні статусу');
      res.redirect(`/wishlists/${wishlistId}`);
    }
  }

  // Видалення бажання
  static async deleteWish(req, res) {
    try {
      const wishlistId = parseInt(req.params.wishlistId, 10);
      const wishId = parseInt(req.params.wishId, 10);

      const deleted = await Wish.delete(wishId, wishlistId);

      if (!deleted) {
        throw new Error('Wish not found or unauthorized');
      }

      if (req.xhr) {
        return res.json({
          success: true,
          message: 'Бажання успішно видалено'
        });
      }

      req.flash('success', 'Бажання успішно видалено');
      res.redirect(`/wishlists/${wishlistId}`);

    } catch (error) {
      console.error('Error deleting wish:', error);
      if (req.xhr) {
        return res.status(500).json({
          success: false,
          errors: [{ msg: 'Помилка при видаленні бажання' }]
        });
      }
      req.flash('error', 'Помилка при видаленні бажання');
      res.redirect(`/wishlists/${wishlistId}`);
    }
  }

  // Показати деталі бажання
  static async showWishDetail(req, res) {
    try {
      const wishlistId = parseInt(req.params.wishlistId, 10);
      const wishId = parseInt(req.params.wishId, 10);

      const wish = await Wish.findById(wishId, wishlistId);
      const wishlist = await Wishlist.findById(wishlistId, req.session.user.id); // додати цей рядок

      if (!wish) {
        return res.status(404).render('404', { message: 'Бажання не знайдено' });
      }

      res.render('wishlists/wish-detail', { wish, wishlist }); // додати wishlist
    } catch (error) {
      console.error('Error fetching wish detail:', error);
      res.status(500).render('500', { message: 'Помилка сервера' });
    }
  }
}

module.exports = WishController;