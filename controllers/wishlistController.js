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
      return res.render('wishlists/wishlist-detail', {
        wishlist: null,
        wishes: [],
        sort: 'created_desc', // додати!
        errors: [{ msg: 'Невірний ID вішліста' }]
      });
    }

    try {
      const wishlist = await Wishlist.findById(wishlistId, req.session.user.id);

      if (!wishlist) {
        return res.render('wishlists/wishlist-detail', {
          wishlist: null,
          wishes: [],
          sort: 'created_desc', // додати!
          errors: [{ msg: 'Вішліст не знайдено' }]
        });
      }

      const wishes = await Wish.findByWishlistId(wishlistId);

      res.render('wishlists/wishlist-detail', {
        wishlist,
        wishes,
        sort: 'created_desc', // додати!
        errors: [],
        success: req.flash('success')
      });
    } catch (error) {
      console.error('Error fetching wishlist details:', error);
      res.render('wishlists/wishlist-detail', {
        wishlist: null,
        wishes: [],
        sort: 'created_desc', // додати!
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
    const userId = req.user.id;
    const q = req.query.q || '';
    try {
      const wishlists = await Wishlist.search(userId, q);
      res.json({ success: true, wishlists });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Search error' });
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
        sortOrder: req.query.sortOrder === 'desc' ? 'DESC' : 'ASC'
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

  /**
   * Деталі вішліста з можливістю сортування бажань
   */
  static async getWishlistDetail(req, res) {
    const wishlistId = req.params.id;
    const sort = req.query.sort || 'created_desc';

    let orderBy;
    switch (sort) {
      case 'title_asc':
        orderBy = 'title ASC';
        break;
      case 'price_asc':
        orderBy = 'price ASC';
        break;
      case 'price_desc':
        orderBy = 'price DESC';
        break;
      case 'created_desc':
      default:
        orderBy = 'created_at DESC';
        break;
    }

    try {
      const wishlist = await Wishlist.findById(wishlistId, req.session.user.id);

      if (!wishlist) {
        return res.render('wishlists/wishlist-detail', {
          wishlist: null,
          wishes: [],
          sort: sort || 'created_desc',
          errors: [{ msg: 'Вішліст не знайдено' }]
        });
      }

      const wishes = await Wish.findByWishlistId(wishlistId, orderBy);

      res.render('wishlists/wishlist-detail', {
        wishlist,
        wishes,
        sort: sort || 'created_desc',
        errors: [],
        success: req.flash('success')
      });
    } catch (error) {
      console.error('Error fetching wishlist details:', error);
      res.render('wishlists/wishlist-detail', {
        wishlist: null,
        wishes: [],
        sort: sort || 'created_desc',
        errors: [{ msg: 'Помилка завантаження вішліста' }]
      });
    }
  }

  /**
   * Повертає бажання у форматі JSON з можливістю сортування
   */
  static async getWishesJson(req, res) {
    const wishlistId = req.params.id;
    const sort = req.query.sort || 'created_desc';
    let orderBy;
    switch (sort) {
      case 'title_asc': orderBy = 'title ASC'; break;
      case 'price_asc': orderBy = 'price ASC'; break;
      case 'price_desc': orderBy = 'price DESC'; break;
      case 'created_desc':
      default: orderBy = 'created_at DESC'; break;
    }
    try {
      const wishes = await Wish.findByWishlistId(wishlistId, orderBy);
      res.json({ success: true, wishes });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Помилка завантаження' });
    }
  }
}

module.exports = WishlistController;