//controllers/wishlistController.js

const Wishlist = require('../models/Wishlist');
const Wish = require('../models/Wish');

/* --- Списки бажань --- */

/**
 * Відображає всі списки бажань користувача
 */
const showWishlists = async (req, res) => {
  try {
    const wishlists = await Wishlist.getUserWishlistsWithCount(
      req.session.user.id
    );
    res.render('wishlists/wishlist', { wishlists, user: req.session.user });
  } catch (err) {
    console.error('Помилка отримання списків бажань:', err);
    res.redirect('/');
  }
};

/**
 * Створює новий список бажань
 */
const createWishlist = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  const { title, description } = req.body;
  try {
    await Wishlist.createWishlist(
      req.session.user.id,
      title,
      description || null
    );
    res.redirect('/wishlists');
  } catch (err) {
    console.error('Помилка створення списку бажань:', err);
    res.redirect('/wishlists');
  }
};

/**
 * Оновлює список бажань
 */
const updateWishlist = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  const { id } = req.params;
  const { title, description } = req.body;

  try {
    await Wishlist.updateWishlist(
      id,
      req.session.user.id,
      title,
      description || null
    );
    res.redirect(`/wishlists/${id}`);
  } catch (err) {
    console.error('Помилка оновлення списку бажань:', err);
    res.redirect('/wishlists');
  }
};

/**
 * Видаляє список бажань
 */
const deleteWishlist = async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  const { id } = req.params;

  try {
    await Wishlist.deleteWishlist(id, req.session.user.id);
    res.redirect('/wishlists');
  } catch (err) {
    console.error('Помилка видалення списку бажань:', err);
    res.redirect('/wishlists');
  }
};

/**
 * Відображає список бажань із його елементами
 */
const showWishlistWithWishes = async (req, res) => {
  const { id } = req.params;

  try {
    const wishlists = await Wishlist.getUserWishlists(req.session.user.id);
    const wishes = await Wish.getWishesByWishlistId(id);
    const wishlist = wishlists.find((wl) => wl.id == id);

    if (!wishlist) {
      return res.redirect('/wishlists');
    }

    res.render('wishlists/wishlist-item', {
      wishlists,
      wishes,
      user: req.session.user,
      currentWishlistId: id,
      wishlist,
    });
  } catch (err) {
    console.error('Помилка отримання бажань:', err);
    res.redirect('/wishlists');
  }
};

/* --- Бажання --- */

/**
 * Додає нове бажання до списку
 */
const addWish = async (req, res) => {
  const { id } = req.params;
  const { title, description, price, currency, priority, link } = req.body;

  try {
    await Wish.createWish(
      id,
      title,
      description,
      price,
      currency,
      priority,
      link
    );
    res.redirect(`/wishlists/${id}`);
  } catch (err) {
    console.error('Помилка додавання бажання:', err);
    res.redirect(`/wishlists/${id}`);
  }
};

/**
 * Оновлює бажання
 */
const editWish = async (req, res) => {
  const { wishId, wishlistId } = req.params;
  const { title, description, price, currency, priority, link } = req.body;

  try {
    await Wish.updateWish(
      wishId,
      title,
      description,
      price,
      currency,
      priority,
      link
    );
    res.redirect(`/wishlists/${wishlistId}`);
  } catch (err) {
    console.error('Помилка редагування бажання:', err);
    res.redirect(`/wishlists/${wishlistId}`);
  }
};

/**
 * Видаляє бажання
 */
const deleteWish = async (req, res) => {
  const { wishlistId, wishId } = req.params;

  try {
    const wishlist = await Wishlist.getWishlistById(wishlistId);

    if (!wishlist || wishlist.user_id !== req.session.user.id) {
      return res.redirect('/wishlists');
    }

    await Wish.deleteWish(wishId);
    res.redirect(`/wishlists/${wishlistId}`);
  } catch (err) {
    console.error('Помилка видалення бажання:', err);
    res.redirect(`/wishlists/${wishlistId}`);
  }
};

module.exports = {
  showWishlists,
  createWishlist,
  updateWishlist,
  deleteWishlist,
  showWishlistWithWishes,
  addWish,
  editWish,
  deleteWish,
};
