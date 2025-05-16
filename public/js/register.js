import { FormValidator } from './utils/validation.js';

document.addEventListener('DOMContentLoaded', () => {
  const validationRules = {
    username: { required: true },
    email: { required: true },
    password: { required: true }
  };

  new FormValidator('registerForm', validationRules);
}); 