const Wishlist = require('../models/Wishlist');
const Wish = require('../models/Wish');
const User = require('../models/User');

exports.showDashboard = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const user = await User.findUserById(userId); // Має повертати всі потрібні поля: username, birthday, about_me, profile_image_url, тощо
    const wishlists = await Wishlist.findAll(userId);
    const totalWishes = await Wish.countByUserId(userId);

    res.render('dashboard', {
      user,
      wishlists,
      totalWishes
    });
  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.status(500).render('error', { message: 'Помилка при завантаженні дашборду' });
  }
};