const {
  check
} = require('express-validator');
exports.validSign = [
  check('username', 'Username is required').notEmpty()
  .isLength({
      min: 1,
      max: 32
  }).withMessage('username must be between 1 to 32 characters'),
  check('fullname', 'FullName is required').notEmpty(),
  check('email')
  .isEmail()
  .withMessage('Must be a valid email address'),
  check('password', 'password is required').notEmpty(),
  check('password').isLength({
      min: 1
  }).withMessage('Password must contain at least 1 characters'),
  check('role', 'Role is required').notEmpty()
]

exports.validLogin = [
  check('username', 'username is required').notEmpty(),
  check('password', 'password is required').notEmpty(),
  check('password').isLength({
      min: 1
  }).withMessage('Password must contain at least 1 characters')
]


exports.forgetPasswordValidator = [
  check('email')
      .not()
      .isEmpty()
      .isEmail()
      .withMessage('Must be a valid email address')
];

exports.resetPasswordValidator = [
  check('newPassword')
      .not()
      .isEmpty()
      .isLength({ min: 1 })
      .withMessage('Password must be at least  1 characters long')
];