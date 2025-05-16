import { FormValidator } from './utils/validation.js';

document.addEventListener('DOMContentLoaded', () => {
  const validationRules = {
    email: { required: true },
    password: { required: true }
  };

  new FormValidator('loginForm', validationRules);
}); 