const { body, validationResult } = require('express-validator');
const Wishlist = require('../models/Wishlist');

const showWishlists = async (req, res) => {
  try {
    const wishlists = await Wishlist.getWishlistsByUserId(req.session.user.id);
    res.render('wishlists/wishlist', { wishlists, errors: [] });
  } catch (error) {
    console.error('Error fetching wishlists:', error);
    res.render('wishlists/wishlist', { wishlists: [], errors: [{ msg: 'Не вдалося завантажити вішлісти' }] });
  }
};

const showWishlistWithWishes = async (req, res) => {
  const wishlistId = parseInt(req.params.id, 10);
  if (isNaN(wishlistId)) {
    console.error(`Invalid wishlist ID: ${req.params.id}`);
    return res.render('wishlists/wishlist-detail', { wishlist: null, wishes: [], errors: [{ msg: 'Невірний ID вішліста' }] });
  }
  console.log(`Fetching wishlist ID: ${wishlistId}, User ID: ${req.session.user.id}`);
  try {
    const wishlist = await Wishlist.getWishlistById(wishlistId, req.session.user.id);
    if (!wishlist) {
      console.log(`Wishlist not found: ID ${wishlistId}, User ID ${req.session.user.id}`);
      return res.render('wishlists/wishlist-detail', { wishlist: null, wishes: [], errors: [{ msg: 'Вішліст не знайдено' }] });
    }
    const wishes = await Wishlist.getWishesByWishlistId(wishlistId, req.session.user.id);
    res.render('wishlists/wishlist-detail', { wishlist, wishes, errors: [] });
  } catch (error) {
    console.error(`Error fetching wishlist ${wishlistId}:`, error);
    res.render('wishlists/wishlist-detail', { wishlist: null, wishes: [], errors: [{ msg: 'Не вдалося завантажити вішліст' }] });
  }
};

const createWishlist = [
  body('title').isLength({ min: 1, max: 100 }).withMessage('Назва має бути від 1 до 100 символів'),
  body('description').optional().isLength({ max: 500 }).withMessage('Опис не більше 500 символів'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const wishlists = await Wishlist.getWishlistsByUserId(req.session.user.id);
      return res.render('wishlists/wishlist', { wishlists, errors: errors.array() });
    }
    try {
      await Wishlist.createWishlist(req.session.user.id, req.body.title, req.body.description);
      res.redirect('/wishlists');
    } catch (error) {
      console.error('Error creating wishlist:', error);
      const wishlists = await Wishlist.getWishlistsByUserId(req.session.user.id);
      res.render('wishlists/wishlist', { wishlists, errors: [{ msg: 'Не вдалося створити вішліст' }] });
    }
  }
];

const updateWishlist = [
  body('title').isLength({ min: 1, max: 100 }).withMessage('Назва має бути від 1 до 100 символів'),
  body('description').optional().isLength({ max: 500 }).withMessage('Опис не більше 500 символів'),
  async (req, res) => {
    const wishlistId = parseInt(req.params.id, 10);
    if (isNaN(wishlistId)) {
      return res.render('wishlists/wishlist-detail', { wishlist: null, wishes: [], errors: [{ msg: 'Невірний ID вішліста' }] });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const wishlist = await Wishlist.getWishlistById(wishlistId, req.session.user.id);
      const wishes = await Wishlist.getWishesByWishlistId(wishlistId, req.session.user.id);
      return res.render('wishlists/wishlist-detail', { wishlist, wishes, errors: errors.array() });
    }
    try {
      await Wishlist.updateWishlist(wishlistId, req.session.user.id, req.body.title, req.body.description);
      res.redirect(`/wishlists/${wishlistId}`);
    } catch (error) {
      console.error('Error updating wishlist:', error);
      const wishlist = await Wishlist.getWishlistById(wishlistId, req.session.user.id);
      const wishes = await Wishlist.getWishesByWishlistId(wishlistId, req.session.user.id);
      res.render('wishlists/wishlist-detail', { wishlist, wishes, errors: [{ msg: 'Не вдалося оновити вішліст' }] });
    }
  }
];

const deleteWishlist = async (req, res) => {
  const wishlistId = parseInt(req.params.id, 10);
  if (isNaN(wishlistId)) {
    const wishlists = await Wishlist.getWishlistsByUserId(req.session.user.id);
    return res.render('wishlists/wishlist', { wishlists, errors: [{ msg: 'Невірний ID вішліста' }] });
  }
  try {
    await Wishlist.deleteWishlist(wishlistId, req.session.user.id);
    res.redirect('/wishlists');
  } catch (error) {
    console.error('Error deleting wishlist:', error);
    const wishlists = await Wishlist.getWishlistsByUserId(req.session.user.id);
    res.render('wishlists/wishlist', { wishlists, errors: [{ msg: 'Не вдалося видалити вішліст' }] });
  }
};

const addWish = [
  body('title').isLength({ min: 1, max: 100 }).withMessage('Назва бажання має бути від 1 до 100 символів'),
  body('description').optional().isLength({ max: 500 }).withMessage('Опис не більше 500 символів'),
  async (req, res) => {
    const wishlistId = parseInt(req.params.id, 10);
    if (isNaN(wishlistId)) {
      return res.render('wishlists/wishlist-detail', { wishlist: null, wishes: [], errors: [{ msg: 'Невірний ID вішліста' }] });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const wishlist = await Wishlist.getWishlistById(wishlistId, req.session.user.id);
      const wishes = await Wishlist.getWishesByWishlistId(wishlistId, req.session.user.id);
      return res.render('wishlists/wishlist-detail', { wishlist, wishes, errors: errors.array() });
    }
    try {
      await Wishlist.addWish(wishlistId, req.session.user.id, req.body.title, req.body.description);
      res.redirect(`/wishlists/${wishlistId}`);
    } catch (error) {
      console.error('Error adding wish:', error);
      const wishlist = await Wishlist.getWishlistById(wishlistId, req.session.user.id);
      const wishes = await Wishlist.getWishesByWishlistId(wishlistId, req.session.user.id);
      res.render('wishlists/wishlist-detail', { wishlist, wishes, errors: [{ msg: 'Не вдалося додати бажання' }] });
    }
  }
];

const editWish = [
  body('title').isLength({ min: 1, max: 100 }).withMessage('Назва бажання має бути від 1 до 100 символів'),
  body('description').optional().isLength({ max: 500 }).withMessage('Опис не більше 500 символів'),
  async (req, res) => {
    const wishlistId = parseInt(req.params.wishlistId, 10);
    const wishId = parseInt(req.params.wishId, 10);
    if (isNaN(wishlistId) || isNaN(wishId)) {
      return res.render('wishlists/wishlist-detail', { wishlist: null, wishes: [], errors: [{ msg: 'Невірний ID вішліста або бажання' }] });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const wishlist = await Wishlist.getWishlistById(wishlistId, req.session.user.id);
      const wishes = await Wishlist.getWishesByWishlistId(wishlistId, req.session.user.id);
      return res.render('wishlists/wishlist-detail', { wishlist, wishes, errors: errors.array() });
    }
    try {
      await Wishlist.editWish(wishId, wishlistId, req.session.user.id, req.body.title, req.body.description);
      res.redirect(`/wishlists/${wishlistId}`);
    } catch (error) {
      console.error('Error updating wish:', error);
      const wishlist = await Wishlist.getWishlistById(wishlistId, req.session.user.id);
      const wishes = await Wishlist.getWishesByWishlistId(wishlistId, req.session.user.id);
      res.render('wishlists/wishlist-detail', { wishlist, wishes, errors: [{ msg: 'Не вдалося оновити бажання' }] });
    }
  }
];

const deleteWish = async (req, res) => {
  const wishlistId = parseInt(req.params.wishlistId, 10);
  const wishId = parseInt(req.params.wishId, 10);
  if (isNaN(wishlistId) || isNaN(wishId)) {
    const wishlist = await Wishlist.getWishlistById(wishlistId, req.session.user.id);
    const wishes = await Wishlist.getWishesByWishlistId(wishlistId, req.session.user.id);
    return res.render('wishlists/wishlist-detail', { wishlist, wishes, errors: [{ msg: 'Невірний ID вішліста або бажання' }] });
  }
  try {
    await Wishlist.deleteWish(wishId, wishlistId, req.session.user.id);
    res.redirect(`/wishlists/${wishlistId}`);
  } catch (error) {
    console.error('Error deleting wish:', error);
    const wishlist = await Wishlist.getWishlistById(wishlistId, req.session.user.id);
    const wishes = await Wishlist.getWishesByWishlistId(wishlistId, req.session.user.id);
    res.render('wishlists/wishlist-detail', { wishlist, wishes, errors: [{ msg: 'Не вдалося видалити бажання' }] });
  }
};

module.exports = {
  showWishlists,
  showWishlistWithWishes,
  createWishlist,
  updateWishlist,
  deleteWishlist,
  addWish,
  editWish,
  deleteWish
};