// services/userService.js
const User = require('../models/User');

// Пошук користувача за email
const findUserByEmail = async (email) => {
  return await User.findUserByEmail(email);
};

// Створення нового користувача
const createUser = async (username, email, hashedPassword) => {
  return await User.createUser(username, email, hashedPassword);
};

module.exports = { findUserByEmail, createUser };