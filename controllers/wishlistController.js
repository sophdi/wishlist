//controllers/wishlistController.js
const Wishlist = require('../models/Wishlist');
const Wish = require('../models/Wish');
const { validationResult } = require('express-validator');

class WishlistController {
  /**
     * Відображає всі вішлісти користувача.
     * - Отримує всі вішлісти з БД.
     * - Передає порожній об'єкт wishlist для форми створення (щоб уникнути undefined у шаблоні).
     * - Передає повідомлення про успіх через flash.
     */
  static async showWishlists(req, res) {
    try {
      const wishlists = await Wishlist.findAll(req.session.user.id);
      res.render('wishlists/wishlist', {
        wishlists,
        wishlist: {}, // Порожній об'єкт для форми створення
        errors: [],
        success: req.flash('success')
      });
    } catch (error) {
      console.error('Error fetching wishlists:', error);
      res.render('wishlists/wishlist', {
        wishlists: [],
        wishlist: {},
        errors: [{ msg: 'Помилка завантаження вішлістів' }]
      });
    }
  }

  /**
     * Відображає конкретний вішліст разом з бажаннями.
     * - Перевіряє валідність ID.
     * - Отримує вішліст та пов'язані бажання з БД.
     * - Обробляє випадки, коли вішліст не знайдено.
     */
  static async showWishlistWithWishes(req, res) {
    const wishlistId = parseInt(req.params.id, 10);

    if (isNaN(wishlistId)) {
      // Некоректний ID — повертаємо помилку
      return res.render('wishlists/wishlist-detail', {
        wishlist: null,
        wishes: [],
        errors: [{ msg: 'Невірний ID вішліста' }]
      });
    }

    try {
      const wishlist = await Wishlist.findById(wishlistId, req.session.user.id);

      if (!wishlist) {
        // Вішліст не знайдено або не належить користувачу
        return res.render('wishlists/wishlist-detail', {
          wishlist: null,
          wishes: [],
          errors: [{ msg: 'Вішліст не знайдено' }]
        });
      }

      const wishes = await Wish.findByWishlistId(wishlistId);

      res.render('wishlists/wishlist-detail', {
        wishlist,
        wishes,
        errors: [],
        success: req.flash('success')
      });
    } catch (error) {
      console.error('Error fetching wishlist details:', error);
      res.render('wishlists/wishlist-detail', {
        wishlist: null,
        wishes: [],
        errors: [{ msg: 'Помилка завантаження вішліста' }]
      });
    }
  }

  /**
   * Створює новий вішліст.
   * - Валідує дані форми.
   * - У разі помилки повертає форму з помилками та вже існуючими вішлістами.
   * - Успішно створює вішліст і редіректить на список.
   */
  static async create(req, res) {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render('wishlists/wishlist', {
        wishlists: await Wishlist.findAll(req.session.user.id),
        wishlist: {},
        errors: errors.array()
      });
    }

    try {
      await Wishlist.create(req.session.user.id, {
        title: req.body.title,
        description: req.body.description
      });

      req.flash('success', 'Вішліст успішно створено');
      res.redirect('/wishlists');
    } catch (error) {
      console.error('Error creating wishlist:', error);
      res.render('wishlists/wishlist', {
        wishlists: await Wishlist.findAll(req.session.user.id),
        wishlist: {},
        errors: [{ msg: 'Помилка створення вішліста' }],
        success: req.flash('success'),
        error: req.flash('error')
      });
    }
  }

  /**
   * Оновлює існуючий вішліст.
   * - Валідує дані.
   * - У разі помилки повертає форму з поточними даними та помилками.
   * - Оновлює вішліст у БД, якщо користувач має на це право.
   */
  static async update(req, res) {
    const wishlistId = parseInt(req.params.id, 10);
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render('wishlists/wishlist-detail', {
        wishlist: await Wishlist.findById(wishlistId, req.session.user.id),
        wishes: await Wish.findByWishlistId(wishlistId),
        errors: errors.array()
      });
    }

    try {
      const updated = await Wishlist.update(wishlistId, req.session.user.id, {
        title: req.body.title,
        description: req.body.description
      });

      if (!updated) {
        throw new Error('Wishlist not found or unauthorized');
      }

      req.flash('success', 'Вішліст успішно оновлено');
      res.redirect(`/wishlists/${wishlistId}`);
    } catch (error) {
      console.error('Error updating wishlist:', error);
      res.render('wishlists/wishlist-detail', {
        wishlist: await Wishlist.findById(wishlistId, req.session.user.id),
        wishes: await Wish.findByWishlistId(wishlistId),
        errors: [{ msg: 'Помилка оновлення вішліста' }]
      });
    }
  }

  /**
   * Видаляє вішліст користувача.
   * - Перевіряє права доступу.
   * - Видаляє вішліст та всі пов'язані бажання (це реалізовано у моделі).
   * - Поверт��є повідомлення про успіх або помилку.
   */
  static async delete(req, res) {
    const wishlistId = parseInt(req.params.id, 10);

    try {
      const deleted = await Wishlist.delete(wishlistId, req.session.user.id);

      if (!deleted) {
        throw new Error('Wishlist not found or unauthorized');
      }

      req.flash('success', 'Вішліст успішно видалено');
      res.redirect('/wishlists');
    } catch (error) {
      console.error('Error deleting wishlist:', error);
      req.flash('error', 'Помилка видалення вішліста');
      res.redirect('/wishlists');
    }
  }

  /**
   * Пошук по вішлістах
   */
  static async searchWishlists(req, res) {
    try {
      const searchTerm = req.query.q || '';
      const wishlists = await Wishlist.search(req.session.user.id, searchTerm);
      
      // Якщо AJAX запит
      if (req.xhr || req.headers.accept.includes('application/json')) {
        return res.json({
          success: true,
          wishlists: wishlists
        });
      }

      // Звичайний HTTP запит
      res.render('wishlists/index', {
        wishlists: wishlists,
        searchTerm: searchTerm,
        errors: []
      });
    } catch (error) {
      console.error('Error searching wishlists:', error);
      const errorMessage = 'Помилка при пошуку вішлістів';
      
      if (req.xhr || req.headers.accept.includes('application/json')) {
        return res.status(500).json({
          success: false,
          error: errorMessage
        });
      }
      
      res.render('wishlists/index', {
        wishlists: [],
        searchTerm: req.query.q || '',
        errors: [{ msg: errorMessage }]
      });
    }
  }

  /**
   * Пошук бажань в конкретному вішлісті
   */
  static async searchWishes(req, res) {
    try {
      const wishlistId = req.params.id;
      const searchTerm = req.query.q || '';
      const options = {
        includePriority: req.query.includePriority === 'true',
        includeStatus: req.query.includeStatus === 'true',
        includePrice: req.query.includePrice === 'true',
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };

      const wishes = await Wish.search(wishlistId, searchTerm, options);
      
      res.json({
        success: true,
        wishes: wishes
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({
        success: false,
        error: 'Помилка пошуку'
      });
    }
  }
}

module.exports = WishlistController;