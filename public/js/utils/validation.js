// Validation patterns
const PATTERNS = {
  username: /^[a-zA-Zа-яА-ЯіІїЇєЄґҐ\s-]{2,30}$/,
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
};

// Error messages
const ERROR_MESSAGES = {
  username: {
    invalid: "Ім'я користувача має бути від 2 символів",
    required: "Ім'я користувача обов'язкове",
  },
  email: {
    invalid: 'Будь ласка, введіть коректний email',
    required: 'Email обов\'язковий',
  },
  password: {
    invalid: 'Пароль має бути щонайменше 6 символів',
    required: 'Пароль обов\'язковий',
  },
};

// Validation functions
const validators = {
  username: (value) => ({
    isValid: PATTERNS.username.test(value),
    message: ERROR_MESSAGES.username.invalid,
  }),
  
  email: (value) => ({
    isValid: PATTERNS.email.test(value),
    message: ERROR_MESSAGES.email.invalid,
  }),
  
  password: (value) => ({
    isValid: value.length >= 6,
    message: ERROR_MESSAGES.password.invalid,
  }),
};

// Form validation class
class FormValidator {
  constructor(formId, validationRules) {
    this.form = document.getElementById(formId);
    this.rules = validationRules;
    this.errors = {};
    this.setupValidation();
  }

  setupValidation() {
    // Add input event listeners
    Object.keys(this.rules).forEach(fieldName => {
      const input = this.form.querySelector(`[name="${fieldName}"]`);
      const errorElement = document.getElementById(`${fieldName}Error`);
      
      if (input && errorElement) {
        input.addEventListener('input', () => {
          this.validateField(fieldName, input.value, errorElement);
        });
      }
    });

    // Add form submit handler
    this.form.addEventListener('submit', (e) => {
      if (!this.validateForm()) {
        e.preventDefault();
      }
    });
  }

  validateField(fieldName, value, errorElement) {
    const rule = this.rules[fieldName];
    const validator = validators[fieldName];
    
    if (!value && rule.required) {
      this.showError(errorElement, ERROR_MESSAGES[fieldName].required);
      return false;
    }

    if (value && validator) {
      const { isValid, message } = validator(value);
      if (!isValid) {
        this.showError(errorElement, message);
        return false;
      }
    }

    this.hideError(errorElement);
    return true;
  }

  validateForm() {
    let isValid = true;
    
    Object.keys(this.rules).forEach(fieldName => {
      const input = this.form.querySelector(`[name="${fieldName}"]`);
      const errorElement = document.getElementById(`${fieldName}Error`);
      
      if (input && errorElement) {
        if (!this.validateField(fieldName, input.value, errorElement)) {
          isValid = false;
        }
      }
    });

    return isValid;
  }

  showError(element, message) {
    element.textContent = message;
    element.classList.remove('hidden');
  }

  hideError(element) {
    element.classList.add('hidden');
  }
}

export { FormValidator, validators, ERROR_MESSAGES }; 