class AuthError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
  }
}

const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Невірний email або пароль',
  USER_NOT_FOUND: 'Користувача з таким email не знайдено',
  SERVER_ERROR: 'Сталася помилка сервера. Спробуйте пізніше',
  VALIDATION_ERROR: 'Помилка валідації даних',
  SESSION_ERROR: 'Помилка сесії. Спробуйте ще раз',
  EMAIL_TAKEN: 'Ця електронна адреса вже використовується',
  INVALID_EMAIL: 'Невірний формат email'
};

module.exports = {
  AuthError,
  ERROR_MESSAGES
};