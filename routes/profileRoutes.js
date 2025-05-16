const express = require('express');
const { showProfile, updateProfile } = require('../controllers/profileController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Profile routes - protected by authentication
router.get('/profile', requireAuth, showProfile);
router.post('/profile', requireAuth, updateProfile);

module.exports = router; 