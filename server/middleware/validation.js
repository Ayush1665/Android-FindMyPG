const { body, validationResult } = require('express-validator');

const validatePG = [
  body('name').notEmpty().withMessage('Name is required'),
  body('rent').notEmpty().withMessage('Rent is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('contact.manager').notEmpty().withMessage('Manager name is required'),
  body('contact.phone').notEmpty().withMessage('Phone number is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = {
  validatePG
};