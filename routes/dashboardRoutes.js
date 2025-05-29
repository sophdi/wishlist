const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/authMiddleware').requireAuth;
const Wishlist = require('../models/Wishlist');
const User = require('../models/User');

router.get('/dashboard', requireAuth, async (req, res) => {
  const user = await User.findUserById(req.session.user.id); // <-- тут завжди актуальні дані
  const wishlists = await Wishlist.findAll(user.id);
  res.render('dashboard', { user, wishlists });
});

module.exports = router;