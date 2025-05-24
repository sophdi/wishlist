const bcrypt = require('bcryptjs');
const { AuthError, ERROR_MESSAGES } = require('../utils/errors');
const User = require('../models/User');

class AuthService {
  // Перевірка email і пароля
  async validateCredentials(email, password) {
    const user = await User.findUserByEmail(email);

    if (!user) {
      throw new AuthError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthError(ERROR_MESSAGES.INVALID_CREDENTIALS, 401);
    }

    return user;
  }

  // Створення сесії користувача
  async createUserSession(req, user) {
    return new Promise((resolve, reject) => {
      req.session.regenerate((err) => {
        if (err) {
          reject(new AuthError(ERROR_MESSAGES.SESSION_ERROR, 500));
          return;
        }

        req.session.user = {
          id: user.id,
          username: user.username,
          profile_image_url: user.profile_image_url
        };

        req.session.save((err) => {
          if (err) {
            reject(new AuthError(ERROR_MESSAGES.SESSION_ERROR, 500));
            return;
          }
          resolve();
        });
      });
    });
  }
  
  // Перевірка унікальності email
  async checkEmailAvailability(email) {
    const existingUser = await User.findUserByEmail(email);
    if (existingUser) {
      throw new AuthError(ERROR_MESSAGES.EMAIL_TAKEN, 409);
    }
    return true;
  }
}

module.exports = new AuthService();