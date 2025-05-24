//services/wishlistService.js
const Wishlist = require('../models/Wishlist');

// Повертає всі вішлісти користувача
const getWishlistsByUserId = async (userId) => {
  return await Wishlist.getWishlistsByUserId(userId);
};

// Отримати вішліст з усіма бажаннями користувача
const getWishlistWithWishes = async (wishlistId, userId) => {
  const wishlist = await Wishlist.getWishlistById(wishlistId, userId);
  if (!wishlist) return null;

  const wishes = await Wishlist.getWishesByWishlistId(wishlistId, userId);
  return { wishlist, wishes };
};

const createWishlist = async (userId, title, description) => {
  return await Wishlist.createWishlist(userId, title, description);
};

const updateWishlist = async (wishlistId, userId, title, description) => {
  return await Wishlist.updateWishlist(wishlistId, userId, title, description);
};

const deleteWishlist = async (wishlistId, userId) => {
  await validateWishlistExists(wishlistId, userId);
  return await Wishlist.deleteWishlist(wishlistId, userId);
};

const addWish = async (wishlistId, title, description) => {
  return await Wishlist.addWish(wishlistId, title, description);
};

const getWishesByWishlistId = async (wishlistId) => {
  return await Wishlist.getWishesByWishlistId(wishlistId);
};

const editWish = async (wishId, wishlistId, title, description) => {
  return await Wishlist.editWish(wishId, wishlistId, title, description);
};

const deleteWish = async (wishId, wishlistId) => {
  return await Wishlist.deleteWish(wishId, wishlistId);
};

// Кидає помилку, якщо вішліст не знайдено
const validateWishlistExists = async (wishlistId, userId) => {
  const wishlist = await Wishlist.getWishlistById(wishlistId, userId);
  if (!wishlist) {
    throw new Error('Wishlist not found');
  }
};

module.exports = {
  getWishlistsByUserId,
  getWishlistWithWishes,
  createWishlist,
  updateWishlist,
  deleteWishlist,
  addWish,
  getWishesByWishlistId,
  editWish,
  deleteWish,
  validateWishlistExists,
};